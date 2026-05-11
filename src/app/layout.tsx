import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import VoiceRecorder from "@/components/VoiceRecorder";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cognition | AI Notes App",
  description: "Intelligent note-taking for the modern era.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased selection:bg-blue-100 dark:selection:bg-blue-900/30`}>
        <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0F172A]">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {children}
          </div>
        </div>
        <VoiceRecorder />
      </body>
    </html>
  );
}
