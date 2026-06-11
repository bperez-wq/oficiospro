"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookingDrawer } from "@/components/BookingDrawer";
import { checkoutUrlForItems } from "@/components/CartDrawer";
import { availabilityDotStyles, levelChipStyles } from "@/components/SpecialistCompactCard";
import { availabilityLabels, specialists as catalogSpecialists, type Specialist } from "@/data/mock";
import { formatCLP } from "@/data/marketplace";
import { getCartItems, onCartChange, removeCartItem, type OficiosProCartItem } from "@/lib/cart";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { cartTotals, itemAmountCLP } from "@/lib/payments/cart";
import { getPublishedSpecialists, seedMockState } from "@/lib/storage";
import { getSpecialistLevel, type SpecialistLevel } from "@/lib/trust";

const sourceSection = "bolsa_page";

export default function BolsaPage() {
  const [items, setItems] = useState<OficiosProCartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [knownSpecialists, setKnownSpecialists] = useState<Specialist[]>(catalogSpecialists);
  const [booking, setBooking] = useState<{ specialist: Specialist; serviceId?: string } | null>(null);

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
  const reservableCredits = specialistItems.reduce((total, item) => total + (item.credits ?? 0), 0);
  const hasSubscription = items.some((item) => item.type === "subscription_plan");
  const checkoutHref = checkoutUrlForItems(items);

  function findSpecialist(item: OficiosProCartItem) {
    return knownSpecialists.find((specialist) => specialist.id === item.specialistId || specialist.slug === item.specialistSlug);
  }

  function openBooking(item: OficiosProCartItem, intendedAction: "reservar" | "solicitar") {
    const specialist = findSpecialist(item);
    if (!specialist) return;
    preserveSpecialistIntent({ specialist, intendedAction, source: "BolsaPage", sourceSection });
    setBooking({ specialist, serviceId: item.serviceId });
  }

  const primaryCta: { label: string; href?: string; onClick?: () => void } | null = (() => {
    if (!items.length) return null;
    if (!specialistItems.length) return { label: "Continuar al checkout", href: checkoutHref };
    if (specialistItems.length > 1) return { label: "Elegir especialista", href: "#bolsa-especialistas" };
    const single = specialistItems[0];
    if (isQuoteItem(single)) {
      return { label: "Enviar solicitud de cotización", onClick: () => openBooking(single, "solicitar"), href: findSpecialist(single) ? undefined : profileHref(single) };
    }
    return { label: "Confirmar reserva", onClick: () => openBooking(single, "reservar"), href: findSpecialist(single) ? undefined : profileHref(single) };
  })();

  return (
    <main className="min-h-screen bg-slate-50/70 pb-16">
      <div className="mx-auto max-w-7xl px-5 pt-10">
        <p className="eyebrow">Bolsa</p>
        <h1 className="text-3xl font-black text-ink md:text-5xl">Tu bolsa</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-muted">
          Revisa especialistas, créditos y solicitudes antes de confirmar.
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
              Agrega especialistas, créditos o un plan para comparar antes de confirmar.
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
                      onReserve={() => openBooking(item, "reservar")}
                      onQuote={() => openBooking(item, "solicitar")}
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
                {specialistItems.length && primaryCta?.label !== "Continuar al checkout" ? (
                  <Link className="btn-secondary w-full text-center" href={checkoutHref} data-event="bolsa_checkout">
                    Continuar al checkout
                  </Link>
                ) : null}
                <Link className="inline-flex min-h-10 items-center justify-center rounded-2xl px-4 text-sm font-black text-brand-dark transition hover:bg-brand-soft" href="/especialistas?sourceSection=bolsa">
                  Seguir explorando especialistas
                </Link>
              </div>
              <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-muted">
                Pago protegido: al reservar, tus créditos quedan retenidos y se liberan cuando confirmas el avance del trabajo.
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
    </main>
  );
}

/* ------------------------------------------------------------------ */

function SpecialistBagCard({
  item,
  specialist,
  onReserve,
  onQuote,
}: {
  item: OficiosProCartItem;
  specialist?: Specialist;
  onReserve: () => void;
  onQuote: () => void;
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
        {image ? (
          <img src={image} alt={item.specialistName ?? "Especialista"} className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
        ) : (
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-xl font-black text-white">
            {(item.specialistName ?? "OP").split(" ").map((part) => part[0]).join("").slice(0, 2)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <strong className="block truncate text-base text-ink">{item.specialistName ?? "Especialista OficiosPro"}</strong>
              <span className="block truncate text-sm font-bold text-muted">{specialist?.specialty ?? item.serviceName}</span>
            </div>
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
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
            {quote ? "Pendiente de enviar solicitud" : item.type === "visit" ? "Pendiente de confirmar visita" : "Listo para reservar"}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Link
          href={href}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-line bg-white px-2 text-xs font-black text-brand-dark transition duration-200 hover:border-brand hover:bg-brand-soft active:scale-[0.98]"
        >
          Ver perfil
        </Link>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-line bg-white px-2 text-xs font-black text-brand-dark transition duration-200 hover:border-brand hover:bg-brand-soft active:scale-[0.98]"
          type="button"
          onClick={onQuote}
          data-event="bolsa_quote_item"
        >
          Cotizar
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-2 text-xs font-black text-white transition duration-200 hover:bg-brand-dark active:scale-[0.98]"
          type="button"
          onClick={quote ? onQuote : onReserve}
          data-event="bolsa_reserve_item"
        >
          {quote ? "Enviar solicitud" : item.type === "visit" ? "Solicitar visita" : "Reservar"}
        </button>
      </div>
    </article>
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
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          type="button"
          onClick={() => removeCartItem(item.id)}
          aria-label={`Eliminar ${item.title} de la bolsa`}
        >
          <TrashIcon />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-base font-black text-ink">{amount ? `${formatCLP(amount)}${isPlan ? " /mes" : ""}` : "Monto por confirmar"}</span>
        <Link className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-4 text-xs font-black text-white transition duration-200 hover:bg-brand-dark active:scale-[0.98]" href={checkoutUrlForItems([item])}>
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

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

function isQuoteItem(item: OficiosProCartItem) {
  return item.type === "quote_request" || item.pricingMode === "quote_required" || item.pricingMode === "range" || item.pricingMode === "custom";
}

function profileHref(item: OficiosProCartItem) {
  const id = item.specialistSlug ?? item.specialistId ?? "";
  return `/especialistas/perfil?id=${encodeURIComponent(id)}&sourceSection=${sourceSection}`;
}

function pricingLabel(item: OficiosProCartItem) {
  const credits = item.credits ?? 0;
  switch (item.pricingMode) {
    case "hourly":
      return `${credits} créditos · por hora`;
    case "range":
      return `Desde ${credits} créditos`;
    case "quote_required":
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
