"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/auth"

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

const Header = () => {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* Your logo or site name */}
            <span className="font-bold">Citizen Connect</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${pathname === "/" ? "text-foreground" : "text-foreground/60"}`}
            >
              Home
            </Link>
            <Link
              href="/incidents"
              className={`transition-colors hover:text-foreground/80 ${pathname?.startsWith("/incidents") ? "text-foreground" : "text-foreground/60"}`}
            >
              Incidents
            </Link>
            {/* Add more navigation links as needed */}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center">
            {user ? (
              <>
                <span className="mr-4">{user.name}</span>
                <ModeToggle />
                <Button onClick={logout} variant="outline" className= "bg-red-500">Logout</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="mr-2">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
                <ModeToggle />
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header