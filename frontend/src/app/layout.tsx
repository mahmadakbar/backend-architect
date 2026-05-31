import "@assets/styles/globals.css";
import { ThemeProvider } from "@components/molecules/ThemeProvider";
import { Provider } from "@components/molecules/Provider";
import { Toaster } from "@components/atoms/sonner";
import { cn } from "@utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "My Todo App",
  description: "A simple todo app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable, // Apply font variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
