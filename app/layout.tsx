import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Echoes | Interactive AI Stories",
  description: "AI-generated branching narratives where every choice shapes your story. See how your decisions compare to other readers.",
  keywords: ["interactive fiction", "AI stories", "branching narrative", "choice-based games"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}