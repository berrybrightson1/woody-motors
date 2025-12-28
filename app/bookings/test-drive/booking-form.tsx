"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, CheckCircle2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { getStoredVehicles, type Vehicle } from "@/lib/local-storage"

export default function BookingForm() {
  const searchParams = useSearchParams()
  const initialVehicleId = searchParams.get("vehicleId") || ""
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
  })

  // Demo vehicles for fallback
  const demoVehicles: Vehicle[] = []

  useEffect(() => {
    async function fetchVehicles() {
      const stored = getStoredVehicles()

      if (!supabase) {
        setVehicles([...stored, ...demoVehicles])
        return
      }
      const { data, error } = await supabase.from("vehicles").select("id, make, model, year").eq("status", "available")

      if (error || !data || data.length === 0) {
        // Fallback to demo data if connection fails or no vehicles are found
        setVehicles([...stored, ...demoVehicles])
      } else {
        setVehicles(data as any)
      }
    }
    fetchVehicles()
  }, [])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    // Fallback if supabase is not available or fails
    let success = false

    if (supabase) {
      try {
        const { error } = await supabase.from("service_bookings").insert({
          customer_name: formData.name,
          customer_phone: formData.phone,
          booking_date: formData.date,
          booking_time: formData.time,
          vehicle_details: vehicles.find((v) => v.id === selectedVehicleId)?.make || "Test Drive Request",
          service_type: "Test Drive",
          status: "pending",
        })
        if (!error) success = true
      } catch (err) {
        console.error("Booking submission error:", err)
      }
    }

    // Always proceed to WhatsApp if Supabase fails or is missing (Demo Mode)
    // In a real app, you might want strict error handling, but for this demo context:
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId)
    const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Test Drive Request"

    const message = `Jambo! Test Drive Request:%0A- Name: ${formData.name}%0A- Phone: ${formData.phone}%0A- Vehicle: ${vehicleName}%0A- Date: ${formData.date} ${formData.time}`
    window.open(`https://wa.me/233551171353?text=${message}`, "_blank")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-5xl font-black text-secondary mb-4 uppercase tracking-tighter">Ignition Ready</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Your test drive request is locked in. Our team will contact you shortly to confirm the session.
        </p>
        <Button asChild className="mt-10 rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-xs">
          <a href="/inventory">Back to Showroom</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl grid md:grid-cols-5 gap-0 shadow-2xl rounded-[3rem] overflow-hidden bg-white">
      <div className="md:col-span-2 bg-secondary p-12 text-white flex flex-col justify-between">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6">Experience the Drive</h1>
          <p className="text-lg text-white/60 font-medium">
            Feel the power, comfort, and precision of our curated fleet. No obligations, just performance.
          </p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest">VIP Concierge</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest">Home Delivery Available</span>
          </div>
        </div>
      </div>

      <Card className="md:col-span-3 border-none shadow-none rounded-none p-4 md:p-8">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBooking} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</Label>
                <Input
                  placeholder="John Doe"
                  required
                  className="rounded-2xl h-14 bg-muted/30 border-none"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone</Label>
                <Input
                  placeholder="+234 800 000 0000"
                  required
                  className="rounded-2xl h-14 bg-muted/30 border-none"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vehicle</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId} required>
                <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none">
                  <SelectValue placeholder="Select Vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.length > 0 ? (
                    vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-xs font-bold text-center text-muted-foreground uppercase">
                      No vehicles available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  required
                  className="rounded-2xl h-14 bg-muted/30 border-none"
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time</Label>
                <Input
                  type="time"
                  required
                  className="rounded-2xl h-14 bg-muted/30 border-none"
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest mt-4">
              Confirm Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
