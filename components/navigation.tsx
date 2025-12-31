"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Car, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/inventory", label: "Inventory" },
    { href: "/parts", label: "Shop Parts" },
    { href: "/bookings", label: "Book Service" },
    { href: "/about", label: "About" },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 shadow-sm supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="bg-primary p-2.5 rounded-xl group-hover:bg-primary/90 transition-colors">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-secondary">Woody Motors</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-muted hover:text-primary",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* CTA Button (Desktop) */}
          <div className="hidden md:flex items-center">
            <Button asChild className="rounded-xl font-bold h-12 px-6">
              <Link href="/bookings">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-xl hover:bg-muted text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-between group",
                      isActive
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted hover:text-primary",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                    {isActive && <Car className="w-4 h-4 fill-current animate-pulse" />}
                  </Link>
                )
              })}
              <Button asChild className="rounded-xl font-bold mt-2 h-12" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/bookings">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
