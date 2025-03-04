"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Vote, AlertTriangle, MessageSquare, Users, Settings, Briefcase, Bot, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth"

const commonItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Incidents", href: "/incidents", icon: AlertTriangle },
    { name: "Opinion Polls", href: "/polls", icon: Vote },
    { name: "AI Explainer", href: "/ai-explainer", icon: Bot },
    { name: "Bills Chat", href: "/bills-chat", icon: MessageSquare },
    { name: "Projects Chat", href: "/projects-chat", icon: Briefcase },
    { name: "Settings", href: "/settings", icon: Settings },
]

type UserRole = 'admin' | 'leader';

const roleSpecificItems: Record<UserRole, { name: string; href: string; icon: React.ComponentType }[]> = {
    admin: [
        { name: "Admin Dashboard", href: "/admin", icon: Shield }
    ],
    leader: [
        { name: "Leader Dashboard", href: "/leader-dashboard", icon: Users }
    ]
}

const Sidebar = () => {
    const pathname = usePathname()
    const { user } = useAuth()

    if (!user) return null;
    const userRoleItems = user.role && roleSpecificItems[user.role as UserRole] || [];

    const sidebarItems = [...commonItems, ...userRoleItems];

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