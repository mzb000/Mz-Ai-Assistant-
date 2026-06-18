import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/components/layout/provider";

export const metadata: Metadata = {
  title: "Zabi AI Assistant",
  description: "Your intelligent AI companion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
