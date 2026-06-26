"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { SpecialistRegisterForm } from "@/components/Forms";

// Abre el formulario de registro en un popup, para empezar a inscribirse de
// inmediato sin tener que bajar por la pagina. El formulario solo se monta cuando
// el modal esta abierto, asi precarga el borrador (oficio/comuna) recien guardado.
//
// IMPORTANTE: el overlay se renderiza con createPortal a document.body. Si se
// renderizara en su lugar del arbol, un ancestro con transform/will-change (las
// animaciones de revelado) atraparia el `position: fixed` y el modal quedaria
// encajado dentro de una tarjeta en vez de cubrir la pantalla.
export function SpecialistRegisterModal({
  label,
  className = "btn-primary",
  onOpen,
}: {
  label: ReactNode;
  className?: string;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const overlay = (
    <div
      className="fixed inset-0 z-[100] flex justify-center overflow-y-auto overscroll-contain bg-ink/70 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
    >
      <div className="animate-scale-in relative my-4 w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          aria-label="Cerrar"
          className="sticky top-0 z-10 ml-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-ink shadow-card transition hover:bg-slate-100"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
        <div className="-mt-12">
          <SpecialistRegisterForm />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
      >
        {label}
      </button>
      {mounted && open ? createPortal(overlay, document.body) : null}
    </>
  );
}
