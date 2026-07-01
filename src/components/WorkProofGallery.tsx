import Link from "next/link";
import type { WorkHistory } from "@/data/mock";

type StoryMeta = {
  service: string;
  cta: string;
  category: string;
  specialty: string;
};

const storyMeta: Record<string, StoryMeta> = {
  "Baño reparado": { service: "Gasfitería", cta: "Buscar gasfíter", category: "hogar", specialty: "gasfiteria" },
  "Tablero eléctrico renovado": { service: "Electricidad", cta: "Buscar electricista", category: "hogar", specialty: "electricidad" },
  "Aire acondicionado instalado": { service: "Climatización", cta: "Buscar climatización", category: "climatizacion", specialty: "aire-acondicionado-calefaccion" },
  "Jardín recuperado": { service: "Jardinería", cta: "Buscar jardinero", category: "hogar", specialty: "jardineria-piscinas" },
};

const fallbackMeta: StoryMeta = { service: "Oficios", cta: "Buscar especialista", category: "hogar", specialty: "todas" };

function storyHref(meta: StoryMeta) {
  const params = new URLSearchParams({
    categoria: meta.category,
    especialidad: meta.specialty,
    sourceSection: "home_work_proof_gallery",
  });
  return `/especialistas?${params.toString()}`;
}

export function WorkProofGallery({ stories }: { stories: WorkHistory[] }) {
  const [featured, ...rest] = stories;
  if (!featured) return null;

  return (
    <div>
      {/* Mobile: carrusel horizontal con snap */}
      <div className="no-scrollbar -mx-5 grid snap-x snap-mandatory auto-cols-[82%] grid-flow-col gap-3.5 overflow-x-auto scroll-px-5 px-5 pb-2 md:hidden">
        {stories.map((story) => (
          <ProofCard key={story.title} story={story} />
        ))}
      </div>

      {/* Desktop: grid editorial con card destacada */}
      <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
        <ProofCard story={featured} featured />
        {rest.map((story) => (
          <ProofCard key={story.title} story={story} />
        ))}
        <article className="flex flex-col justify-between rounded-[24px] border border-brand/15 bg-gradient-to-br from-brand-soft via-white to-accent-soft p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-card">
          <div>
            <span className="chip bg-white text-brand-dark">Confianza verificada</span>
            <h3 className="mt-3 text-xl font-black leading-tight text-ink">Cada trabajo deja evidencia, rating y reputación.</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              Revisa resultados reales por comuna antes de reservar con tus créditos.
            </p>
          </div>
          <Link
            href="/especialistas?sourceSection=home_work_proof_gallery"
            className="btn-primary mt-5 w-full"
            data-event="work_proof_gallery_cta"
          >
            Buscar especialista
          </Link>
        </article>
      </div>
    </div>
  );
}

function ProofCard({ story, featured = false }: { story: WorkHistory; featured?: boolean }) {
  const meta = storyMeta[story.title] ?? fallbackMeta;
  const href = storyHref(meta);

  return (
    <article
      className={`group relative snap-start overflow-hidden rounded-[24px] border border-line bg-ink shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lift ${
        featured ? "min-h-[28rem] lg:col-span-2 lg:row-span-2" : "min-h-[18rem]"
      }`}
    >
      <img
        src={story.image}
        alt={`${story.title} en ${story.commune}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/10" />

      <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-brand-dark shadow-soft backdrop-blur">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" /> Trabajo verificado
        </span>
        <span className="rounded-full bg-ink/70 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
          ★ {story.rating.toFixed(1)}
        </span>
      </div>

      <div className={`absolute inset-0 flex flex-col justify-end p-5 pt-24 ${featured ? "lg:p-7 lg:pt-28" : ""}`}>
        <h3 className={`font-black leading-tight text-white ${featured ? "text-2xl lg:text-3xl" : "text-xl"}`}>{story.title}</h3>
        <p className="mt-1 text-sm font-bold text-white/85">
          {story.commune} · {meta.service}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
            {story.credits} créditos
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
            Especialista verificado
          </span>
        </div>
        <Link
          href={href}
          className="mt-4 inline-flex min-h-11 w-fit items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-xs font-black text-brand-dark transition duration-200 hover:bg-brand-soft active:scale-[0.98]"
          data-event="work_proof_card_cta"
        >
          {meta.cta}
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </article>
  );
}
