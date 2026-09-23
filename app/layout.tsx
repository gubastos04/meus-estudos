import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { usuarioAtual } from "@/lib/auth";
import { preferencias } from "@/lib/progresso-servidor";
import { ESCALA } from "@/lib/constantes";

// "Técnico calmo": IBM Plex Mono é a voz de display (títulos, dados, rótulos) —
// assume que isto é sobre programar. IBM Plex Sans carrega texto e UI.
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Meus Estudos", template: "%s · Meus Estudos" },
  description: "Trilha de programação com foco selecionável, um bloco por vez.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#141a16" },
  ],
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
      className={`${plexMono.variable} ${plexSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
