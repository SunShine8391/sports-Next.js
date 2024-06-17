import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Gothic_A1, Poppins } from "next/font/google";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/layout/footer";
import Providers from "./providers";
import Navbar from "@/components/layout/navbar";
import localFont from '@next/font/local'

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const gothic = Gothic_A1({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-gothic",
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

const gothicAtfRound = localFont({
  src: "../public/fonts/headline-gothic-atf-round.otf",
  variable: "--font-gothic-round"
});

const gothicAtfRegular = localFont({
  src: "../public/fonts/headline-gothic-atf.otf",
  variable: "--font-gothic-regular"
})

export const metadata: Metadata = {
  title: "Sports Stakes",
  description: "A weekly football prediction competition!",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${gothic.variable} ${gothicAtfRegular.variable} ${gothicAtfRound.variable} bg-primary text-primary-foreground scroll-smooth`}
      >
        <Providers>
          <main className="min-h-screen flex flex-col justify-between font-sans">
            <div>
              <Navbar />
              {children}
            </div>

            <Footer />
          </main>
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
      </body>
    </html>
  );
}
