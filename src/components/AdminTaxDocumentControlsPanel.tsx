"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { EmptyState } from "@/components/DesignSystem";
import { formatCLP } from "@/data/marketplace";
import {
  OP_SPA_DOCUMENT_RECEIVER,
  requiredDocumentLabels,
  type RequiredSpecialistDocumentKind,
} from "@/data/specialistFormalization";
import {
  createAuthorizationCode,
  defaultSupplierDocumentPolicy,
  manualTaxDocumentChecklist,
  validateReceivedTaxDocument,
  type AuthorizedDocumentRequest,
  type FactoringRiskAlert,
  type ReceivedTaxDocument,
  type TaxDocumentAssignmentStatus,
} from "@/lib/finance/taxDocumentControls";

const documentTypes: RequiredSpecialistDocumentKind[] = ["boleta_honorarios", "factura_afecta", "factura_exenta"];

export function AdminTaxDocumentControlsPanel() {
  const [authorizations, setAuthorizations] = useState<AuthorizedDocumentRequest[]>([]);
  const [documents, setDocuments] = useState<ReceivedTaxDocument[]>([]);
  const [alerts, setAlerts] = useState<FactoringRiskAlert[]>([]);
  const [notice, setNotice] = useState("");
  const [authorizationDraft, setAuthorizationDraft] = useState({
    specialistId: "",
    serviceRequestId: "",
    payoutId: "",
    issuerRut: "",
    issuerLegalName: "",
    documentType: "boleta_honorarios" as RequiredSpecialistDocumentKind,
    amountCLP: 0,
    reason: "",
  });
  const [receivedDraft, setReceivedDraft] = useState({
    authorizationCode: "",
    specialistId: "",
    serviceRequestId: "",
    payoutId: "",
    issuerRut: "",
    issuerLegalName: "",
    documentType: "boleta_honorarios" as RequiredSpecialistDocumentKind,
    folio: "",
    amountCLP: 0,
    assignmentStatus: "unknown" as TaxDocumentAssignmentStatus,
  });

  const openAlerts = alerts.filter((alert) => alert.status === "open" || alert.status === "in_review");
  const blockedDocuments = documents.filter((document) => document.payoutBlocked);
  const acceptedDocuments = documents.filter((document) => document.reviewStatus === "accepted");
  const checklist = useMemo(() => manualTaxDocumentChecklist(), []);

  function createAuthorization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authorizationDraft.specialistId || !authorizationDraft.issuerRut || !authorizationDraft.amountCLP) {
      setNotice("Completa especialista, RUT emisor y monto antes de generar autorizacion.");
      return;
    }
    const now = new Date().toISOString();
    const authorization: AuthorizedDocumentRequest = {
      id: `auth_${Date.now()}`,
      authorizationCode: createAuthorizationCode(),
      specialistId: authorizationDraft.specialistId.trim(),
      serviceRequestId: optional(authorizationDraft.serviceRequestId),
      payoutId: optional(authorizationDraft.payoutId),
      issuerRut: authorizationDraft.issuerRut.trim(),
      issuerLegalName: optional(authorizationDraft.issuerLegalName),
      receiverRut: OP_SPA_DOCUMENT_RECEIVER.rut,
      documentType: authorizationDraft.documentType,
      amountCLP: Math.max(0, Math.round(Number(authorizationDraft.amountCLP))),
      status: "authorized",
      reason: optional(authorizationDraft.reason),
      createdBy: "admin",
      createdAt: now,
    };
    setAuthorizations((current) => [authorization, ...current]);
    setReceivedDraft((current) => ({
      ...current,
      authorizationCode: authorization.authorizationCode,
      specialistId: authorization.specialistId,
      serviceRequestId: authorization.serviceRequestId ?? "",
      payoutId: authorization.payoutId ?? "",
      issuerRut: authorization.issuerRut,
      issuerLegalName: authorization.issuerLegalName ?? "",
      documentType: authorization.documentType,
      amountCLP: authorization.amountCLP,
    }));
    setNotice(`Autorizacion generada: ${authorization.authorizationCode}.`);
  }

  function markReceived(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!receivedDraft.issuerRut || !receivedDraft.folio || !receivedDraft.amountCLP) {
      setNotice("Completa RUT emisor, folio y monto para validar el documento recibido.");
      return;
    }
    const document: ReceivedTaxDocument = {
      id: `tax_doc_${Date.now()}`,
      authorizationCode: optional(receivedDraft.authorizationCode),
      specialistId: optional(receivedDraft.specialistId),
      serviceRequestId: optional(receivedDraft.serviceRequestId),
      payoutId: optional(receivedDraft.payoutId),
      issuerRut: receivedDraft.issuerRut.trim(),
      issuerLegalName: optional(receivedDraft.issuerLegalName),
      receiverRut: OP_SPA_DOCUMENT_RECEIVER.rut,
      documentType: receivedDraft.documentType,
      folio: receivedDraft.folio.trim(),
      amountCLP: Math.max(0, Math.round(Number(receivedDraft.amountCLP))),
      receivedAt: new Date().toISOString(),
      siiStatus: "pending_manual_check",
      assignmentStatus: receivedDraft.assignmentStatus,
      reviewStatus: "received",
      payoutBlocked: true,
    };
    const validation = validateReceivedTaxDocument({
      document,
      authorizations,
      existingDocuments: documents,
      policy: defaultSupplierDocumentPolicy,
    });
    const validatedDocument: ReceivedTaxDocument = {
      ...document,
      reviewStatus: validation.reviewStatus,
      matchedAuthorizationId: validation.matchedAuthorization?.id,
      payoutBlocked: validation.payoutBlocked,
    };
    setDocuments((current) => [validatedDocument, ...current]);
    setAlerts((current) => [...validation.alerts, ...current]);
    setNotice(
      validation.matchStatus === "matched"
        ? "Documento validado contra autorizacion interna. Payout puede avanzar si SII/contador aprueba."
        : "Documento requiere revision: payout queda bloqueado hasta resolver la alerta.",
    );
  }

  function updateDocument(id: string, patch: Partial<ReceivedTaxDocument>, message: string) {
    setDocuments((current) => current.map((document) => (document.id === id ? { ...document, ...patch } : document)));
    setNotice(message);
  }

  function updateAlert(id: string, patch: Partial<FactoringRiskAlert>, message: string) {
    setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, ...patch } : alert)));
    setNotice(message);
  }

  async function copyReceiverData() {
    const text = [
      `Razon social: ${OP_SPA_DOCUMENT_RECEIVER.legalName}`,
      `RUT: ${OP_SPA_DOCUMENT_RECEIVER.rut}`,
      `Email: ${OP_SPA_DOCUMENT_RECEIVER.email}`,
      `Giro: ${OP_SPA_DOCUMENT_RECEIVER.activity}`,
      `Direccion: ${OP_SPA_DOCUMENT_RECEIVER.address}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Datos OP SpA copiados para autorizacion/documento.");
    } catch {
      setNotice("No pudimos copiar automaticamente. Revisa los datos en pantalla.");
    }
  }

  return (
    <section className="grid gap-5 rounded-[32px] border border-line bg-white p-5 shadow-soft md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Documentos tributarios</p>
          <h2 className="text-3xl font-black text-ink">Autorizacion previa, recepcion y alertas de factoring</h2>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-muted">
            Todo documento emitido a OP SpA debe nacer desde una autorizacion interna. Si llega sin autorizacion, con monto/emisor distinto, duplicado o cedido sin permiso, el payout queda bloqueado.
          </p>
        </div>
        <button className="btn-secondary" type="button" onClick={copyReceiverData}>
          Copiar datos OP SpA
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Autorizados" value={authorizations.length.toString()} />
        <Metric label="Aceptados" value={acceptedDocuments.length.toString()} tone="ok" />
        <Metric label="Payout bloqueado" value={blockedDocuments.length.toString()} tone="warning" />
        <Metric label="Alertas abiertas" value={openAlerts.length.toString()} tone={openAlerts.length ? "risk" : "ok"} />
      </div>

      {notice ? <p className="rounded-2xl border border-brand/15 bg-brand-soft p-3 text-sm font-black text-brand-dark">{notice}</p> : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <form className="grid gap-3 rounded-[24px] border border-line bg-slate-50 p-4" onSubmit={createAuthorization}>
          <div>
            <h3 className="text-xl font-black text-ink">Generar autorizacion</h3>
            <p className="mt-1 text-xs font-bold leading-5 text-muted">Usa esto antes de pedir boleta/factura al especialista.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField label="Especialista ID" value={authorizationDraft.specialistId} onChange={(specialistId) => setAuthorizationDraft({ ...authorizationDraft, specialistId })} />
            <TextField label="Solicitud ID" value={authorizationDraft.serviceRequestId} onChange={(serviceRequestId) => setAuthorizationDraft({ ...authorizationDraft, serviceRequestId })} />
            <TextField label="Payout ID" value={authorizationDraft.payoutId} onChange={(payoutId) => setAuthorizationDraft({ ...authorizationDraft, payoutId })} />
            <TextField label="RUT emisor" value={authorizationDraft.issuerRut} onChange={(issuerRut) => setAuthorizationDraft({ ...authorizationDraft, issuerRut })} />
            <TextField label="Nombre emisor" value={authorizationDraft.issuerLegalName} onChange={(issuerLegalName) => setAuthorizationDraft({ ...authorizationDraft, issuerLegalName })} />
            <label className="field">
              Tipo documento
              <select value={authorizationDraft.documentType} onChange={(event) => setAuthorizationDraft({ ...authorizationDraft, documentType: event.target.value as RequiredSpecialistDocumentKind })}>
                {documentTypes.map((documentType) => (
                  <option key={documentType} value={documentType}>
                    {requiredDocumentLabels[documentType]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Monto autorizado
              <input type="number" min="0" step="1000" value={authorizationDraft.amountCLP || ""} onChange={(event) => setAuthorizationDraft({ ...authorizationDraft, amountCLP: Number(event.target.value) })} />
            </label>
            <TextField label="Motivo" value={authorizationDraft.reason} onChange={(reason) => setAuthorizationDraft({ ...authorizationDraft, reason })} />
          </div>
          <button className="btn-primary" type="submit">
            Generar authorizationCode
          </button>
        </form>

        <form className="grid gap-3 rounded-[24px] border border-line bg-slate-50 p-4" onSubmit={markReceived}>
          <div>
            <h3 className="text-xl font-black text-ink">Marcar documento recibido</h3>
            <p className="mt-1 text-xs font-bold leading-5 text-muted">Valida folio, monto, autorizacion y riesgo de cesion/factoring.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField label="authorizationCode" value={receivedDraft.authorizationCode} onChange={(authorizationCode) => setReceivedDraft({ ...receivedDraft, authorizationCode })} />
            <TextField label="Especialista ID" value={receivedDraft.specialistId} onChange={(specialistId) => setReceivedDraft({ ...receivedDraft, specialistId })} />
            <TextField label="Solicitud ID" value={receivedDraft.serviceRequestId} onChange={(serviceRequestId) => setReceivedDraft({ ...receivedDraft, serviceRequestId })} />
            <TextField label="Payout ID" value={receivedDraft.payoutId} onChange={(payoutId) => setReceivedDraft({ ...receivedDraft, payoutId })} />
            <TextField label="RUT emisor" value={receivedDraft.issuerRut} onChange={(issuerRut) => setReceivedDraft({ ...receivedDraft, issuerRut })} />
            <TextField label="Nombre emisor" value={receivedDraft.issuerLegalName} onChange={(issuerLegalName) => setReceivedDraft({ ...receivedDraft, issuerLegalName })} />
            <label className="field">
              Tipo documento
              <select value={receivedDraft.documentType} onChange={(event) => setReceivedDraft({ ...receivedDraft, documentType: event.target.value as RequiredSpecialistDocumentKind })}>
                {documentTypes.map((documentType) => (
                  <option key={documentType} value={documentType}>
                    {requiredDocumentLabels[documentType]}
                  </option>
                ))}
              </select>
            </label>
            <TextField label="Folio" value={receivedDraft.folio} onChange={(folio) => setReceivedDraft({ ...receivedDraft, folio })} />
            <label className="field">
              Monto recibido
              <input type="number" min="0" step="1000" value={receivedDraft.amountCLP || ""} onChange={(event) => setReceivedDraft({ ...receivedDraft, amountCLP: Number(event.target.value) })} />
            </label>
            <label className="field">
              Cesion/factoring
              <select value={receivedDraft.assignmentStatus} onChange={(event) => setReceivedDraft({ ...receivedDraft, assignmentStatus: event.target.value as TaxDocumentAssignmentStatus })}>
                <option value="unknown">Pendiente revision</option>
                <option value="not_assigned">No cedido</option>
                <option value="assigned_without_authorization">Cedido sin autorizacion</option>
                <option value="assigned_with_authorization">Cedido autorizado</option>
              </select>
            </label>
          </div>
          <button className="btn-primary" type="submit">
            Validar documento
          </button>
        </form>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Autorizaciones" empty="No hay autorizaciones generadas.">
          {authorizations.map((authorization) => (
            <article key={authorization.id} className="grid gap-2 rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm text-ink">{authorization.authorizationCode}</strong>
                <span className="chip bg-brand-soft text-brand-dark">{authorization.status}</span>
              </div>
              <p className="text-xs font-bold leading-5 text-muted">
                {authorization.specialistId} - {requiredDocumentLabels[authorization.documentType]} - {formatCLP(authorization.amountCLP)}
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary min-h-9 px-3 text-xs" type="button" onClick={() => navigator.clipboard.writeText(authorization.authorizationCode)}>
                  Copiar codigo
                </button>
                {authorization.status === "authorized" ? (
                  <button
                    className="min-h-9 rounded-2xl border border-rose-200 bg-white px-3 text-xs font-black text-rose-700"
                    type="button"
                    onClick={() =>
                      setAuthorizations((current) =>
                        current.map((item) => (item.id === authorization.id ? { ...item, status: "invalidated", invalidatedAt: new Date().toISOString() } : item)),
                      )
                    }
                  >
                    Invalidar
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </Panel>

        <Panel title="Documentos recibidos" empty="Aun no hay documentos recibidos.">
          {documents.map((document) => (
            <article key={document.id} className="grid gap-2 rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm text-ink">{document.documentType.replace(/_/g, " ")} {document.folio}</strong>
                <span className={`chip ${document.payoutBlocked ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {document.payoutBlocked ? "Payout bloqueado" : "Payout habilitado"}
                </span>
              </div>
              <p className="text-xs font-bold leading-5 text-muted">
                {document.issuerRut} - {formatCLP(document.amountCLP)} - {document.reviewStatus}
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary min-h-9 px-3 text-xs" type="button" onClick={() => updateDocument(document.id, { reviewStatus: "accepted", payoutBlocked: false }, "Documento aceptado manualmente.")}>
                  Aceptar
                </button>
                <button className="btn-secondary min-h-9 px-3 text-xs" type="button" onClick={() => updateDocument(document.id, { reviewStatus: "claimed", payoutBlocked: true }, "Documento marcado como reclamado.")}>
                  Reclamar
                </button>
                <button className="btn-secondary min-h-9 px-3 text-xs" type="button" onClick={() => updateDocument(document.id, { reviewStatus: "rejected", payoutBlocked: true }, "Documento rechazado.")}>
                  Rechazar
                </button>
                <button className="btn-secondary min-h-9 px-3 text-xs" type="button" onClick={() => updateDocument(document.id, { payoutBlocked: !document.payoutBlocked }, document.payoutBlocked ? "Payout desbloqueado manualmente." : "Payout bloqueado manualmente.")}>
                  {document.payoutBlocked ? "Desbloquear payout" : "Bloquear payout"}
                </button>
              </div>
            </article>
          ))}
        </Panel>

        <Panel title="Alertas" empty="Sin alertas documentales.">
          {alerts.map((alert) => (
            <article key={alert.id} className={`grid gap-2 rounded-2xl border p-4 ${alert.severity === "critical" || alert.severity === "high" ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm text-ink">{alert.reason.replace(/_/g, " ")}</strong>
                <span className="text-xs font-black uppercase text-muted">{alert.severity}</span>
              </div>
              <p className="text-xs font-bold leading-5 text-muted">{alert.detail}</p>
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary min-h-9 px-3 text-xs" type="button" onClick={() => updateAlert(alert.id, { status: "in_review" }, "Tarea CRM contable/legal marcada para revision.")}>
                  Crear tarea CRM
                </button>
                <button className="btn-secondary min-h-9 px-3 text-xs" type="button" onClick={() => updateAlert(alert.id, { status: "resolved", blockPayout: false }, "Alerta marcada como resuelta.")}>
                  Resolver
                </button>
              </div>
            </article>
          ))}
        </Panel>
      </div>

      <div className="rounded-2xl border border-line bg-slate-50 p-4">
        <strong className="text-sm text-ink">Checklist manual SII/factoring</strong>
        <ul className="mt-2 grid gap-1 text-xs font-bold leading-5 text-muted">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Panel({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="grid gap-3 rounded-[24px] border border-line bg-slate-50 p-4">
      <h3 className="text-xl font-black text-ink">{title}</h3>
      {hasChildren ? children : <EmptyState eyebrow={title} title={empty} text="Los registros reales apareceran aqui cuando se conecte a endpoints admin D1." />}
    </section>
  );
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "ok" | "warning" | "risk" }) {
  const toneClass = tone === "ok" ? "bg-emerald-50 text-emerald-700" : tone === "warning" ? "bg-amber-50 text-amber-800" : tone === "risk" ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-muted";
  return (
    <div className={`rounded-2xl border border-line p-4 ${toneClass}`}>
      <span className="text-xs font-black uppercase">{label}</span>
      <strong className="mt-1 block text-2xl text-ink">{value}</strong>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}
