"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Vote, AlertTriangle, MessageSquare, Users, Settings, Briefcase, Bot } from "lucide-react"
import { useAuth } from "@/lib/auth"

const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Incidents", href: "/incidents", icon: AlertTriangle },
    { name: "Opinion Polls", href: "/polls", icon: Vote },
    { name: "AI Explainer", href: "/ai-explainer", icon: Bot },
    { name: "Bills Chat", href: "/bills-chat", icon: MessageSquare },
    { name: "Projects Chat", href: "/projects-chat", icon: Briefcase },
    { name: "Leader Dashboard", href: "/leader-dashboard", icon: Users },
    { name: "Community", href: "/community", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
]

const Sidebar = () => {
    const pathname = usePathname()
    const { user } = useAuth() // Get authentication status

    // Don't render sidebar if the user isn't logged in
    if (!user) return null;

    return (
        <aside className="w-64 bg-background border-r h-screen">
            <nav className="p-4 space-y-2">
                {sidebarItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-accent ${pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}

export default Sidebar