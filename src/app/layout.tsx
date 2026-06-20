import type { Metadata } from "next";
import { JetBrains_Mono, Nunito, Inter, Archivo_Black } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: "900",
  style: ["normal", "italic"],
  variable: "--font-nunito",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});

export const metadata: Metadata = {
  title: "TYPE 001",
  description: "Interactive ASCII art experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mono.className} ${nunito.variable} ${inter.variable} ${archivoBlack.variable}`}>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}
