"use client";

import { useMemo, useState } from "react";
import { founderReferralHref } from "@/data/specialistAcquisition";

export function ReferralTool() {
  const [code, setCode] = useState("");
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = useMemo(() => {
    const path = founderReferralHref(code.trim() || undefined);
    if (typeof window === "undefined") return `https://oficiospro.cl${path}`;
    return `${window.location.origin}${path}`;
  }, [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`Te invito a crear tu perfil fundador en OficiosPro: ${link}`)}`;

  return (
    <div className="rounded-card border border-line bg-white p-6 shadow-soft">
      <p className="text-sm font-black text-ink">Tu herramienta de referido</p>

      <label className="field mt-4">
        Tu codigo o nombre de referido
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ej: carlos-gasfiter" />
      </label>

      <button type="button" className="btn-primary mt-3 w-full" onClick={() => setCreated(true)}>
        Crear link
      </button>

      {created ? (
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-slate-50 p-3">
            <span className="truncate text-sm font-bold text-muted">{link}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" className="btn-secondary" onClick={copy}>
              {copied ? "Copiado!" : "Copiar link"}
            </button>
            <a className="btn-sun" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              Compartir por WhatsApp
            </a>
          </div>

          {/* QR placeholder elegante (sin libreria externa) */}
          <div className="mt-2 flex items-center gap-4 rounded-2xl border border-dashed border-line bg-slate-50 p-4">
            <div className="grid h-20 w-20 shrink-0 grid-cols-4 grid-rows-4 gap-0.5 rounded-xl bg-white p-2 shadow-sm" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, index) => (
                <span key={index} className={`rounded-[2px] ${[0, 1, 2, 4, 6, 8, 11, 12, 14, 15].includes(index) ? "bg-ink" : "bg-slate-200"}`} />
              ))}
            </div>
            <p className="text-xs font-bold leading-5 text-muted">
              Codigo QR para imprimir o compartir en terreno. El QR real se genera al activar tu cuenta.
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs font-bold leading-5 text-muted">
          Escribe tu codigo y presiona &quot;Crear link&quot; para copiar y compartir.
        </p>
      )}
    </div>
  );
}
