"use client";

import { useEffect, useState } from "react";

export function PostulationToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setVisible(params.get("postulacion") === "recibida");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-brand/20 bg-white p-4 shadow-card" role="status" aria-live="polite">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-black text-brand-dark">Postulación recibida. Revisaremos la información y te contactaremos pronto.</p>
        <button className="btn-secondary" type="button" onClick={() => setVisible(false)}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
