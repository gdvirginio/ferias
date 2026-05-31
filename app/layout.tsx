import type { Metadata, Viewport } from "next";
import { Nunito, Roboto_Mono } from "next/font/google";
import { PwaRegistry } from "@/components/PwaRegistry"; // <-- Importe o componente
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const roboto = Roboto_Mono({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Planos para as férias",
  description: "Gerencie seus planos com carinho",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Planos para as férias",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Script nativo para garantir zero "flash" branco
const themeScript = `
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.classList.add(savedTheme);
    }
  } catch (e) {
    console.error("Erro ao aplicar tema:", e);
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${nunito.variable} ${roboto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 1. Script de Tema inserido de forma bloqueante intencional, super rápido */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}

        {/* 2. Registro do PWA isolado */}
        <PwaRegistry />
      </body>
    </html>
  );
}