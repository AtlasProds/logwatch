import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LogWatch - PM2 Logs Visualizer",
  description: "An open-source React-based web application for real-time visualization and management of PM2 application logs.",
  openGraph: {
    title: "LogWatch - PM2 Logs Visualizer",
    description: "Real-time visualization and management of PM2 application logs on Unix machines.",
    url: "http://localhost:3001",
    type: "website",
    images: [
      {
        url: "http://localhost:3001/og-image.jpg",
        width: 800,
        height: 600,
        alt: "LogWatch Dashboard",
      },
    ],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
