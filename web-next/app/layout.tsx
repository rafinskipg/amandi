import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Chatbot from "@/components/Chatbot";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: "Avocados Amandi - Desde la tierra buena, para la vida buena",
  description: "Aguacates ecológicos cultivados en Asturias, sin cámaras, sin prisas. Cosechamos solo cuando el árbol decide.",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <CartProvider>
          {children}
          <Chatbot variant="bubble" />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
