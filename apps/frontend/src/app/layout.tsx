import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandMenu } from "@/components/app/command-menu";
import { AuthProvider } from "@/components/app/auth-context";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SLH",
  description: "Experience-first project analysis and job readiness insights.",
};

const themeInitScript = `(function(){try{var key='${THEME_STORAGE_KEY}';var saved=localStorage.getItem(key);var theme=(saved==='light'||saved==='dark')?saved:'dark';var root=document.documentElement;root.classList.toggle('dark',theme==='dark');root.style.colorScheme=theme;}catch(_){var root=document.documentElement;root.classList.add('dark');root.style.colorScheme='dark';}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full bg-background font-sans text-sm leading-relaxed text-foreground">
        <AuthProvider>
          <TooltipProvider>
            {children}
            <CommandMenu />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
