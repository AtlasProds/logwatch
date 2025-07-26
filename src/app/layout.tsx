import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LogWatch - PM2 Logs Visualizer",
  description: "An open-source React-based web application for real-time visualization and management of PM2 application logs.",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "LogWatch - PM2 Logs Visualizer",
    description: "Real-time visualization and management of PM2 application logs on Unix machines.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
