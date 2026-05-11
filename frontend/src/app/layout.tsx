import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Controle de Enxoval",
  description: "Sistema responsivo para controle de enxoval de bebe.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#718766",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
