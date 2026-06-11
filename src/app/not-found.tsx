import { PremiumEmptyState } from "@/components/PremiumEmptyState";

export default function NotFound() {
  return (
    <main className="section">
      <PremiumEmptyState
        icon="🧭"
        eyebrow="Error 404"
        title="Esta página no existe o cambió de lugar."
        text="Vuelve al inicio o busca directamente al especialista que necesitas: hay perfiles verificados disponibles ahora."
        actions={[
          { label: "Buscar especialista", href: "/especialistas?sourceSection=not_found", primary: true, dataEvent: "browse_specialists_404" },
          { label: "Ir al inicio", href: "/" },
          { label: "Pedir ayuda", href: "/soporte" },
        ]}
      />
    </main>
  );
}
