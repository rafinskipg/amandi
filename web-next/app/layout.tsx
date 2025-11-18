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
  title: "Buy Organic Avocados Online | Direct Shipping from Spain | Avocados Amandi",
  description: "Buy premium organic avocados grown in Asturias, Spain. Direct shipping across Europe. No cold storage, tree-ripened Hass and Lamb Hass avocados. Certified organic. From €18.",
  keywords: "buy organic avocados online, organic avocados Spain, premium avocados, tree-ripened avocados, Hass avocados online, certified organic avocados, buy avocados Europe",
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
