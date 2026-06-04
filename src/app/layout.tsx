import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "OficiosPro Chile | Técnicos verificados para hogar y empresas",
  description:
    "OficiosPro conecta hogares y empresas con gasfíteres, electricistas, jardineros, técnicos HVAC y especialistas verificados usando créditos, reputación y disponibilidad.",
  metadataBase: new URL("https://oficiospro.cl"),
  openGraph: {
    title: "OficiosPro Chile | Técnicos verificados para hogar y empresas",
    description: "Reserva especialistas confiables para hogar y empresas con créditos OficiosPro.",
    url: "https://oficiospro.cl",
    siteName: "OficiosPro",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OficiosPro Chile | Técnicos verificados",
    description: "Encuentra técnicos verificados para tu hogar o empresa en minutos.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        {children}
        <footer className="bg-enterprise px-5 py-10 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <strong>OficiosPro</strong>
            <p className="max-w-2xl text-sm font-semibold text-white/70">
              Club Hogar y OficiosPro Empresas para servicios técnicos verificados en Chile.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
