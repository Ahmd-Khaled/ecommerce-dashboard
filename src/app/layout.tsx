import type { Metadata } from "next";
import "./globals.css";
import { Alexandria } from "next/font/google";

export const metadata: Metadata = {
  title: {
    default: "E-commerce Admin",
    template: "%s | E-commerce Admin",
  },
  description: "E-commerce administration dashboard",
};

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-alexandria",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={alexandria.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
