import Link from "next/link";

const navItems = [
  { href: "/especialistas", label: "Técnicos" },
  { href: "/club-hogar", label: "Club Hogar" },
  { href: "/empresas", label: "Empresas" },
  { href: "/registro-especialista", label: "Especialistas" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5">
        <Link href="/" className="flex items-center gap-3 font-black">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-sm text-white shadow-lg shadow-brand/25">
            OP
          </span>
          <span className="text-xl">OficiosPro</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-black text-muted md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="font-black text-muted transition hover:text-brand">
            Ingresar
          </Link>
          <Link href="/especialistas" className="btn-primary">
            Ver técnicos
          </Link>
        </div>

        <Link href="/especialistas" className="btn-primary md:hidden">
          Técnicos
        </Link>
      </div>
    </header>
  );
}
