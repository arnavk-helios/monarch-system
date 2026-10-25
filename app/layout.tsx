import type { Metadata } from "next";
import { Anton, Cinzel, Manrope } from "next/font/google";
import "./globals.css";

// Anton: heavy poster headlines. Cinzel: carved-stone capitals. Manrope: body text.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Monarch System",
  description: "Complete daily quests, earn XP, and level up.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${cinzel.variable} ${manrope.variable}`}>
      <body>
        <div className="pillar pillar-left" aria-hidden="true" />
        <div className="pillar pillar-right" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}