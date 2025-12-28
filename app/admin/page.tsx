"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, LayoutDashboard, Car, Settings, LogOut, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getStoredVehicles } from "@/lib/local-storage"

export default function AdminDashboard() {
  const [inventoryCount, setInventoryCount] = useState(0)

  useEffect(() => {
    // Initial fetch
    setInventoryCount(getStoredVehicles().length)

    // Optional: could add an event listener for storage changes if desired,
    // but simple mount fetch covers most "real time" needs for a single user tab.
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Creator Studio</h1>
          <p className="text-white/50 mt-1">Dashboard Overview</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
          asChild
        >
          <Link href="/admin/settings">
            <Settings className="w-5 h-5" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#1A1A1A] border-white/10 rounded-xl p-5 group hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wide">Active Inventory</p>
              <p className="text-4xl font-bold text-white mt-2">{inventoryCount}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Car className="w-6 h-6 text-white/40 group-hover:text-primary" />
            </div>
          </div>
        </Card>
        <Card className="bg-primary/20 border-primary/30 rounded-xl p-5 group hover:bg-primary/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary/80 uppercase tracking-wide">New Bookings</p>
              <p className="text-4xl font-bold text-primary mt-2">0</p>
            </div>
            <div className="p-3 bg-primary/20 rounded-xl">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-white/30 uppercase tracking-wider">Quick Actions</h2>
        <div className="space-y-2">
          {[
            { label: "Manage Inventory", desc: "View, edit, and update vehicles", icon: Car, href: "/admin/inventory" },
            { label: "Service Queue", desc: "Customer bookings and problems", icon: Calendar, href: "/admin/bookings" },
            { label: "Site Settings", desc: "Exchange rates and configuration", icon: Settings, href: "/admin/settings" },
          ].map((action) => (
            <Button
              key={action.label}
              asChild
              className="w-full h-auto py-4 px-5 rounded-xl bg-[#141414] text-white hover:bg-[#1A1A1A] border border-white/5 hover:border-white/10 transition-all justify-between group"
            >
              <Link href={action.href}>
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <action.icon className="w-5 h-5 text-white/50 group-hover:text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold block">{action.label}</span>
                    <span className="text-xs text-white/40">{action.desc}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Post New Vehicle CTA */}
      <div className="pt-4">
        <Button
          asChild
          className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base gap-3 shadow-lg shadow-primary/20"
        >
          <Link href="/admin/inventory/new">
            <Plus className="w-5 h-5" />
            Post New Vehicle
          </Link>
        </Button>
      </div>

      {/* Footer Nav */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary bg-primary/10 text-sm font-bold"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Exit Studio
          </Link>
        </div>
        <p className="text-xs text-white/30">© 2025 Woody Motors</p>
      </div>
    </div>
  )
}
