import Link from "next/link";
import { ConversionButton } from "@/components/ConversionModal";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { SpecialistPublicProfile } from "@/components/SpecialistPublicProfile";
import { specialists } from "@/data/mock";
import { bookingPrimaryAction, getPrimaryFlexibleService } from "@/lib/flexiblePricing";

export function generateStaticParams() {
  return [...specialists.map((specialist) => ({ id: specialist.id })), { id: "perfil-publico" }];
}

export default async function SpecialistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const specialist = specialists.find((item) => item.id === id || item.slug === id) ?? null;
  const primaryService = specialist ? getPrimaryFlexibleService(specialist) : null;

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      {specialist ? (
        <AppHero eyebrow={specialist.category} title={specialist.name} subtitle={`${specialist.specialty} en ${specialist.zone}. ${specialist.description}`}>
          <ConversionButton type="reserva_especialista" sourceButton="Reservar desde perfil" specialist={specialist} className="btn-primary">
            {bookingPrimaryAction(primaryService!)}
          </ConversionButton>
          <Link className="btn-secondary" href="/especialistas">
            Volver al listado
          </Link>
        </AppHero>
      ) : null}
      <SpecialistPublicProfile id={id} initialSpecialist={specialist} />
    </main>
  );
}
