import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Karla, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ProgressoProvider } from "@/lib/progresso";
import { Topo } from "@/components/Topo";
import { Nav } from "@/components/Nav";

const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const karla = Karla({ variable: "--font-karla", subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: { default: "Meus Estudos", template: "%s · Meus Estudos" },
  description: "Trilha de programação e segurança, um bloco por vez.",
};

export const viewport: Viewport = {
  themeColor: "#0d1320",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-tema="escuro" className={`${grotesk.variable} ${karla.variable} ${jetbrains.variable}`}>
      <body>
        <ProgressoProvider>
          <div className="wrap">
            <Topo />
            <main>{children}</main>
          </div>
          <Nav />
        </ProgressoProvider>
      </body>
    </html>
  );
}
