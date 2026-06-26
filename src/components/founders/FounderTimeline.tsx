const steps = [
  { n: "1", title: "Crea tu perfil", text: "Eliges tu oficio principal y completas tus datos básicos.", ring: "border-brand" },
  { n: "2", title: "Declara tus servicios", text: "Sumas tus servicios, tarifa esperada y las comunas donde trabajas.", ring: "border-sun" },
  { n: "3", title: "Quedas en revisión", text: "El equipo OficiosPro revisa tu perfil de forma manual en 48 h.", ring: "border-accent" },
  { n: "4", title: "Apareces como fundador", text: "Activamos tu perfil para que te encuentren y recibas solicitudes.", ring: "border-emerald-500" },
];

export function FounderTimeline() {
  return (
    <section id="proceso" className="rounded-[32px] border border-line bg-slate-50 p-7 md:p-10">
      <div className="max-w-2xl">
        <p className="eyebrow">Proceso claro</p>
        <h2 className="section-title">Cuatro pasos y tu perfil queda activo</h2>
      </div>
      <div className="relative mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <span className="pointer-events-none absolute left-[12%] right-[12%] top-9 hidden h-0.5 bg-gradient-to-r from-brand via-sun to-emerald-500 md:block" />
        {steps.map((step) => (
          <div key={step.n} className="relative text-center">
            <span
              className={`mx-auto grid h-18 w-18 place-items-center rounded-full border-[3px] bg-white text-2xl font-black text-ink shadow-soft ${step.ring}`}
              style={{ height: "4.5rem", width: "4.5rem" }}
            >
              {step.n}
            </span>
            <h3 className="mt-5 text-lg font-black text-ink">{step.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm font-semibold leading-6 text-muted">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
