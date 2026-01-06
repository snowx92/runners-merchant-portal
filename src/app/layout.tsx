import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Runners Merchant Portal",
  description: "Premium portal for merchants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/navLogo.png" type="image/png" />
      </head>
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
