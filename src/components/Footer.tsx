import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const groups = [
  {
    title: "Producto",
    links: [
      { href: "/especialistas", label: "Especialistas" },
      { href: "/especialistas-fundadores", label: "Especialistas fundadores" },
      { href: "/club-hogar", label: "Club Hogar" },
      { href: "/empresas", label: "Empresas" },
      { href: "/impacto", label: "Impacto" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { href: "/dashboard-cliente", label: "Dashboard cliente" },
      { href: "/dashboard-especialista", label: "Dashboard especialista" },
      { href: "/dashboard-empresa", label: "Dashboard empresa" },
    ],
  },
  {
    title: "Operación",
    links: [
      { href: "/registro-cliente", label: "Registro cliente" },
      { href: "/registro-especialista", label: "Registro especialista" },
      { href: "/referidos/especialistas", label: "Referidos especialistas" },
      { href: "/instituciones", label: "Instituciones" },
      { href: "/admin", label: "Admin" },
    ],
  },
  {
    title: "Confianza",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "/faq", label: "FAQ" },
      { href: "/terminos", label: "Términos" },
      { href: "/privacidad", label: "Privacidad" },
      { href: "/impacto", label: "Impacto" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-enterprise px-5 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1.4fr]">
        <div>
          <Link href="/" className="flex items-center font-black" aria-label="Ir al inicio de OficiosPro">
            <BrandLogo variant="white" size="lg" />
          </Link>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/70">
            Técnicos verificados, créditos acumulables y dashboards para convertir mantenciones del hogar y operación empresarial en una experiencia confiable.
          </p>
          <p className="mt-4 max-w-xl text-lg font-black leading-7 text-white">
            Empoderamos el oficio. Empoderamos al trabajador.
          </p>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/70">
            El lugar donde los buenos trabajadores brillan, construyen reputación y acceden a mejores oportunidades.
          </p>
          <p className="mt-4 max-w-xl text-sm font-black leading-6 text-white">
            Contacto: bperez@oficiospro.cl
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Pago seguro", "Garantía OficiosPro", "Técnicos verificados", "Cobertura nacional"].map((item) => (
              <span key={item} className="chip bg-white/10 text-white">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="font-black">{group.title}</h3>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-white/70">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
