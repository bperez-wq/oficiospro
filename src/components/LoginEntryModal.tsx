"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { setMockSession, type MockSession } from "@/lib/storage";

type LoginMode = "login" | "client" | "specialist" | "company";

const loginAccounts = {
  "admin@oficiospro.cl": { password: "Admin1234!", role: "admin" as const, name: "Administrador OficiosPro", path: "/admin" },
  "cliente@oficiospro.cl": { password: "Cliente1234!", role: "client" as const, name: "Cliente OficiosPro", path: "/dashboard-cliente" },
  "especialista@oficiospro.cl": { password: "Especialista1234!", role: "specialist" as const, name: "Especialista OficiosPro", path: "/dashboard-especialista" },
  "empresa@oficiospro.cl": { password: "Empresa1234!", role: "company" as const, name: "Empresa OficiosPro", path: "/dashboard-empresa" },
};

export function LoginEntryModal({
  open,
  onClose,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: (session: MockSession) => void;
}) {
  const [mode, setMode] = useState<LoginMode>("login");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    const account = loginAccounts[email as keyof typeof loginAccounts];

    if (!account || account.password !== password) {
      setStatus("Email o contrasena incorrectos.");
      return;
    }

    setSubmitting(true);
    const session: MockSession = { role: account.role, name: account.name, email, createdAt: new Date().toISOString() };
    setMockSession(session);
    onLogin(session);
    setStatus("Acceso correcto. Continuando...");
    window.setTimeout(() => {
      window.location.href = redirectAfterLogin(account.path);
    }, 350);
  }

  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-ink/60 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-card">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5 md:p-6">
          <div>
            <p className="eyebrow">Cuenta</p>
            <h2 className="text-3xl font-black text-ink">Ingresa a OficiosPro</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-muted">Explora libremente. Inicia sesion cuando quieras reservar, pagar o gestionar solicitudes.</p>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-full border border-line text-xl font-black text-muted transition hover:bg-slate-50 hover:text-ink" type="button" onClick={onClose} aria-label="Cerrar ingreso">
            x
          </button>
        </div>

        <div className="grid gap-5 p-5 md:p-6">
          <div className="grid gap-2 sm:grid-cols-4">
            {[
              ["login", "Iniciar sesion"],
              ["client", "Crear cliente"],
              ["specialist", "Postular especialista"],
              ["company", "Registrar empresa"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={mode === value ? "rounded-2xl bg-brand px-4 py-3 text-sm font-black text-white" : "rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm font-black text-muted transition hover:border-brand hover:text-brand"}
                type="button"
                onClick={() => {
                  setMode(value as LoginMode);
                  setStatus("");
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form className="grid gap-4" onSubmit={submit}>
              <label className="field">
                Email
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label className="field">
                Contrasena
                <input name="password" type="password" minLength={8} autoComplete="current-password" required />
              </label>
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Ingresando..." : "Ingresar"}
              </button>
              {status ? <p className="rounded-2xl border border-brand/20 bg-brand-soft p-3 text-sm font-black text-brand-dark">{status}</p> : null}
            </form>
          ) : (
            <RegistrationPath mode={mode} onClose={onClose} />
          )}
        </div>
      </section>
    </div>
  );
}

function RegistrationPath({ mode, onClose }: { mode: Exclude<LoginMode, "login">; onClose: () => void }) {
  const paths = {
    client: {
      href: "/registro-cliente",
      title: "Crear cuenta cliente",
      text: "Guarda creditos, solicitudes, reservas y datos de contacto para futuras mantenciones.",
      cta: "Crear cuenta cliente",
    },
    specialist: {
      href: "/registro-especialista",
      title: "Postular como especialista",
      text: "Declara tus servicios, cobertura y tarifa esperada para que OficiosPro revise tu perfil.",
      cta: "Postular como especialista",
    },
    company: {
      href: "/empresas",
      title: "Registrar empresa o comunidad",
      text: "Centraliza mantenciones, creditos, sucursales y solicitudes operativas.",
      cta: "Ver soluciones empresa",
    },
  }[mode];

  return (
    <article className="rounded-[24px] border border-line bg-slate-50 p-5">
      <h3 className="text-2xl font-black text-ink">{paths.title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-muted">{paths.text}</p>
      <Link className="btn-primary mt-5 inline-flex" href={paths.href} onClick={onClose}>
        {paths.cta}
      </Link>
    </article>
  );
}

function redirectAfterLogin(defaultPath: string) {
  if (typeof window === "undefined") return defaultPath;
  try {
    const raw = window.sessionStorage.getItem("oficiospro.intendedSpecialistAction");
    const intended = raw ? JSON.parse(raw) as { specialistSlug?: string; specialistId?: string; intendedAction?: string } : null;
    const specialistTarget = intended?.specialistSlug ?? intended?.specialistId;
    if (specialistTarget && intended?.intendedAction) return `/especialistas/perfil?id=${encodeURIComponent(specialistTarget)}`;
  } catch {
    return defaultPath;
  }
  return defaultPath;
}
