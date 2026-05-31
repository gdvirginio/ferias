import type { Metadata } from "next";
import { Nunito, Roboto_Mono } from "next/font/google";
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
  themeColor: "#7a27c7",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Planos para as férias",
  },
};

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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
      try {
        const savedTheme = localStorage.getItem('theme');
        console.log("Tema encontrado no localStorage:", savedTheme);
        if (savedTheme) {
          document.documentElement.classList.add(savedTheme);
        }
      } catch (e) {
        console.error("Erro ao aplicar tema:", e);
      }
    `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
