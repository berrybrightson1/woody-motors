"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Save, ArrowLeft, RefreshCw, DollarSign } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [rates, setRates] = useState({ GHS: 15.0 })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient()

      if (!supabase) {
        setLoading(false)
        return
      }

      const { data } = await supabase.from("site_settings").select("*").eq("key", "exchange_rates").single()
      if (data) setRates(data.value)
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    const supabase = createClient()

    if (!supabase) {
      toast.error("CONFIGURATION MISSING", {
        description: "This feature requires Supabase credentials.",
        className: "bg-red-500 border-none text-white font-bold"
      })
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "exchange_rates", value: rates }, { onConflict: "key" })

    if (error) {
      toast.error("SAVE FAILED", {
        description: error.message,
        className: "bg-red-500 border-none text-white font-bold"
      })
    } else {
      toast.success("RATES UPDATED", {
        description: "Currency exchange rates have been saved successfully.",
        className: "bg-[#00ff9d] border-none text-black font-black tracking-widest uppercase"
      })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-lg">
          <Link href="/admin">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <p className="text-sm text-white/50">Configure exchange rates and preferences</p>
        </div>
      </div>

      {/* Currency Card */}
      <Card className="bg-[#141414] border-white/10 rounded-xl">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-2 bg-primary/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-white">Currency Exchange</h2>
              <p className="text-xs text-white/40">Set the USD to GHS conversion rate</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-white/60">Base Currency</span>
              <span className="text-sm font-bold text-white">USD ($)</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wide">
                1 USD = GHS Rate
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white/30">₵</span>
                <Input
                  type="number"
                  step="0.01"
                  value={rates.GHS}
                  onChange={(e) => setRates({ GHS: Number.parseFloat(e.target.value) })}
                  className="flex-1 h-11 rounded-lg border-white/10 bg-[#0A0A0A] text-lg font-bold text-white focus-visible:ring-primary/30"
                  placeholder="15.00"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
