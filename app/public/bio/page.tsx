import type { Metadata } from "next";

import { PublicBioPage } from "@/components/public/public-bio-page";

export const metadata: Metadata = {
  title: "Perfil público",
  description: "Página pública de apresentação profissional.",
};

export default function PublicBioRoute() {
  return <PublicBioPage />;
}
