import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Chatbot from "@/components/Chatbot";
import CookieConsent from "@/components/CookieConsent";
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
      <head>
        {/* Google tag (gtag.js) - Load with consent mode denied by default */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17745765655"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Set consent mode to denied by default (will be updated by CookieConsent)
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'functionality_storage': 'granted',
              'personalization_storage': 'denied',
              'security_storage': 'granted',
            });
            
            gtag('config', 'AW-17745765655');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <CartProvider>
          {children}
          <Chatbot variant="bubble" />
        </CartProvider>
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
