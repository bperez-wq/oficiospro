import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConversionModalProvider } from "@/components/ConversionModal";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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
  openGraph: {
    title: "OficiosPro Chile | Especialistas verificados para hogar y empresas",
    description: "Reserva especialistas confiables para hogar y empresas con créditos OficiosPro.",
    url: "https://oficiospro.cl",
    siteName: "OficiosPro",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OficiosPro Chile | Especialistas verificados",
    description: "Encuentra especialistas verificados para tu hogar o empresa en minutos.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ConversionModalProvider>
          <Header />
          {children}
          <Footer />
        </ConversionModalProvider>
      </body>
    </html>
  );
}
