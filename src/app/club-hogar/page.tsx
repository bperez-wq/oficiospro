import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { TransactionList } from "@/components/Lists";
import { defaultTransactions } from "@/data/mock";

export default function ClubHogarPage() {
  return (
    <main className="section grid gap-6">
      <PlatformNav />
      <AppHero
        eyebrow="Club Hogar"
        title="Créditos acumulables para resolver tu casa cuando lo necesites."
        subtitle="El modelo Club Hogar permite suscripción mensual, acumulación hasta 24 meses y reservas con pago protegido."
      >
        <Link className="btn-primary" href="/especialistas">Usar créditos</Link>
        <Link className="btn-secondary" href="/registro-cliente">Crear cuenta</Link>
      </AppHero>
      <section className="grid gap-5 md:grid-cols-3">
        <Plan name="Básico" price="$19.990/mes" text="20 créditos mensuales para mantenciones simples." />
        <Plan name="Plus" price="$39.990/mes" text="45 créditos mensuales. En 3 meses acumulas 135 créditos." featured />
        <Plan name="Premium" price="$69.990/mes" text="85 créditos mensuales y atención prioritaria." />
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-5 text-2xl font-black">Simulador Club Hogar</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {["45 créditos/mes", "90 créditos", "135 créditos"].map((item, index) => (
              <div key={item} className="rounded-2xl bg-brand-soft p-5">
                <span className="font-bold text-muted">Mes {index + 1}</span>
                <strong className="block text-2xl font-black">{item}</strong>
              </div>
            ))}
          </div>
          <p className="mt-4 text-muted">Puedes usarlo en gasfitería, electricidad, jardín o climatización.</p>
        </article>
        <article className="panel">
          <h2 className="mb-5 text-2xl font-black">Historial demo</h2>
          <TransactionList transactions={defaultTransactions} />
        </article>
      </section>
    </main>
  );
}

function Plan({ name, price, text, featured = false }: { name: string; price: string; text: string; featured?: boolean }) {
  return (
    <article className={`panel ${featured ? "bg-brand text-white" : ""}`}>
      <span className={featured ? "font-black text-white/70" : "font-black text-brand"}>{name}</span>
      <strong className="my-3 block text-3xl font-black">{price}</strong>
      <p className={featured ? "text-white/75" : "text-muted"}>{text}</p>
    </article>
  );
}
