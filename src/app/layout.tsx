import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConversionModalProvider } from "@/components/ConversionModal";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SpecialistAssistantWidget } from "@/components/SpecialistAssistantWidget";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "OficiosPro Chile | Especialistas verificados para hogar y empresas",
  description:
    "OficiosPro conecta hogares y empresas con gasfíteres, electricistas, jardineros, técnicos HVAC y especialistas verificados usando créditos, reputación y disponibilidad.",
  keywords: [
    "aire acondicionado Las Condes",
    "electricista SEC Santiago",
    "técnico refrigeración Curicó",
    "bombas de calor Puerto Varas",
    "técnicos verificados Chile",
    "servicios técnicos para empresas",
  ],
  metadataBase: new URL("https://oficiospro.cl"),
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/brand/favicon-op.svg", type: "image/svg+xml" }],
    shortcut: ["/brand/favicon-op.svg"],
    apple: [{ url: "/brand/logo-worker-tile.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "OficiosPro Chile | Especialistas verificados para hogar y empresas",
    description: "Reserva especialistas confiables para hogar y empresas con créditos OficiosPro.",
    url: "https://oficiospro.cl",
    siteName: "OficiosPro",
    locale: "es_CL",
    type: "website",
    images: [
      {
        url: "/brand/logo-worker-tile.svg",
        width: 512,
        height: 512,
        alt: "OficiosPro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OficiosPro Chile | Especialistas verificados",
    description: "Encuentra especialistas verificados para tu hogar o empresa en minutos.",
    images: ["/brand/logo-worker-tile.svg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <I18nProvider>
          <ConversionModalProvider>
            <Header />
            {children}
            <Footer />
            <SpecialistAssistantWidget />
          </ConversionModalProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
