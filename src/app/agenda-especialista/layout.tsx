import type { ReactNode } from "react";
import { noindexMetadata } from "@/lib/seo/noindexMetadata";

export const metadata = noindexMetadata;

export default function AgendaEspecialistaLayout({ children }: { children: ReactNode }) {
  return children;
}
