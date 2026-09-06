import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorTV — Turn Internet Broadcasters into Television",
  description: "Pair your TV and experience YouTube creators as traditional broadcast stations.",
  icons: {
    icon: "/icons/creatortv-512.svg",
    apple: "/icons/creatortv-512.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#080808] text-white antialiased">
      <body className="min-h-screen flex flex-col justify-between selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
