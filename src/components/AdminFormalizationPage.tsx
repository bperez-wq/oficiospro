"use client";

import { useEffect, useState, type FormEvent } from "react";
import { EmptyState } from "@/components/DesignSystem";
import { FormalizationAndPayoutPanel } from "@/components/FormalizationAndPayoutPanel";
import { AdminTaxDocumentControlsPanel } from "@/components/AdminTaxDocumentControlsPanel";
import { adminSessionToken, hasAdminBrowserSession, initialAdminToken, persistAdminToken } from "@/lib/adminAuth";

const tokenStorageKey = "oficiospro.adminFormalizationToken";

export function AdminFormalizationPage() {
  const [tokenDraft, setTokenDraft] = useState("");
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("Ingresa ADMIN_TOKEN para revisar formalizacion.");

  useEffect(() => {
    const initial = initialAdminToken(tokenStorageKey);
    setToken(initial);
    setTokenDraft(initial === adminSessionToken ? "" : initial);
    if (initial) setNotice("Acceso admin activo en este navegador.");
  }, []);

  function saveToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = tokenDraft.trim();
    persistAdminToken(tokenStorageKey, next);
    const active = next || (hasAdminBrowserSession() ? adminSessionToken : "");
    setToken(active);
    setNotice(active ? "Acceso admin activo." : "Ingresa ADMIN_TOKEN o inicia sesion como administrador.");
  }

  return (
    <main className="section grid gap-6">
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft md:p-8">
        <p className="eyebrow">Panel interno OficiosPro</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">Formalizacion de especialistas</h1>
            <p className="mt-3 max-w-3xl font-semibold leading-7 text-muted">
              Revision interna de capacidad documental, bloqueo de payouts y calculo referencial de liquidaciones antes de operar pagos reales.
            </p>
          </div>
          <form className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 sm:min-w-96" onSubmit={saveToken}>
            <label className="field">
              Token admin
              <input value={tokenDraft} onChange={(event) => setTokenDraft(event.target.value)} type="password" autoComplete="off" placeholder="ADMIN_TOKEN" />
            </label>
            <button className="btn-primary" type="submit">
              Usar token
            </button>
            <span className="text-xs font-bold text-muted">El token se guarda solo en sessionStorage.</span>
          </form>
        </div>
      </section>

      {!token ? (
        <EmptyState
          eyebrow="Acceso interno"
          title="Ingresa token admin para continuar."
          text={notice}
        />
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-4">
            <AdminQueueMetric label="Por revisar" value="0" detail="Sin datos reales cargados" />
            <AdminQueueMetric label="Storage seguro" value="Pendiente" detail="No subir cedula/selfie sin almacenamiento privado" />
            <AdminQueueMetric label="Payouts bloqueados" value="0" detail="Se bloquearan si falta documento" />
            <AdminQueueMetric label="Revision contador/SII" value="Obligatoria" detail="Antes de pagos reales" />
          </section>
          <FormalizationAndPayoutPanel variant="admin" initialTaxType="boleta_honorarios" initialTargetCLP={45000} />
          <AdminTaxDocumentControlsPanel />
          <EmptyState
            eyebrow="Cola D1"
            title="Aun no hay perfiles tributarios reales para revisar."
            text="Cuando existan registros en specialist_tax_profiles, tax_document_requests o payout_blocks, esta vista debe conectarse a endpoints admin D1 antes de operar liquidaciones reales."
          />
        </>
      )}
    </main>
  );
}

function AdminQueueMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-1 block text-2xl font-black text-ink">{value}</strong>
      <p className="mt-1 text-xs font-bold leading-5 text-muted">{detail}</p>
    </article>
  );
}
