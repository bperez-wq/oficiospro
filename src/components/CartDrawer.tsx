"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCLP } from "@/data/marketplace";
import { clearCart, getCartItems, onCartChange, removeCartItem, type OficiosProCartItem } from "@/lib/cart";
import { cartTotals, checkoutModeForCart, isCartItemCheckoutReady, itemAmountCLP } from "@/lib/payments/cart";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Naming oficial: la experiencia de usuario se llama "Bolsa" en todo OficiosPro
 * (botón, panel, textos y aria-labels). Los nombres técnicos Cart* se mantienen
 * para no romper integraciones existentes.
 */

export function CartButton({ onOpen }: { onOpen: () => void }) {
  const { t } = useI18n();
  const [count, setCount] = useState(0);

  useEffect(() => {
    function refresh() {
      setCount(getCartItems().length);
    }
    refresh();
    return onCartChange(refresh);
  }, []);

  return (
    <button
      className="relative inline-flex h-11 items-center gap-1.5 rounded-2xl border border-line bg-white px-3 text-sm font-black text-ink shadow-sm transition duration-200 hover:border-brand hover:bg-brand-soft hover:text-brand-dark active:scale-[0.97]"
      type="button"
      onClick={onOpen}
      aria-label={count ? `${t("nav.bag")} (${count})` : t("nav.bag")}
    >
      <BagIcon className="h-5 w-5" />
      <span className="hidden sm:inline" aria-hidden="true">{t("nav.bag")}</span>
      {count ? (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-black text-white shadow-sm ring-2 ring-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </button>
  );
}

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<OficiosProCartItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const refresh = useCallback(() => {
    try {
      setItems(getCartItems());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    refresh();
    return onCartChange(refresh);
  }, [refresh]);

  /* Bloquea el scroll del fondo y cierra con Escape mientras la bolsa está abierta. */
  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  const totals = useMemo(() => cartTotals(items), [items]);
  const checkoutReadyItems = useMemo(() => items.filter(isCartItemCheckoutReady), [items]);
  const checkoutHref = checkoutUrlForItems(checkoutReadyItems);
  const hasItems = items.length > 0;
  const hasCheckoutReadyItems = checkoutReadyItems.length > 0;
  const hasSubscription = items.some((item) => item.type === "subscription_plan");
  /* Drawer = vista rápida; /bolsa = decisión final. Con varios especialistas, priorizamos comparar. */
  const specialistItemCount = items.filter((item) => Boolean(item.specialistId)).length;
  const prioritizeFullBag = specialistItemCount > 1;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-ink/60 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside
        className="animate-fade-up fixed inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] border-t border-line bg-white shadow-lift md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-l-[28px] md:rounded-tr-none md:border-l md:border-t-0"
        role="dialog"
        aria-modal="true"
        aria-label="Tu bolsa OficiosPro"
      >
        {/* Header sticky: la X siempre visible y con área táctil de 44px */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-5 pb-4 pt-3 md:pt-5">
          <div className="min-w-0">
            <span aria-hidden className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-slate-200 md:hidden" />
            <p className="eyebrow mb-0.5">Bolsa</p>
            <h2 className="truncate text-2xl font-black text-ink">
              Tu bolsa {hasItems ? <span className="text-base font-black text-muted">· {items.length} {items.length === 1 ? "ítem" : "ítems"}</span> : null}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasItems ? (
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl bg-brand px-3.5 text-xs font-black text-white shadow-sm transition duration-200 hover:bg-brand-dark active:scale-[0.97]"
                href="/bolsa"
                onClick={onClose}
                data-event="cart_drawer_header_view_bag"
              >
                {items.length > 1 ? "Comparar en bolsa" : "Ver selección"}
                <span aria-hidden>→</span>
              </Link>
            ) : null}
            <button
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-white text-muted shadow-sm transition duration-200 hover:border-brand hover:bg-brand-soft hover:text-brand-dark active:scale-95"
              type="button"
              onClick={onClose}
              aria-label="Cerrar bolsa"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido con scroll interno */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {status === "loading" ? (
            <div className="grid gap-3" aria-hidden>
              {[0, 1, 2].map((index) => (
                <div key={index} className="rounded-2xl border border-line bg-white p-4">
                  <div className="h-3 w-20 animate-pulse rounded-md bg-slate-100" />
                  <div className="mt-2 h-4 w-3/4 animate-pulse rounded-md bg-slate-100" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : status === "error" ? (
            <div className="grid content-center gap-4 rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-center">
              <h3 className="text-xl font-black text-rose-700">No pudimos cargar tu bolsa</h3>
              <p className="text-sm font-bold leading-6 text-rose-700/80">Reintenta en unos segundos. Tus ítems guardados no se pierden.</p>
              <button className="btn-secondary mx-auto" type="button" onClick={refresh}>
                Reintentar
              </button>
            </div>
          ) : hasItems ? (
            <div className="grid gap-3">
              {items.map((item) => {
                const amount = itemAmountCLP(item);
                return (
                  <article key={item.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm transition duration-200 hover:border-brand/30">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        className="min-w-0 flex-1"
                        href="/bolsa"
                        onClick={onClose}
                        aria-label={`Revisar ${item.title} en la bolsa completa`}
                        data-event="cart_drawer_item_view_bag"
                      >
                        <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-brand-dark">
                          {cartTypeLabel(item.type)}
                        </span>
                        <strong className="mt-2 block text-base leading-snug text-ink transition group-hover:text-brand-dark">{item.title}</strong>
                        <p className="mt-1 line-clamp-2 text-sm font-bold text-muted">
                          {[item.serviceName, item.specialistName].filter(Boolean).join(" · ") || "Listo para continuar al pago"}
                        </p>
                      </Link>
                      <button
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                        type="button"
                        onClick={() => removeCartItem(item.id)}
                        aria-label={`Quitar ${item.title} de la bolsa`}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black text-muted">Cantidad: 1</span>
                      <div className="flex flex-wrap gap-2 text-sm font-black">
                        {item.credits ? <span className="rounded-full bg-brand-soft px-3 py-1 text-brand-dark">{item.credits} créditos</span> : null}
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-ink">{amount ? formatCLP(amount) : "Por confirmar"}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid h-full content-center gap-4 rounded-[24px] border border-dashed border-line bg-slate-50/70 p-6 text-center">
              <BagIcon className="mx-auto h-10 w-10 text-muted/40" />
              <h3 className="text-2xl font-black">Tu bolsa está vacía</h3>
              <p className="text-sm font-bold leading-6 text-muted">Explora especialistas, compra créditos o elige un plan: lo que agregues queda guardado aquí.</p>
              <div className="grid gap-2">
                <Link className="btn-primary" href="/especialistas" onClick={onClose}>
                  Explorar especialistas
                </Link>
                <Link className="btn-secondary" href="/checkout" onClick={onClose}>
                  Comprar créditos
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Resumen + CTA sticky */}
        {status === "ready" && hasItems ? (
          <div className="shrink-0 border-t border-line bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <div className="grid gap-1.5 text-sm font-bold text-muted">
              <div className="flex items-center justify-between">
                <span>Subtotal ({items.length} {items.length === 1 ? "ítem" : "ítems"})</span>
                <span className="text-ink">{totals.amountCLP ? formatCLP(totals.amountCLP) : "Por confirmar"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Créditos involucrados</span>
                <span className="text-brand-dark">{totals.credits} créditos</span>
              </div>
              {hasSubscription ? (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Beneficio Club Hogar</span>
                  <span>2 créditos de descuento por solicitud</span>
                </div>
              ) : null}
              <div className="mt-1 flex items-center justify-between border-t border-line pt-2 text-base font-black text-ink">
                <span>Total</span>
                <span>{totals.amountCLP ? formatCLP(totals.amountCLP) : "Se confirma en checkout"}</span>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {prioritizeFullBag ? (
                <>
                  <Link className="btn-primary w-full text-center" href="/bolsa" onClick={onClose} data-event="cart_drawer_view_bag">
                    Ver bolsa completa
                  </Link>
                  {hasCheckoutReadyItems ? (
                    <Link className="btn-secondary w-full text-center" href={checkoutHref} onClick={onClose} data-event="cart_drawer_checkout">
                      Continuar al checkout
                    </Link>
                  ) : null}
                </>
              ) : (
                <>
                  {hasCheckoutReadyItems ? (
                    <Link className="btn-primary w-full text-center" href={checkoutHref} onClick={onClose} data-event="cart_drawer_checkout">
                      Continuar al checkout
                    </Link>
                  ) : null}
                  <Link className="btn-secondary w-full text-center" href="/bolsa" onClick={onClose} data-event="cart_drawer_view_bag">
                    Ver bolsa completa
                  </Link>
                </>
              )}
              {!hasCheckoutReadyItems ? (
                <p className="rounded-2xl bg-amber-50 p-3 text-xs font-black leading-5 text-amber-900">
                  Revisa la cotizacion en la bolsa antes de pasar a checkout.
                </p>
              ) : null}
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-2xl px-4 text-sm font-black text-muted transition duration-200 hover:bg-slate-100 hover:text-rose-600"
                type="button"
                onClick={clearCart}
              >
                Vaciar bolsa
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 7h12l1.2 13a1.8 1.8 0 0 1-1.8 2H6.6a1.8 1.8 0 0 1-1.8-2L6 7Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

function cartTypeLabel(type: OficiosProCartItem["type"]) {
  const labels: Record<OficiosProCartItem["type"], string> = {
    credit_pack: "Paquete de créditos",
    subscription_plan: "Plan",
    service_request: "Solicitud",
    quote_request: "Cotización",
    visit: "Visita técnica",
    additional_charge: "Adicional aprobado",
  };
  return labels[type];
}

export function checkoutUrlForItems(items: OficiosProCartItem[]) {
  const mode = checkoutModeForCart(items);
  if (mode.mode === "subscription_plan" && mode.planId) return `/checkout?plan=${encodeURIComponent(mode.planId)}&cartItem=subscription`;
  if (mode.mode === "credit_pack" && mode.creditPackId) return `/checkout?creditPack=${encodeURIComponent(mode.creditPackId)}&cartItem=credit_pack`;
  if (mode.mode === "visit_fee") return "/checkout?mode=visit_hold";
  if (mode.mode === "quote_acceptance") return "/checkout?mode=quote_acceptance_hold";
  if (mode.mode === "additional_charge") return "/checkout?mode=additional_work_hold";
  return "/checkout";
}
