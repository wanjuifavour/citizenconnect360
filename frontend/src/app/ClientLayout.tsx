"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Sidebar from "@/components/layout/Sidebar"
import { usePathname, useSearchParams } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/lib/auth"
import { createContext, useContext, useState, useEffect } from "react"
import Loading from "@/components/Loading"

const inter = Inter({ subsets: ["latin"] })

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading state on route change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex flex-1">
                {user && <Sidebar />}
                <main className="flex-1 min-h-screen bg-background text-foreground relative">
                  {/* Global loading overlay that only affects the content area */}
                  {isLoading && (
                    <Loading contentArea={true} transparent={true} />
                  )}
                  {children}
                </main>
              </div>
              {/* <Footer /> */}
              <Toaster />
            </div>
          </LoadingContext.Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}