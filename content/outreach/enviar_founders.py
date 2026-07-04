#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Envío uno-a-uno de invitaciones a especialistas fundadores de OficiosPro.

- Personaliza cada correo con el saludo ("Hola Don Pedro, ...").
- Desfase de 21 segundos entre correos (anti-spam).
- Tope diario configurable (default 110). Cuando lo completa, se detiene.
- REANUDA SOLO: lleva registro en enviados_log.csv. Al activarlo de nuevo
  (al día siguiente), continúa con los siguientes que faltan, respetando
  el tope diario contando lo ya enviado HOY.

USO SEGURO:
  1. Por defecto DRY-RUN: no envía, solo muestra lo que haría.
  2. Envío real: --send  + variables de entorno SMTP.
  3. Nunca pongas tu clave en el archivo. Usa variables de entorno:
       SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS FROM_NAME FROM_EMAIL
  4. Respeta consentimiento=no y estado=no_contactar.

Ejemplos:
  # Prueba (no envía):
  python3 enviar_founders.py --diario 110

  # Envío real, tope 110/día, empezando por locales:
  export SMTP_HOST=smtp.gmail.com SMTP_PORT=587
  export SMTP_USER=bperez@oficiospro.cl SMTP_PASS='clave_de_aplicacion'
  export FROM_NAME='Benjamin Perez' FROM_EMAIL=bperez@oficiospro.cl
  python3 enviar_founders.py --send --diario 110

  # Al día siguiente: MISMO comando -> manda los siguientes 110.
"""
import argparse, csv, os, smtplib, ssl, sys, time
from email.mime.text import MIMEText
from email.utils import formataddr
from datetime import datetime, date

LINK = "https://www.oficiospro.cl/especialistas-fundadores?utm_source=email&utm_medium=direct&utm_campaign=sec_founders&utm_content=gas"
DESFASE = 21  # segundos entre cada correo

ASUNTO = "Te invito a ser founder de OficiosPro, {primer_nombre}"

CUERPO = """\
{saludo}, ¿cómo estás?

Estoy creando OficiosPro.cl, una plataforma para darle más vitrina a personas que trabajan bien en oficios.

La idea es que especialistas como tú puedan mostrar sus servicios, comunas y trabajos en un perfil más profesional. Queremos que tu oficio se vea y brille más.

Te invito a crear tu perfil de founder, que será solo para los primeros 100 perfiles:
{link}

Que tengas buen día,
Benjamín Pérez
Founder, OficiosPro.cl

(Si prefieres que no te vuelva a escribir, respóndeme "no gracias" y listo.)
"""

def cargar(path):
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))

def leer_log(log_path):
    """Devuelve (set de emails ya enviados, cuántos se enviaron HOY)."""
    enviados = set(); hoy = 0
    if not os.path.exists(log_path):
        return enviados, hoy
    hoy_str = date.today().isoformat()
    with open(log_path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            em = row.get("email")
            estado = (row.get("estado") or "")
            if em and estado.startswith("enviado"):
                enviados.add(em)
                if (row.get("fecha") or "").startswith(hoy_str):
                    hoy += 1
    return enviados, hoy

def registrar(log_path, row, estado):
    existe = os.path.exists(log_path)
    with open(log_path, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if not existe:
            w.writerow(["fecha", "email", "nombre", "estado"])
        w.writerow([datetime.now().isoformat(timespec="seconds"), row["email"], row["nombre"], estado])

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default="sec_envio_gas_con_email.csv")
    ap.add_argument("--send", action="store_true", help="Enviar de verdad (default: dry-run)")
    ap.add_argument("--diario", type=int, default=110, help="Máximo de correos por día (default 110)")
    ap.add_argument("--solo-locales", action="store_true", help="Solo prioridad<=2 (Paine/Buin/aledaños)")
    ap.add_argument("--log", default="enviados_log.csv")
    args = ap.parse_args()

    rows = cargar(args.csv)
    enviados, hoy = leer_log(args.log)
    restante_hoy = max(0, args.diario - hoy)

    cola = []
    for r in rows:
        if not r.get("email") or "@" not in r["email"]: continue
        if r["email"] in enviados: continue
        if (r.get("consentimiento") or "").lower() == "no": continue
        if (r.get("estado") or "").lower() == "no_contactar": continue
        if args.solo_locales and (not r.get("prioridad") or str(r["prioridad"]) not in ("0","1","2")): continue
        cola.append(r)

    cola = cola[:restante_hoy]

    modo = "ENVÍO REAL" if args.send else "DRY-RUN (no envía nada)"
    print(f"== {modo} ==")
    print(f"Tope diario: {args.diario} | ya enviados hoy: {hoy} | cupo restante hoy: {restante_hoy}")
    print(f"Total ya enviados (histórico): {len(enviados)} | pendientes en esta lista: {len([r for r in rows if r.get('email') and r['email'] not in enviados])}")
    print(f"Se procesarán ahora: {len(cola)} (desfase {DESFASE}s c/u)\n")

    if not cola:
        print("Nada que enviar (cupo diario completo o lista agotada). Vuelve mañana y reactívalo.")
        return

    server = None
    if args.send:
        host = os.environ.get("SMTP_HOST"); port = int(os.environ.get("SMTP_PORT", "587"))
        user = os.environ.get("SMTP_USER"); pw = os.environ.get("SMTP_PASS")
        if not all([host, user, pw]):
            print("ERROR: define SMTP_HOST, SMTP_USER y SMTP_PASS en variables de entorno."); sys.exit(1)
        server = smtplib.SMTP(host, port, timeout=30)
        server.starttls(context=ssl.create_default_context())
        server.login(user, pw)

    from_name = os.environ.get("FROM_NAME", "Benjamín Pérez")
    from_email = os.environ.get("FROM_EMAIL", "bperez@oficiospro.cl")

    for i, r in enumerate(cola, 1):
        pn = r.get("primer_nombre") or (r["nombre"].split(",")[-1].strip().split() or [""])[0].title()
        saludo = r.get("saludo") or f"Hola {pn}"
        asunto = ASUNTO.format(primer_nombre=pn)
        cuerpo = CUERPO.format(saludo=saludo, link=LINK)
        print(f"[{i}/{len(cola)}] -> {r['email']:38} | {saludo}")
        if args.send:
            msg = MIMEText(cuerpo, "plain", "utf-8")
            msg["Subject"] = asunto
            msg["From"] = formataddr((from_name, from_email))
            msg["To"] = r["email"]; msg["Reply-To"] = from_email
            try:
                server.sendmail(from_email, [r["email"]], msg.as_string())
                registrar(args.log, r, "enviado")
            except Exception as e:
                print(f"      ! error: {e}")
                registrar(args.log, r, f"error: {e}")
        if i < len(cola) and args.send:
            time.sleep(DESFASE)

    if server: server.quit()
    if args.send:
        print(f"\nListo. Enviados hoy: {hoy + len(cola)}/{args.diario}. Registro en {args.log}. Reactívalo mañana para los siguientes.")
    else:
        print(f"\nDry-run: nada enviado. Agrega --send para enviar de verdad.")

if __name__ == "__main__":
    main()
