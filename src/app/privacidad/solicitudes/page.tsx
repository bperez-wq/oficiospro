import type { Metadata } from "next";
import { MarketplaceCard } from "@/components/DesignSystem";
import { PlatformNav } from "@/components/PlatformNav";
import { dataSubjectRequestTypeLabels } from "@/data/externalCertifiedSpecialists";

export const metadata: Metadata = {
  title: "Solicitudes de privacidad | OficiosPro",
  description: "Canal para solicitar acceso, rectificacion, supresion, oposicion o bloqueo de datos publicados en OficiosPro.",
  robots: "noindex,nofollow,noarchive",
  alternates: {
    canonical: "https://www.oficiospro.cl/privacidad/solicitudes",
  },
};

export default function PrivacyRequestsPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft md:p-8">
        <p className="eyebrow">Privacidad y titulares de datos</p>
        <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight text-ink md:text-6xl">
          Solicitar correccion, eliminacion, oposicion o bloqueo
        </h1>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-muted">
          Usa este canal si una ficha informativa, perfil o vitrina muestra datos que quieres revisar. Mientras se analiza una solicitud fundada, OficiosPro puede ocultar temporalmente la informacion discutida.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Como se procesa</p>
          <div className="mt-4 grid gap-3">
            {[
              "Recibimos la solicitud y la marcamos como RECEIVED.",
              "Revisamos identidad, relacion con la ficha y alcance de la solicitud.",
              "Si corresponde, la ficha queda en revision u oculta temporalmente.",
              "La resolucion se hace manualmente y queda registrada para auditoria.",
            ].map((item) => (
              <p key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-muted">
                {item}
              </p>
            ))}
          </div>
        </MarketplaceCard>

        <MarketplaceCard hover={false}>
          <form action="/api/privacy/data-subject-requests" method="post" className="grid gap-4">
            <div>
              <label className="text-sm font-black text-ink" htmlFor="requesterName">Nombre</label>
              <input id="requesterName" name="requesterName" required className="mt-2 w-full rounded-2xl border border-line px-4 py-3 font-bold outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-sm font-black text-ink" htmlFor="requesterEmail">Email</label>
              <input id="requesterEmail" name="requesterEmail" type="email" required className="mt-2 w-full rounded-2xl border border-line px-4 py-3 font-bold outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-sm font-black text-ink" htmlFor="requestType">Tipo de solicitud</label>
              <select id="requestType" name="requestType" required className="mt-2 w-full rounded-2xl border border-line px-4 py-3 font-bold outline-none focus:border-brand">
                {Object.entries(dataSubjectRequestTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-black text-ink" htmlFor="professionalId">ID ficha profesional</label>
                <input id="professionalId" name="professionalId" className="mt-2 w-full rounded-2xl border border-line px-4 py-3 font-bold outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-sm font-black text-ink" htmlFor="companyId">ID empresa</label>
                <input id="companyId" name="companyId" className="mt-2 w-full rounded-2xl border border-line px-4 py-3 font-bold outline-none focus:border-brand" />
              </div>
            </div>
            <div>
              <label className="text-sm font-black text-ink" htmlFor="message">Detalle</label>
              <textarea id="message" name="message" required rows={5} className="mt-2 w-full rounded-2xl border border-line px-4 py-3 font-bold outline-none focus:border-brand" />
            </div>
            <button className="rounded-full bg-brand px-5 py-3 text-sm font-black text-white shadow-soft transition hover:bg-brand-dark">
              Enviar solicitud
            </button>
          </form>
        </MarketplaceCard>
      </section>
    </main>
  );
}
