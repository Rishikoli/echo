import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

// A clean geometric sans for the whole product, headings included. next/font falls
// back to a system sans automatically if the font can't be fetched, so this is safe
// offline too.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ECHO — Dementia Digital Twin",
  description: "A local-first, explainable Digital Twin for longitudinal dementia care.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full text-foreground">
        <div className="flex flex-col md:flex-row min-h-screen">
          <Nav />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
