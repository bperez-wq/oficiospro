"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { BookingDrawer } from "@/components/BookingDrawer";
import { checkoutUrlForItems } from "@/components/CartDrawer";
import { availabilityDotStyles, levelChipStyles } from "@/components/SpecialistCompactCard";
import { SpecialistProfileImage } from "@/components/SpecialistProfileImage";
import { defaultCommercialConfig } from "@/data/commercialConfig";
import { availabilityLabels, specialists as catalogSpecialists, type Specialist } from "@/data/mock";
import { formatCLP } from "@/data/marketplace";
import { addCartItem, getCartItems, getSpecialistProfileUrl, onCartChange, removeCartItem, type OficiosProCartItem } from "@/lib/cart";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { cartTotals, isCartItemCheckoutReady, itemAmountCLP } from "@/lib/payments/cart";
import { getPublishedSpecialists, seedMockState } from "@/lib/storage";
import { getSpecialistLevel, type SpecialistLevel } from "@/lib/trust";
import { CreditsHelpTrigger } from "@/components/credits/CreditsExplainer";
import {
  createVirtualQuote,
  getVirtualQuoteRequests,
  updateVirtualQuoteStatus,
  virtualQuoteStatusLabels,
  virtualQuoteUrgencyLabels,
  type VirtualQuoteCreateInput,
  type VirtualQuoteRequest,
  type VirtualQuoteUrgency,
} from "@/lib/virtualQuotes";

const sourceSection = "bolsa_page";

export default function BolsaPage() {
  const [items, setItems] = useState<OficiosProCartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [knownSpecialists, setKnownSpecialists] = useState<Specialist[]>(catalogSpecialists);
  const [booking, setBooking] = useState<{ specialist: Specialist; serviceId?: string } | null>(null);
  const [virtualQuotes, setVirtualQuotes] = useState<VirtualQuoteRequest[]>([]);
  const [virtualQuoteItem, setVirtualQuoteItem] = useState<OficiosProCartItem | null>(null);

  useEffect(() => {
    seedMockState();
    const published = getPublishedSpecialists();
    if (published.length) {
      setKnownSpecialists((current) => {
        const ids = new Set(current.map((item) => item.id));
        return [...current, ...published.filter((item) => !ids.has(item.id))];
      });
    }
    function refresh() {
      setItems(getCartItems());
      setVirtualQuotes(getVirtualQuoteRequests());
      setLoaded(true);
    }
    refresh();
    return onCartChange(refresh);
  }, []);

  const totals = useMemo(() => cartTotals(items), [items]);
  const specialistItems = items.filter((item) => Boolean(item.specialistId));
  const purchaseItems = items.filter((item) => !item.specialistId && (item.type === "credit_pack" || item.type === "subscription_plan"));
  const extraItems = items.filter((item) => !item.specialistId && item.type !== "credit_pack" && item.type !== "subscription_plan");
  const quoteItems = specialistItems.filter((item) => isQuoteItem(item));
  const checkoutReadyItems = items.filter(isCartItemCheckoutReady);
  const hasCheckoutReadyItems = checkoutReadyItems.length > 0;
  const reservableCredits = specialistItems.reduce((total, item) => total + (item.credits ?? 0), 0);
  const hasSubscription = items.some((item) => item.type === "subscription_plan");
  const checkoutHref = checkoutUrlForItems(checkoutReadyItems);

  function findSpecialist(item: OficiosProCartItem) {
    return knownSpecialists.find((specialist) => specialist.id === item.specialistId || specialist.slug === item.specialistSlug);
  }

  function openBooking(item: OficiosProCartItem, intendedAction: "reservar" | "solicitar") {
    const specialist = findSpecialist(item);
    if (!specialist) return;
    preserveSpecialistIntent({ specialist, intendedAction, source: "BolsaPage", sourceSection });
    setBooking({ specialist, serviceId: item.serviceId });
  }

  function quoteForItem(item: OficiosProCartItem) {
    return virtualQuotes.find((quote) => quote.cartItemId === item.id) ?? null;
  }

  function refreshLocalState() {
    setItems(getCartItems());
    setVirtualQuotes(getVirtualQuoteRequests());
  }

  function approveVirtualQuote(item: OficiosProCartItem) {
    const quote = quoteForItem(item);
    if (!quote?.offer || isCartItemCheckoutReady(item)) return;
    const credits = Math.max(0, Number(quote.offer.creditPrice ?? quote.offer.maxCredits ?? quote.offer.minCredits ?? item.credits ?? 0));
    const amountCLP = credits * defaultCommercialConfig.customerCreditValueCLP;
    updateVirtualQuoteStatus(quote.id, "aprobada_cliente", "Cliente aprobo la cotización virtual. Los créditos se retendran al continuar al checkout.");
    void syncVirtualQuoteDecision(quote, "approve");
    addCartItem({
      ...item,
      type: "quote_request",
      pricingMode: "quote_required",
      credits,
      amountCLP,
      priceCLP: amountCLP,
      title: `${item.serviceName ?? item.title} - cotización aprobada`,
      intendedAction: item.intendedAction ?? "virtual_quote",
      status: "quote_approved",
      virtualQuoteId: quote.remoteId ?? quote.id,
      sourceSection,
    });
    refreshLocalState();
  }

  function rejectVirtualQuote(item: OficiosProCartItem) {
    const quote = quoteForItem(item);
    if (!quote) return;
    updateVirtualQuoteStatus(quote.id, "rechazada_cliente", "Cliente rechazo la cotización virtual.");
    void syncVirtualQuoteDecision(quote, "reject");
    refreshLocalState();
  }

  const primaryCta: { label: string; href?: string; onClick?: () => void } | null = (() => {
    if (!items.length) return null;
    if (!specialistItems.length) return { label: "Continuar al checkout", href: checkoutHref };
    if (specialistItems.length > 1) return { label: "Elegir especialista", href: "#bolsa-especialistas" };
    const single = specialistItems[0];
    if (isQuoteItem(single)) {
      const quote = quoteForItem(single);
      if (isCartItemCheckoutReady(single)) return { label: "Continuar al checkout", href: checkoutHref };
      return { label: quote?.offer ? "Revisar propuesta" : quote ? "Ver cotización virtual" : "Iniciar cotización virtual", onClick: () => setVirtualQuoteItem(single), href: undefined };
    }
    return { label: "Confirmar reserva", onClick: () => openBooking(single, "reservar"), href: findSpecialist(single) ? undefined : profileHref(single) };
  })();

  return (
    <main className="min-h-screen bg-slate-50/70 pb-16">
      <div className="mx-auto max-w-7xl px-5 pt-10">
        <p className="eyebrow">Bolsa</p>
        <h1 className="text-3xl font-black text-ink md:text-5xl">Tu bolsa</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-muted">
          Guarda especialistas, créditos y solicitudes para compararlos con calma antes de confirmar.
        </p>
        <p className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-brand-dark shadow-soft">
          La disponibilidad se confirma antes de reservar · todo cobro adicional requiere tu aprobación.
        </p>

        {!loaded ? (
          <div className="mt-8 grid gap-3 lg:max-w-3xl" aria-hidden>
            {[0, 1].map((index) => (
              <div key={index} className="rounded-[24px] border border-line bg-white p-5">
                <div className="h-4 w-1/3 animate-pulse rounded-md bg-slate-100" />
                <div className="mt-3 h-16 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : !items.length ? (
          <div className="mt-10 grid gap-5 rounded-[32px] border border-dashed border-line bg-white p-10 text-center shadow-soft lg:max-w-2xl">
            <span aria-hidden className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-soft text-3xl">🛍</span>
            <h2 className="text-3xl font-black">Tu bolsa está vacía</h2>
            <p className="mx-auto max-w-md text-sm font-bold leading-6 text-muted">
              Agrega especialistas para comparar perfiles, precios en créditos y disponibilidad. En etapa piloto, tambien puedes dejar una solicitud si no encuentras match exacto.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Link className="btn-primary" href="/especialistas?sourceSection=bolsa_empty">Buscar especialistas</Link>
              <Link className="btn-secondary" href="/checkout">Comprar créditos</Link>
              <Link className="btn-secondary" href="/club-hogar">Ver Club Hogar</Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            {/* Columna izquierda: grupos de ítems */}
            <div className="grid gap-8">
              {specialistItems.length ? (
                <section id="bolsa-especialistas" className="grid gap-3">
                  <h2 className="text-xl font-black text-ink">
                    Especialistas y servicios <span className="text-base text-muted">· {specialistItems.length}</span>
                  </h2>
                  {specialistItems.length > 1 ? (
                    <p className="text-sm font-bold text-muted">Compara y quédate con el que más te convenga: puedes eliminar el resto cuando decidas.</p>
                  ) : null}
                  {specialistItems.map((item) => (
                    <SpecialistBagCard
                      key={item.id}
                      item={item}
                      specialist={findSpecialist(item)}
                      virtualQuote={quoteForItem(item)}
                      onReserve={() => openBooking(item, "reservar")}
                      onQuote={() => openBooking(item, "solicitar")}
                      onVirtualQuote={() => setVirtualQuoteItem(item)}
                      onApproveOffer={() => approveVirtualQuote(item)}
                      onRejectOffer={() => rejectVirtualQuote(item)}
                    />
                  ))}
                </section>
              ) : null}

              {purchaseItems.length ? (
                <section className="grid gap-3">
                  <h2 className="text-xl font-black text-ink">Créditos y planes</h2>
                  {purchaseItems.map((item) => (
                    <PurchaseBagCard key={item.id} item={item} />
                  ))}
                </section>
              ) : null}

              {extraItems.length ? (
                <section className="grid gap-3">
                  <h2 className="text-xl font-black text-ink">Adicionales y visitas</h2>
                  {extraItems.map((item) => (
                    <PurchaseBagCard key={item.id} item={item} />
                  ))}
                </section>
              ) : null}
            </div>

            {/* Columna derecha: resumen sticky */}
            <aside className="grid gap-4 self-start rounded-[28px] border border-line bg-white p-5 shadow-soft lg:sticky lg:top-28">
              <h2 className="text-xl font-black text-ink">Resumen</h2>
              <div className="grid gap-2 text-sm font-bold text-muted">
                <Row label={`Ítems en la bolsa`} value={items.length.toString()} />
                <Row label="Créditos involucrados" value={`${totals.credits} créditos`} accent />
                {reservableCredits ? <Row label="Se retendrán al reservar" value={`${reservableCredits} créditos`} /> : null}
                {quoteItems.length ? <Row label="Requieren cotización" value={`${quoteItems.length} ${quoteItems.length === 1 ? "ítem" : "ítems"}`} /> : null}
                {hasSubscription ? <Row label="Beneficio Club Hogar" value="−2 créditos por solicitud" emerald /> : null}
                <div className="mt-1 flex items-center justify-between border-t border-line pt-3 text-base font-black text-ink">
                  <span>Total CLP estimado</span>
                  <span>{totals.amountCLP ? formatCLP(totals.amountCLP) : "Se confirma en checkout"}</span>
                </div>
              </div>
              <div className="grid gap-2">
                {primaryCta ? (
                  primaryCta.onClick ? (
                    <button className="btn-primary w-full" type="button" onClick={primaryCta.onClick} data-event="bolsa_primary_cta">
                      {primaryCta.label}
                    </button>
                  ) : (
                    <Link className="btn-primary w-full text-center" href={primaryCta.href ?? checkoutHref} data-event="bolsa_primary_cta">
                      {primaryCta.label}
                    </Link>
                  )
                ) : null}
                {specialistItems.length && hasCheckoutReadyItems && primaryCta?.label !== "Continuar al checkout" ? (
                  <Link className="btn-secondary w-full text-center" href={checkoutHref} data-event="bolsa_checkout">
                    Continuar al checkout
                  </Link>
                ) : null}
                {quoteItems.length && !hasCheckoutReadyItems ? (
                  <p className="rounded-2xl bg-amber-50 p-3 text-xs font-black leading-5 text-amber-900">
                    Las cotizaciones pendientes no pasan a checkout hasta que apruebes una propuesta.
                  </p>
                ) : null}
                <Link className="inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-black text-brand-dark transition hover:bg-brand-soft" href="/especialistas?sourceSection=bolsa">
                  Seguir explorando especialistas
                </Link>
              </div>
              <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-muted">
                Precio total en créditos. Incluye gestion de plataforma y pago protegido: al reservar, tus créditos quedan retenidos y se liberan cuando confirmas el avance del trabajo.{" "}
                <CreditsHelpTrigger className="font-black text-brand-dark underline underline-offset-2 hover:opacity-80">
                  ¿Cómo funcionan los créditos?
                </CreditsHelpTrigger>
              </p>
              <p className="rounded-2xl bg-brand-soft p-3 text-xs font-bold leading-5 text-brand-dark">
                Piloto OficiosPro: tu seleccion queda guardada para comparar. Algunas solicitudes pueden requerir confirmacion operacional antes de cerrar agenda o pago.
              </p>
            </aside>
          </div>
        )}
      </div>

      {booking ? (
        <BookingDrawer
          specialist={booking.specialist}
          open={Boolean(booking)}
          initialSelectedServiceId={booking.serviceId ?? null}
          sourceSection={sourceSection}
          onClose={() => setBooking(null)}
        />
      ) : null}
      {virtualQuoteItem ? (
        <VirtualQuoteModal
          item={virtualQuoteItem}
          quote={quoteForItem(virtualQuoteItem)}
          onClose={() => setVirtualQuoteItem(null)}
          onSaved={() => {
            refreshLocalState();
            setVirtualQuoteItem(null);
          }}
          onApprove={() => approveVirtualQuote(virtualQuoteItem)}
          onReject={() => rejectVirtualQuote(virtualQuoteItem)}
        />
      ) : null}
    </main>
  );
}

/* ------------------------------------------------------------------ */

function SpecialistBagCard({
  item,
  specialist,
  virtualQuote,
  onReserve,
  onQuote,
  onVirtualQuote,
  onApproveOffer,
  onRejectOffer,
}: {
  item: OficiosProCartItem;
  specialist?: Specialist;
  virtualQuote?: VirtualQuoteRequest | null;
  onReserve: () => void;
  onQuote: () => void;
  onVirtualQuote: () => void;
  onApproveOffer: () => void;
  onRejectOffer: () => void;
}) {
  const quote = isQuoteItem(item);
  const image = item.specialistImage ?? specialist?.image;
  const rating = item.specialistRating ?? specialist?.rating;
  const level = (item.specialistLevel as SpecialistLevel) ?? (specialist ? getSpecialistLevel(specialist) : undefined);
  const commune = item.specialistCommune ?? specialist?.commune ?? specialist?.zone;
  const distance = item.specialistDistance ?? specialist?.distance;
  const jobs = specialist ? specialist.trabajosCompletados ?? specialist.jobs : undefined;
  const href = profileHref(item);

  return (
    <article className="rounded-[24px] border border-line bg-white p-4 shadow-sm transition duration-200 hover:border-brand/30 hover:shadow-card md:p-5">
      <div className="flex gap-4">
        <SpecialistProfileImage
          src={image}
          name={item.specialistName ?? specialist?.name ?? "Especialista OficiosPro"}
          specialty={specialist?.specialty ?? item.serviceName}
          serviceTypeId={specialist?.serviceTypeId}
          category={specialist?.category}
          alt={item.specialistName ?? "Especialista OficiosPro"}
          className="h-20 w-20 shrink-0 rounded-2xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <strong className="block truncate text-base text-ink">{item.specialistName ?? "Especialista OficiosPro"}</strong>
              <span className="block truncate text-sm font-bold text-muted">{specialist?.specialty ?? item.serviceName}</span>
            </div>
            <button
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-muted transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
              type="button"
              onClick={() => removeCartItem(item.id)}
              aria-label={`Eliminar ${item.specialistName ?? item.title} de la bolsa`}
            >
              <TrashIcon />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-black">
            {level ? <span className={`rounded-full px-2 py-0.5 ${levelChipStyles[level] ?? "bg-slate-100 text-slate-600"}`}>{level}</span> : null}
            {rating ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-gold">★ {rating.toFixed(1)}</span> : null}
            {jobs ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-muted">{jobs} trabajos</span> : null}
            {commune ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-muted">
                {commune}
                {typeof distance === "number" && Number.isFinite(distance) ? ` · a ${distance.toFixed(1).replace(".", ",")} km` : ""}
              </span>
            ) : null}
            {specialist ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-muted">
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${availabilityDotStyles[specialist.availability]}`} />
                {availabilityLabels[specialist.availability]}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2.5">
        <div className="min-w-0">
          <span className="block text-[11px] font-black uppercase text-muted">Servicio seleccionado</span>
          <strong className="block truncate text-sm text-ink">{item.serviceName ?? item.title}</strong>
        </div>
        <div className="text-right">
          <span className="block text-sm font-black text-brand-dark">{pricingLabel(item)}</span>
          <span className={`text-[11px] font-black ${quote ? "text-accent-dark" : item.type === "visit" ? "text-sun-dark" : "text-emerald-700"}`}>
            {quote ? virtualQuote ? virtualQuoteStatusLabels[virtualQuote.status] : "Enviar fotos para cotizar" : item.type === "visit" ? "Pendiente de confirmar visita" : "Listo para reservar"}
          </span>
        </div>
      </div>

      {quote ? (
        <div className="mt-3 rounded-2xl border border-brand/15 bg-brand-soft p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-sm text-brand-dark">Cotiza con fotos antes de la visita.</strong>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-brand-dark">
              {virtualQuote ? virtualQuoteStatusLabels[virtualQuote.status] : "Cotización virtual pendiente"}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold leading-5 text-brand-dark/80">
            Evita visitas innecesarias. Cuando sea posible, el especialista llegara directo a ejecutar.
          </p>
          {virtualQuote ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <MiniInfo label="Urgencia" value={virtualQuoteUrgencyLabels[virtualQuote.urgency]} />
              <MiniInfo label="Archivos" value={`${virtualQuote.attachmentCount} referencia${virtualQuote.attachmentCount === 1 ? "" : "s"}`} />
              <MiniInfo label="Estado" value={virtualQuoteStatusLabels[virtualQuote.status]} />
            </div>
          ) : null}
          {virtualQuote?.offer ? (
            <div className="mt-3 rounded-2xl bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="block text-[11px] font-black uppercase text-muted">Propuesta del especialista</span>
                  <strong className="text-base text-ink">{offerCreditsLabel(virtualQuote.offer)}</strong>
                </div>
                {virtualQuote.offer.requiresVisit ? <span className="chip bg-amber-50 text-amber-800">Recomienda visita</span> : null}
              </div>
              {virtualQuote.offer.comment ? <p className="mt-2 text-xs font-bold leading-5 text-muted">{virtualQuote.offer.comment}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-primary min-h-11 px-4 text-xs" type="button" onClick={onApproveOffer}>
                  Aprobar cotización
                </button>
                <button className="btn-secondary min-h-11 px-4 text-xs" type="button" onClick={onRejectOffer}>
                  Rechazar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Link
          href={href}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-2 text-xs font-black text-brand-dark transition duration-200 hover:border-brand hover:bg-brand-soft active:scale-[0.98]"
        >
          Ver perfil
        </Link>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-2 text-xs font-black text-brand-dark transition duration-200 hover:border-brand hover:bg-brand-soft active:scale-[0.98]"
          type="button"
          onClick={quote ? onVirtualQuote : onQuote}
          data-event="bolsa_quote_item"
        >
          {quote ? virtualQuote ? "Ver cotización" : "Iniciar cotización" : "Cotizar"}
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-2 text-xs font-black text-white transition duration-200 hover:bg-brand-dark active:scale-[0.98]"
          type="button"
          onClick={quote ? onVirtualQuote : onReserve}
          data-event="bolsa_reserve_item"
        >
          {quote ? virtualQuote?.offer ? "Revisar propuesta" : "Enviar fotos" : item.type === "visit" ? "Solicitar visita" : "Reservar"}
        </button>
      </div>
    </article>
  );
}

function VirtualQuoteModal({
  item,
  quote,
  onClose,
  onSaved,
  onApprove,
  onReject,
}: {
  item: OficiosProCartItem;
  quote: VirtualQuoteRequest | null;
  onClose: () => void;
  onSaved: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [problemTitle, setProblemTitle] = useState(quote?.problemTitle ?? item.serviceName ?? item.title);
  const [description, setDescription] = useState(quote?.description ?? "");
  const [locationDetail, setLocationDetail] = useState(quote?.locationDetail ?? "");
  const [commune, setCommune] = useState(quote?.commune ?? item.specialistCommune ?? "");
  const [region, setRegion] = useState(quote?.region ?? "");
  const [urgency, setUrgency] = useState<VirtualQuoteUrgency>(quote?.urgency ?? "esta_semana");
  const [attachmentCount, setAttachmentCount] = useState(quote?.attachmentCount ?? 0);
  const [videoReference, setVideoReference] = useState(quote?.videoReference ?? "");
  const [additionalComments, setAdditionalComments] = useState(quote?.additionalComments ?? "");
  const [customerName, setCustomerName] = useState(quote?.customerName ?? "");
  const [customerEmail, setCustomerEmail] = useState(quote?.customerEmail ?? "");
  const [customerPhone, setCustomerPhone] = useState(quote?.customerPhone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitLockRef = useRef(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || submitLockRef.current) return;
    submitLockRef.current = true;
    setSubmitting(true);
    setError("");
    const payload: VirtualQuoteCreateInput = {
      cartItem: item,
      problemTitle: problemTitle.trim(),
      description: description.trim(),
      locationDetail: locationDetail.trim(),
      commune: commune.trim(),
      region: region.trim() || undefined,
      urgency,
      attachmentCount,
      videoReference: videoReference.trim() || undefined,
      additionalComments: additionalComments.trim() || undefined,
      customerName: customerName.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
    };
    if (!payload.problemTitle || !payload.description || !payload.commune) {
      setSubmitting(false);
      submitLockRef.current = false;
      setError("Cuéntanos el problema, la comuna y una descripción para que el especialista pueda cotizar.");
      return;
    }
    try {
      const result = await createVirtualQuote(payload);
      if (!result.remote.ok && result.remote.error && result.remote.error !== "database_not_configured") {
        setError("Guardamos tu solicitud localmente, pero no pudimos sincronizarla ahora. El equipo OficiosPro puede revisarla cuando vuelva la conexión.");
        onSaved();
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  }

  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-ink/65 px-4 py-6 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-line bg-white p-5 shadow-lift md:p-6" role="dialog" aria-modal="true" aria-labelledby="virtual-quote-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Diagnostico virtual</p>
            <h2 id="virtual-quote-title" className="text-2xl font-black text-ink">Cotiza con fotos antes de la visita</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              Los créditos solo se retienen cuando apruebas la cotización. Si el caso requiere revision presencial, el especialista podra recomendar una visita técnica.
            </p>
          </div>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-white text-muted transition hover:border-brand hover:bg-brand-soft hover:text-brand-dark" type="button" onClick={onClose} aria-label="Cerrar cotización virtual">
            <span aria-hidden className="text-2xl leading-none">×</span>
          </button>
        </div>

        {quote ? (
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-brand/15 bg-brand-soft p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-brand-dark">{quote.problemTitle}</strong>
                <span className="chip bg-white text-brand-dark">{virtualQuoteStatusLabels[quote.status]}</span>
              </div>
              <p className="mt-2 text-sm font-bold leading-6 text-brand-dark/80">{quote.description}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <MiniInfo label="Comuna" value={quote.commune} />
                <MiniInfo label="Urgencia" value={virtualQuoteUrgencyLabels[quote.urgency]} />
                <MiniInfo label="Referencias" value={`${quote.attachmentCount} archivo${quote.attachmentCount === 1 ? "" : "s"}`} />
              </div>
            </div>

            {quote.offer ? (
              <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <span className="block text-[11px] font-black uppercase text-muted">Propuesta recibida</span>
                <h3 className="mt-1 text-xl font-black text-ink">{offerCreditsLabel(quote.offer)}</h3>
                {quote.offer.estimatedDuration ? <p className="mt-1 text-sm font-bold text-muted">Duracion estimada: {quote.offer.estimatedDuration}</p> : null}
                {quote.offer.comment ? <p className="mt-3 text-sm font-semibold leading-6 text-muted">{quote.offer.comment}</p> : null}
                {quote.offer.conditions ? <p className="mt-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-muted">{quote.offer.conditions}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => {
                      onApprove();
                      onClose();
                    }}
                  >
                    Aprobar cotización
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => {
                      onReject();
                      onClose();
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold leading-6 text-muted">
                Tu solicitud quedo lista para revision. El especialista podra pedir mas informacion, enviar una propuesta en créditos o recomendar visita técnica.
              </div>
            )}
          </div>
        ) : (
          <form className="mt-5 grid gap-4" onSubmit={submit}>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
              En piloto, si aun no hay almacenamiento privado configurado, no guardamos fotos ni videos en el navegador. Te pediremos esas referencias por un canal seguro despues de recibir la solicitud.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="field sm:col-span-2">
                Problema principal
                <input value={problemTitle} onChange={(event) => setProblemTitle(event.target.value)} placeholder="Ej: fuga bajo lavaplatos" />
              </label>
              <label className="field sm:col-span-2">
                Descripcion
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe que ocurre, desde cuando y que ya intentaste." rows={4} />
              </label>
              <label className="field">
                Comuna
                <input value={commune} onChange={(event) => setCommune(event.target.value)} placeholder="Ej: Las Condes" />
              </label>
              <label className="field">
                Region
                <input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="Ej: Metropolitana" />
              </label>
              <label className="field sm:col-span-2">
                Direccion o referencia
                <input value={locationDetail} onChange={(event) => setLocationDetail(event.target.value)} placeholder="Sector, edificio, casa, acceso o referencia" />
              </label>
              <label className="field">
                Urgencia
                <select value={urgency} onChange={(event) => setUrgency(event.target.value as VirtualQuoteUrgency)}>
                  <option value="hoy">Hoy</option>
                  <option value="esta_semana">Esta semana</option>
                  <option value="flexible">Flexible</option>
                </select>
              </label>
              <label className="field">
                Fotos o videos
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(event) => setAttachmentCount(event.currentTarget.files?.length ?? 0)}
                />
              </label>
              <label className="field sm:col-span-2">
                Link opcional
                <input value={videoReference} onChange={(event) => setVideoReference(event.target.value)} placeholder="Link privado a fotos/video si ya lo tienes" />
              </label>
              <label className="field">
                Nombre
                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Tu nombre" />
              </label>
              <label className="field">
                Telefono
                <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="+56 9..." />
              </label>
              <label className="field sm:col-span-2">
                Email
                <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="tu@email.cl" />
              </label>
              <label className="field sm:col-span-2">
                Comentarios adicionales
                <textarea value={additionalComments} onChange={(event) => setAdditionalComments(event.target.value)} placeholder="Horarios, restricciones, materiales o detalles relevantes." rows={3} />
              </label>
            </div>
            {attachmentCount ? <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold text-muted">Referencias seleccionadas: {attachmentCount}. Guardamos solo el conteo; los archivos no quedan guardados en este navegador.</p> : null}
            {error ? <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar fotos para cotizar"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function PurchaseBagCard({ item }: { item: OficiosProCartItem }) {
  const amount = itemAmountCLP(item);
  const isPlan = item.type === "subscription_plan";
  return (
    <article className="rounded-[24px] border border-line bg-white p-4 shadow-sm transition duration-200 hover:border-brand/30 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-brand-dark">
            {bagTypeLabel(item.type)}
          </span>
          <strong className="mt-2 block text-base text-ink">{item.title}</strong>
          <p className="mt-1 text-sm font-bold text-muted">
            {isPlan
              ? `${item.credits ?? 0} créditos al mes · acumulables · descuento de 2 créditos por solicitud`
              : item.credits
                ? `${item.credits} créditos para usar en cualquier servicio`
                : "Listo para continuar al pago"}
          </p>
        </div>
        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-muted transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          type="button"
          onClick={() => removeCartItem(item.id)}
          aria-label={`Eliminar ${item.title} de la bolsa`}
        >
          <TrashIcon />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-base font-black text-ink">{amount ? `${formatCLP(amount)}${isPlan ? " /mes" : ""}` : "Monto por confirmar"}</span>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-xs font-black text-white transition duration-200 hover:bg-brand-dark active:scale-[0.98]" href={checkoutUrlForItems([item])}>
          Continuar al checkout
        </Link>
      </div>
    </article>
  );
}

function Row({ label, value, accent, emerald }: { label: string; value: string; accent?: boolean; emerald?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <span className={emerald ? "text-emerald-700" : accent ? "text-brand-dark" : "text-ink"}>{value}</span>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <span className="block text-[10px] font-black uppercase text-muted">{label}</span>
      <strong className="text-xs text-ink">{value}</strong>
    </div>
  );
}

function offerCreditsLabel(offer: NonNullable<VirtualQuoteRequest["offer"]>) {
  if (offer.pricingMode === "fixed" && offer.creditPrice) return `${offer.creditPrice} créditos`;
  if (offer.pricingMode === "range") return `${offer.minCredits ?? 0}-${offer.maxCredits ?? 0} créditos`;
  if (offer.pricingMode === "visit_then_quote") return "Recomienda visita técnica";
  return "Requiere mas informacion";
}

async function syncVirtualQuoteDecision(quote: VirtualQuoteRequest, action: "approve" | "reject") {
  const id = quote.remoteId ?? quote.id;
  if (!id || typeof window === "undefined") return;
  try {
    await fetch(`/api/quotes/virtual/${encodeURIComponent(id)}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: action === "approve" ? "Cliente aprobo cotización virtual." : "Cliente rechazo cotización virtual.",
      }),
    });
  } catch {
    // La bolsa mantiene respaldo local si el Worker o D1 aun no estan disponibles.
  }
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

function isQuoteItem(item: OficiosProCartItem) {
  return item.type === "quote_request" || item.pricingMode === "quote_required" || item.pricingMode === "virtual_diagnosis" || item.pricingMode === "range" || item.pricingMode === "custom";
}

function profileHref(item: OficiosProCartItem) {
  if (!item.specialistSlug && !item.specialistId) return `/especialistas?sourceSection=${sourceSection}`;
  return `${getSpecialistProfileUrl(item)}&sourceSection=${sourceSection}`;
}

function pricingLabel(item: OficiosProCartItem) {
  const credits = item.credits ?? 0;
  switch (item.pricingMode) {
    case "hourly":
      return `${credits} créditos · por hora`;
    case "range":
      return `Desde ${credits} créditos`;
    case "quote_required":
    case "virtual_diagnosis":
    case "custom":
      return "Requiere cotización";
    case "visit_then_quote":
      return `Visita desde ${credits} créditos`;
    default:
      return credits ? `${credits} créditos` : "Por confirmar";
  }
}

function bagTypeLabel(type: OficiosProCartItem["type"]) {
  const labels: Record<OficiosProCartItem["type"], string> = {
    credit_pack: "Paquete de créditos",
    subscription_plan: "Plan Club Hogar",
    service_request: "Solicitud",
    quote_request: "Cotización",
    visit: "Visita técnica",
    additional_charge: "Adicional aprobado",
  };
  return labels[type];
}
