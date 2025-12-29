"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getStoredVehicles, type Vehicle } from "@/lib/local-storage"
import { InventoryCard } from "@/components/inventory-card"
import { DEMO_VEHICLES } from "@/lib/demo-data"

type Currency = "USD" | "GHS"

const CURRENCY_SYMBOLS = {
  USD: "$",
  GHS: "₵",
}

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

      // Use demo vehicles + stored if Supabase is not configured or empty
      if (!supabase) {
        let allVehicles = [...stored]
        if (allVehicles.length === 0) {
          allVehicles = [...DEMO_VEHICLES]
        }

        if (conditionFilter !== "all") {
          allVehicles = allVehicles.filter(v => v.condition === conditionFilter)
        }
        setVehicles(allVehicles)
        return
      }

      let query = supabase.from("vehicles").select("*")
      if (conditionFilter !== "all") query = query.eq("condition", conditionFilter)
      const { data } = await query

      // Use stored/demo vehicles if no data from database
      if (!data || data.length === 0) {
        let allVehicles = [...stored]
        if (allVehicles.length === 0) {
          allVehicles = [...DEMO_VEHICLES]
        }

        if (conditionFilter !== "all") {
          allVehicles = allVehicles.filter(v => v.condition === conditionFilter)
        }
        setVehicles(allVehicles)
      } else {
        setVehicles(data)
      }
    }
    fetchVehicles()
  }, [conditionFilter])

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
            <InventoryCard
              key={vehicle.id}
              vehicle={vehicle}
              currency={currency}
              exchangeRate={exchangeRate}
            />
          ))}
        </div>
      </div>
    </div >
  )
}
