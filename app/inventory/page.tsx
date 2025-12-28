"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gauge, Settings2, Fuel, BadgeCheck, Shield, ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getStoredVehicles } from "@/lib/local-storage"

type Vehicle = {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  fuel_type: string
  condition: "foreign_used" | "brand_new" | "pre_owned"
  is_duty_paid: boolean
  vin_verified: boolean
  images: string[]
}

type Currency = "USD" | "GHS"

const CURRENCY_SYMBOLS = {
  USD: "$",
  GHS: "₵",
}

// Demo vehicles shown when database is not configured
// Demo vehicles shown when database is not configured
const demoVehicles: Vehicle[] = []

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [currency, setCurrency] = useState<Currency>("USD")
  const [exchangeRate, setExchangeRate] = useState(15.0) // Default GHS rate
  const [conditionFilter, setConditionFilter] = useState<"all" | "foreign_used" | "brand_new">("all")

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient()
      if (!supabase) return // Gracefully handle missing Supabase
      const { data } = await supabase.from("site_settings").select("*").eq("key", "exchange_rates").single()
      if (data?.value?.GHS) setExchangeRate(data.value.GHS)
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    async function fetchVehicles() {
      const supabase = createClient()
      const stored = getStoredVehicles()

      // Use demo vehicles if Supabase is not configured
      if (!supabase) {
        let filtered = [...stored, ...demoVehicles]
        if (conditionFilter !== "all") {
          filtered = filtered.filter(v => v.condition === conditionFilter)
        }
        setVehicles(filtered)
        return
      }

      let query = supabase.from("vehicles").select("*")
      if (conditionFilter !== "all") query = query.eq("condition", conditionFilter)
      const { data } = await query

      // Use stored/demo vehicles if no data from database
      if (!data || data.length === 0) {
        let filtered = [...stored, ...demoVehicles]
        if (conditionFilter !== "all") {
          filtered = filtered.filter(v => v.condition === conditionFilter)
        }
        setVehicles(filtered)
      } else {
        setVehicles(data)
      }
    }
    fetchVehicles()
  }, [conditionFilter])

  const formatPrice = (priceInUSD: number) => {
    const rate = currency === "USD" ? 1 : exchangeRate
    const converted = priceInUSD * rate
    const symbol = currency === "USD" ? "$" : "₵"
    return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h1 className="text-6xl font-black tracking-tighter text-secondary mb-4 uppercase">Showroom</h1>
            <p className="text-xl text-muted-foreground font-medium">Curated high-performance machinery.</p>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-border/50">
              {(["USD", "GHS"] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-8 py-2 rounded-xl text-sm font-black transition-all ${currency === cur ? "bg-secondary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  {cur}
                </button>
              ))}
            </div>
            <Button asChild size="lg" className="rounded-2xl h-14 px-8 text-lg font-black uppercase tracking-tight">
              <Link href="/bookings/test-drive">Book Test Drive</Link>
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-2 scrollbar-hide">
          {["all", "foreign_used", "brand_new"].map((filter) => (
            <button
              key={filter}
              onClick={() => setConditionFilter(filter as any)}
              className={`px-8 py-3 rounded-2xl font-black whitespace-nowrap uppercase tracking-widest text-xs transition-all border-2 ${conditionFilter === filter
                ? "bg-primary border-primary text-white shadow-lg"
                : "bg-white border-transparent text-secondary hover:border-primary/30"
                }`}
            >
              {filter.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5 group">
              <Link href={`/inventory/${vehicle.id}`} className="block relative aspect-[4/3] overflow-hidden">
                <img
                  src={vehicle.images?.[0] || "/placeholder.svg?height=600&width=800"}
                  alt={vehicle.make}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <Badge className="bg-secondary text-white border-none rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                    {vehicle.condition === "brand_new" ? "Brand New" : "Foreign Used"}
                  </Badge>
                </div>
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                  {vehicle.is_duty_paid && (
                    <Badge className="bg-green-500/90 backdrop-blur-md text-white border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <BadgeCheck className="h-3.5 w-3.5" /> Duty Paid
                    </Badge>
                  )}
                  {vehicle.vin_verified && (
                    <Badge className="bg-blue-500/90 backdrop-blur-md text-white border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> Verified VIN
                    </Badge>
                  )}
                </div>
              </Link>

              <div className="p-8 pt-6">
                <div className="mb-8">
                  <span className="text-primary font-black text-xl mb-1 block">{vehicle.year}</span>
                  <h3 className="text-3xl font-black text-secondary leading-tight uppercase tracking-tighter hover:text-primary transition-colors">
                    <Link href={`/inventory/${vehicle.id}`}>
                      {vehicle.make} <span className="text-muted-foreground/60">{vehicle.model}</span>
                    </Link>
                  </h3>
                  <div className="mt-4 text-5xl font-black text-secondary tracking-tighter">
                    {formatPrice(vehicle.price)}
                  </div>
                </div>

                <div className="flex gap-3 mb-8">
                  {[
                    { icon: Gauge, val: `${(vehicle.mileage / 1000).toFixed(0)}K` },
                    { icon: Settings2, val: vehicle.transmission?.slice(0, 4) },
                    { icon: Fuel, val: vehicle.fuel_type },
                  ].map((panel, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#f8f9fa] rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50 group-hover:bg-primary/5 transition-colors"
                    >
                      <panel.icon className="h-5 w-5 text-secondary/40 mb-2 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary/60">
                        {panel.val}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-16 rounded-2xl border-2 border-secondary/10 hover:border-primary hover:bg-primary hover:text-white transition-all group/btn bg-transparent"
                >
                  <Link
                    href={`/inventory/${vehicle.id}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="font-black uppercase tracking-widest text-xs">View Details</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  )
}
