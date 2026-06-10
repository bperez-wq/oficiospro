"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCLP } from "@/data/marketplace";
import { clearCart, getCartItems, onCartChange, removeCartItem, type OficiosProCartItem } from "@/lib/cart";

export function CartButton({ onOpen }: { onOpen: () => void }) {
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
      className="relative grid h-11 min-w-11 place-items-center rounded-2xl border border-line bg-white px-3 text-sm font-black text-ink shadow-sm transition hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
      type="button"
      onClick={onOpen}
      aria-label="Abrir carrito OficiosPro"
    >
      <span aria-hidden="true">Bolsa</span>
      {count ? (
        <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-brand px-1 text-xs font-black text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<OficiosProCartItem[]>([]);

  useEffect(() => {
    function refresh() {
      setItems(getCartItems());
    }
    refresh();
    return onCartChange(refresh);
  }, []);

  const totals = useMemo(
    () => ({
      credits: items.reduce((sum, item) => sum + Number(item.credits ?? 0), 0),
      priceCLP: items.reduce((sum, item) => sum + Number(item.priceCLP ?? 0), 0),
    }),
    [items],
  );
  const checkoutHref = checkoutUrlForItems(items);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-ink/60 p-3 backdrop-blur-sm md:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="ml-auto flex h-full max-w-lg flex-col overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-card">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <p className="eyebrow">Carrito</p>
            <h2 className="text-3xl font-black text-ink">Tu carrito OficiosPro</h2>
            <p className="mt-1 text-sm font-bold text-muted">Guarda creditos, planes y solicitudes antes de pagar.</p>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-full border border-line text-xl font-black text-muted transition hover:bg-slate-50 hover:text-ink" type="button" onClick={onClose} aria-label="Cerrar carrito">
            x
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto p-5">
          {items.length ? (
            <>
              <div className="grid gap-3">
                {items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-black uppercase text-brand-dark">{cartTypeLabel(item.type)}</span>
                        <strong className="mt-1 block text-lg text-ink">{item.title}</strong>
                        <p className="mt-1 text-sm font-bold text-muted">
                          {[item.serviceName, item.specialistName, item.pricingMode].filter(Boolean).join(" - ") || "Listo para continuar"}
                        </p>
                      </div>
                      <button className="rounded-full border border-line px-3 py-1 text-xs font-black text-muted transition hover:border-rose-200 hover:text-rose-700" type="button" onClick={() => removeCartItem(item.id)}>
                        Quitar
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm font-black">
                      {item.credits ? <span className="rounded-full bg-white px-3 py-1 text-brand-dark">{item.credits} creditos</span> : null}
                      {item.priceCLP ? <span className="rounded-full bg-white px-3 py-1 text-ink">{formatCLP(item.priceCLP)}</span> : null}
                    </div>
                  </article>
                ))}
              </div>
              <div className="rounded-2xl border border-brand/15 bg-brand-soft p-4">
                <span className="text-xs font-black uppercase text-brand-dark">Resumen</span>
                <div className="mt-2 grid gap-2 text-sm font-black text-brand-dark sm:grid-cols-2">
                  <span>{totals.credits} creditos</span>
                  <span>{totals.priceCLP ? formatCLP(totals.priceCLP) : "Precio por confirmar"}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="grid content-center gap-4 rounded-[24px] border border-line bg-slate-50 p-6 text-center">
              <h3 className="text-2xl font-black">Tu carrito esta vacio</h3>
              <p className="text-sm font-bold leading-6 text-muted">Explora especialistas, compra creditos o elige un plan para dejar tu intencion guardada.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link className="btn-primary" href="/especialistas" onClick={onClose}>
                  Explorar especialistas
                </Link>
                <Link className="btn-secondary" href="/checkout" onClick={onClose}>
                  Comprar creditos
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link className={`btn-primary text-center ${items.length ? "" : "pointer-events-none opacity-50"}`} href={checkoutHref} onClick={onClose}>
              Continuar al checkout
            </Link>
            <button className="btn-secondary" type="button" disabled={!items.length} onClick={clearCart}>
              Vaciar carrito
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function cartTypeLabel(type: OficiosProCartItem["type"]) {
  const labels: Record<OficiosProCartItem["type"], string> = {
    credit_pack: "Paquete de creditos",
    subscription_plan: "Plan",
    service_request: "Solicitud",
    quote_request: "Cotizacion",
    visit: "Visita tecnica",
  };
  return labels[type];
}

function checkoutUrlForItems(items: OficiosProCartItem[]) {
  const plan = items.find((item) => item.type === "subscription_plan" && item.planId);
  if (plan?.planId) return `/checkout?plan=${encodeURIComponent(plan.planId)}`;
  const quoteOrVisit = items.find((item) => item.type === "quote_request" || item.type === "visit" || item.type === "service_request");
  if (quoteOrVisit?.pricingMode === "visit_then_quote") return "/checkout?mode=visit_hold";
  if (quoteOrVisit?.pricingMode === "quote_required" || quoteOrVisit?.pricingMode === "range") return "/checkout?mode=quote_acceptance_hold";
  return "/checkout";
}
