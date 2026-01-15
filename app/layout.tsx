import type { Metadata } from "next";
import "./globals.css";
import { ArchetypeThemeProvider } from "./components/ArchetypeThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ArchetypeThemeProvider>
          {children}
        </ArchetypeThemeProvider>
      </body>
    </html>
  );
}