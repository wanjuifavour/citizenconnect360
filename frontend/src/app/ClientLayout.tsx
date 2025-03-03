"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Sidebar from "@/components/layout/Sidebar"
import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

interface ClientLayoutProps {
    children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const { user } = useAuth()

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <div className="flex flex-1">
                            {user && <Sidebar />}
                            <main className={`flex-1 min-h-screen bg-background text-foreground`}>
                                {children}
                            </main>
                        </div>
                        <Footer />
                        <Toaster />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}