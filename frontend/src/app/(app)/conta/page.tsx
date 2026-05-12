import type { Metadata } from "next";
import { ContaSection } from "@/features/conta-section";

export const metadata: Metadata = {
  title: "Conta"
};

export default function ContaPage() {
  return <ContaSection />;
}
