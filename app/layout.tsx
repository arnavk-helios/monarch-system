import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import TimezoneSync from "./TimezoneSync";

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: "Ascend",
  description: "Complete daily quests, earn XP, and level up.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={onest.variable}>
      <body>
        <TimezoneSync />
        {children}
      </body>
    </html>
  );
}