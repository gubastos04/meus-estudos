import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { Fraunces, Karla, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ProgressoProvider } from "@/lib/progresso";
import { carregarProgresso } from "@/lib/progresso-servidor";
import { temChaveIA } from "@/lib/ia";
import { IAProvider } from "@/components/IA";
import { ESCALA } from "@/lib/constantes";
import { Topo } from "@/components/Topo";
import { Nav } from "@/components/Nav";

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
  // O progresso é lido a cada requisição, nunca congelado no build.
  await connection();
  const progresso = await carregarProgresso();

  return (
    <html
      lang="pt-BR"
      data-tema={progresso.tema}
      style={{ "--esc": ESCALA[progresso.fonte] } as React.CSSProperties}
      className={`${fraunces.variable} ${karla.variable} ${jetbrains.variable}`}
    >
      <body>
        <ProgressoProvider inicial={progresso}>
          <IAProvider ligada={temChaveIA()}>
            <div className="wrap">
              <Topo />
              <main>{children}</main>
            </div>
            <Nav />
          </IAProvider>
        </ProgressoProvider>
      </body>
    </html>
  );
}
