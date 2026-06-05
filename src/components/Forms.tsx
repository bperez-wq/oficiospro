"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { appendStoredItem } from "@/lib/storage";

export function LoginForm() {
  const [status, setStatus] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Sesión demo iniciada. Puedes entrar a cualquier dashboard.");
  }

  return (
    <FormShell title="Ingreso demo" text="Accede con cualquier email para revisar dashboards mock. No se conecta a Supabase todavía.">
      <form className="grid gap-4" onSubmit={submit}>
        <label className="field">
          Email
          <input name="email" type="email" placeholder="tu@email.cl" required />
        </label>
        <label className="field">
          Contraseña
          <input name="password" type="password" minLength={4} placeholder="Clave demo" required />
        </label>
        <button className="btn-primary" type="submit">
          Ingresar
        </button>
        {status ? <SuccessMessage>{status}</SuccessMessage> : null}
      </form>
    </FormShell>
  );
}

export function ClientRegisterForm() {
  const [status, setStatus] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    appendStoredItem("users", {
      role: "client",
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      commune: data.get("commune"),
      plan: data.get("plan"),
      createdAt: new Date().toISOString(),
    });
    event.currentTarget.reset();
    setStatus("Cuenta cliente creada en localStorage. Lista para conectar con users y credits_wallet.");
  }

  return (
    <FormShell title="Registro cliente" text="Crea una cuenta demo para reservar especialistas y simular movimientos de créditos.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="field">
          Nombre completo
          <input name="name" placeholder="Ej: Benjamín Pérez" required />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" placeholder="nombre@email.cl" required />
        </label>
        <label className="field">
          Teléfono
          <input name="phone" type="tel" placeholder="+56 9 1234 5678" required />
        </label>
        <label className="field">
          Comuna
          <input name="commune" placeholder="Las Condes" required />
        </label>
        <label className="field md:col-span-2">
          Plan
          <select name="plan">
            <option>Básico, 20 créditos</option>
            <option>Plus, 45 créditos</option>
            <option>Familiar, 85 créditos</option>
          </select>
        </label>
        <button className="btn-primary md:col-span-2" type="submit">
          Crear cuenta cliente
        </button>
        {status ? <SuccessMessage className="md:col-span-2">{status}</SuccessMessage> : null}
      </form>
    </FormShell>
  );
}

export function SpecialistRegisterForm() {
  const [status, setStatus] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    appendStoredItem("specialists", {
      name: data.get("name"),
      email: data.get("email"),
      specialty: data.get("specialty"),
      commune: data.get("commune"),
      phone: data.get("phone"),
      certifications: data.get("certifications"),
      experience: data.get("experience"),
      status: "Pendiente",
      createdAt: new Date().toISOString(),
    });
    event.currentTarget.reset();
    setStatus("Solicitud recibida. Ahora aparece en el panel admin para aprobación.");
  }

  return (
    <FormShell title="Postulación especialista" text="Construye un perfil profesional con reputación, fotos, certificaciones y reservas mejor filtradas.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="field">
          Nombre completo
          <input name="name" placeholder="Ej: Juan Pérez" required />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" placeholder="especialista@email.cl" required />
        </label>
        <label className="field">
          Especialidad principal
          <input name="specialty" placeholder="Gasfíter, electricista, HVAC" required />
        </label>
        <label className="field">
          Comuna base
          <input name="commune" placeholder="Providencia" required />
        </label>
        <label className="field">
          WhatsApp
          <input name="phone" type="tel" placeholder="+56 9 1234 5678" required />
        </label>
        <label className="field">
          Certificaciones
          <input name="certifications" placeholder="SEC, HVAC, CCTV" />
        </label>
        <label className="field md:col-span-2">
          Experiencia y trabajos realizados
          <textarea name="experience" placeholder="Describe trabajos, zonas, certificaciones y experiencia comprobable" />
        </label>
        <button className="btn-primary md:col-span-2" type="submit">
          Enviar solicitud
        </button>
        {status ? <SuccessMessage className="md:col-span-2">{status}</SuccessMessage> : null}
      </form>
    </FormShell>
  );
}

export function CompanyRequestForm() {
  const [status, setStatus] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    appendStoredItem("companies", {
      company: data.get("company"),
      rut: data.get("rut"),
      contact: data.get("contact"),
      email: data.get("email"),
      branches: data.get("branches"),
      plan: data.get("plan"),
      status: "Pendiente",
      createdAt: new Date().toISOString(),
    });
    event.currentTarget.reset();
    setStatus("Solicitud empresa guardada. Quedó visible en admin.");
  }

  return (
    <FormShell title="Solicitud empresa" text="Cuéntanos el tamaño de tu operación para simular una cuenta corporativa.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="field">
          Empresa
          <input name="company" placeholder="Nombre empresa" required />
        </label>
        <label className="field">
          RUT
          <input name="rut" placeholder="76.123.456-7" />
        </label>
        <label className="field">
          Contacto
          <input name="contact" placeholder="Nombre contacto" required />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" placeholder="operaciones@empresa.cl" required />
        </label>
        <label className="field">
          Sucursales
          <input name="branches" type="number" min="1" defaultValue="1" />
        </label>
        <label className="field">
          Plan
          <select name="plan">
            <option>Pyme</option>
            <option>Empresa</option>
            <option>Corporativo</option>
          </select>
        </label>
        <button className="btn-primary md:col-span-2" type="submit">
          Enviar solicitud
        </button>
        {status ? <SuccessMessage className="md:col-span-2">{status}</SuccessMessage> : null}
      </form>
    </FormShell>
  );
}

function FormShell({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
      <div className="mb-6">
        <p className="eyebrow">Formulario seguro</p>
        <h2 className="text-3xl font-black">{title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted">{text}</p>
      </div>
      {children}
    </section>
  );
}

function SuccessMessage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`rounded-2xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark ${className}`}>
      {children}
    </p>
  );
}
