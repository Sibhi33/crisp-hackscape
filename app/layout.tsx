import type { Metadata } from "next";

import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weights: ["400", "700"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weights: ["400", "700"],
});


export const metadata: Metadata = {
  title: "Crisp",
  description: "Your complete hackathon companion", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
    <html lang="en">
      <body
        className={spaceGrotesk.className}
      >
        {children}
      </body>
    </html>
    </AuthProvider>
  );
}
