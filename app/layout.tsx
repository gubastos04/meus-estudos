import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { Fraunces, Karla, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { usuarioAtual } from "@/lib/auth";
import { preferencias } from "@/lib/progresso-servidor";
import { ESCALA } from "@/lib/constantes";

// Fraunces: serif de display, dá a personalidade de caderno. Karla: texto e UI.
// JetBrains Mono: números e código, a "voz de livro-caixa".
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });
const karla = Karla({ variable: "--font-karla", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Meus Estudos", template: "%s · Meus Estudos" },
  description: "Trilha de programação e segurança, um bloco por vez.",
};

export const viewport: Viewport = {
  themeColor: "#17150f",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  // Tema e fonte no <html> vêm das preferências de quem está logado (ou o padrão).
  const u = await usuarioAtual();
  const prefs = u ? await preferencias(u.id) : { tema: "escuro" as const, fonte: 1 as const };

  return (
    <html
      lang="pt-BR"
      data-tema={prefs.tema}
      style={{ "--esc": ESCALA[prefs.fonte] } as React.CSSProperties}
      className={`${fraunces.variable} ${karla.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
