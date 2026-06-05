import Link from "next/link";

const navItems = [
  { href: "/especialistas", label: "Especialistas" },
  { href: "/club-hogar", label: "Club Hogar" },
  { href: "/empresas", label: "Empresas" },
  { href: "/registro-especialista", label: "Trabaja con nosotros" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-3 font-black">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-sm text-white shadow-lg shadow-brand/25">
            OP
          </span>
          <span className="text-xl tracking-tight">OficiosPro</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-black text-muted lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="rounded-2xl px-4 py-3 text-sm font-black text-muted transition hover:bg-slate-100 hover:text-brand">
            Ingresar
          </Link>
          <Link href="/especialistas" className="btn-primary">
            Ver técnicos
          </Link>
        </div>

        <Link href="/especialistas" className="btn-primary px-4 md:hidden">
          Técnicos
        </Link>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-line/70 bg-white px-5 py-3 text-sm font-black text-muted lg:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full bg-slate-50 px-4 py-2 transition hover:bg-brand-soft hover:text-brand-dark">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
