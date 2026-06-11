import Link from "next/link";

type UseCase = {
  title: string;
  detail: string;
  image: string;
  category: string;
  specialty: string;
};

const useCases: UseCase[] = [
  {
    title: "Comunidades y edificios",
    detail: "Bombas, portones, calderas y áreas comunes",
    image: "/assets/work-garden.webp",
    category: "comunidades",
    specialty: "edificios-condominios",
  },
  {
    title: "Oficinas y comercios",
    detail: "Mantención continua para locales y sucursales",
    image: "/assets/club-empresas-small.webp",
    category: "empresas",
    specialty: "mantencion-comercial",
  },
  {
    title: "Restaurantes y frío",
    detail: "Climatización, cámaras y equipos críticos",
    image: "/assets/work-hvac.webp",
    category: "climatizacion",
    specialty: "aire-acondicionado-calefaccion",
  },
  {
    title: "Industria y bodegas",
    detail: "Tableros, motores y mantenimiento preventivo",
    image: "/assets/work-electrical.webp",
    category: "industria",
    specialty: "mantencion-industrial",
  },
];

function useCaseHref(useCase: UseCase) {
  return `/especialistas?${new URLSearchParams({
    categoria: useCase.category,
    especialidad: useCase.specialty,
    sourceSection: "home_business_use_cases",
  }).toString()}`;
}

/** Cards visuales de segmentos empresa/comunidades con imagen + CTA real. */
export function HomeBusinessUseCases() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {useCases.map((useCase) => (
        <Link
          key={useCase.title}
          href={useCaseHref(useCase)}
          className="group relative flex min-h-44 flex-col justify-end overflow-hidden rounded-[22px] border border-white/10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lift"
          data-event="home_business_use_case"
        >
          <img
            src={useCase.image}
            alt={useCase.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/10" />
          <div className="relative p-4">
            <strong className="block text-base font-black leading-tight text-white">{useCase.title}</strong>
            <span className="mt-1 block text-xs font-bold text-white/80">{useCase.detail}</span>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-white/95 transition duration-200 group-hover:gap-2">
              Ver especialistas <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
