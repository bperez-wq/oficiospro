"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { adminLoginErrorMessage, loginRealAdmin } from "@/lib/adminAuth";
import { demoAuthEnabled } from "@/lib/auth/session";
import { setMockSession, type MockSession } from "@/lib/storage";

type LoginMode = "login" | "client" | "specialist" | "company";

const loginAccounts = {
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
  const dialogRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => {
      if (mode === "login") {
        emailRef.current?.focus();
        return;
      }
      titleRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [mode, open]);

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    setSubmitting(true);
    if (!demoAuthEnabled()) {
      try {
        const session = await loginRealAdmin(email, password);
        onLogin(session);
        setStatus("Acceso admin correcto. Continuando...");
        window.setTimeout(() => {
          window.location.href = "/admin";
        }, 350);
      } catch (error) {
        setStatus(`${adminLoginErrorMessage(error)} El acceso demo no esta habilitado en produccion. Configura ADMIN_LOGIN_EMAIL y ADMIN_LOGIN_SECRET en Cloudflare para habilitar acceso real.`);
        setSubmitting(false);
      }
      return;
    }

    const account = loginAccounts[email as keyof typeof loginAccounts];

    if (!account || account.password !== password) {
      setStatus("Email o contrasena incorrectos.");
      setSubmitting(false);
      return;
    }

    const session: MockSession = { role: account.role, name: account.name, email, createdAt: new Date().toISOString() };
    setMockSession(session);
    onLogin(session);
    setStatus("Acceso correcto. Continuando...");
    window.setTimeout(() => {
      window.location.href = redirectAfterLogin(account.path);
    }, 350);
  }

  return (
    <div className="fixed inset-0 z-[130] flex min-h-dvh items-center justify-center overflow-y-auto bg-ink/65 p-4 backdrop-blur-sm md:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        ref={dialogRef}
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-card outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-entry-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line bg-white p-5 md:p-6">
          <div>
            <p className="eyebrow">Cuenta</p>
            <h2 ref={titleRef} id="login-entry-title" tabIndex={-1} className="text-3xl font-black text-ink outline-none">Ingresa a OficiosPro</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-muted">Explora libremente. Inicia sesion cuando quieras reservar, pagar o gestionar solicitudes.</p>
          </div>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-white text-xl font-black text-muted transition hover:bg-slate-50 hover:text-ink" type="button" onClick={onClose} aria-label="Cerrar ingreso">
            x
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto p-5 md:p-6">
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
                <input ref={emailRef} name="email" type="email" autoComplete="email" required />
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
      text: "Guarda créditos, solicitudes, reservas y datos de contacto para futuras mantenciones.",
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
      text: "Centraliza mantenciones, créditos, sucursales y solicitudes operativas.",
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
