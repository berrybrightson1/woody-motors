"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, CheckCircle2, Car, Calendar, Clock, Phone, User, Settings2, ArrowLeft } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import type { Vehicle } from "@/lib/types"

export default function BookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialVehicleId = searchParams.get("vehicleId") || ""
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId)
  const [isCustomVehicle, setIsCustomVehicle] = useState(false)
  const [customVehicleName, setCustomVehicleName] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
  })

  // Demo vehicles removed for production

  useEffect(() => {
    async function fetchVehicles() {
      if (!supabase) {
        setVehicles([])
        return
      }
      const { data, error } = await supabase.from("vehicles").select("id, make, model, year").eq("status", "available")

      if (error || !data || data.length === 0) {
        setVehicles([])
      } else {
        setVehicles(data as any)
      }
    }
    fetchVehicles()
  }, [])

  const handleVehicleChange = (value: string) => {
    if (value === "custom_entry") {
      setIsCustomVehicle(true)
      setSelectedVehicleId("")
    } else {
      setIsCustomVehicle(false)
      setSelectedVehicleId(value)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalVehicleName = isCustomVehicle
      ? customVehicleName
      : vehicles.find((v) => v.id === selectedVehicleId)
        ? `${vehicles.find((v) => v.id === selectedVehicleId)?.year} ${vehicles.find((v) => v.id === selectedVehicleId)?.make} ${vehicles.find((v) => v.id === selectedVehicleId)?.model}`
        : "Unspecified Vehicle"

    if (isCustomVehicle && !customVehicleName) {
      toast.error("Please enter your vehicle name")
      return
    }

    // Fallback if supabase is not available or fails
    let success = false

    if (supabase) {
      try {
        const { error } = await supabase.from("service_bookings").insert({
          customer_name: formData.name,
          customer_phone: formData.phone,
          booking_date: formData.date,
          booking_time: formData.time,
          vehicle_details: finalVehicleName,
          service_type: "Test Drive",
          status: "pending",
        })
        if (!error) success = true
      } catch (err) {
        console.error("Booking submission error:", err)
      }
    }

    // Always proceed to WhatsApp if Supabase fails or is missing (Demo Mode)
    const message = `Jambo! Test Drive Request:%0A- Name: ${formData.name}%0A- Phone: ${formData.phone}%0A- Vehicle: ${finalVehicleName}%0A- Date: ${formData.date} ${formData.time}`

    // Slight delay to allow toast or state update
    setTimeout(() => {
      window.open(`https://wa.me/233551171353?text=${message}`, "_blank")
      setSubmitted(true)
    }, 500)
  }

  if (submitted) {
    return (
      <div className="container mx-auto py-12 md:py-20 px-4 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-secondary mb-4 uppercase tracking-tighter">Ignition Ready</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your test drive request is locked in. Our team will contact you shortly to confirm the session.
        </p>
        <Button asChild className="mt-10 rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-xs">
          <a href="/inventory">Back to Showroom</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 shadow-2xl rounded-3xl md:rounded-[3rem] overflow-hidden bg-white ring-1 ring-black/5">
        <div className="md:col-span-2 bg-[#0a0a0a] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">Drive Your Dream</h1>
            <p className="text-base md:text-lg text-white/60 font-medium leading-relaxed">
              Book a session to feel the power, comfort, and precision. No obligations, just pure performance.
            </p>
          </div>
          <div className="space-y-6 mt-10 md:mt-0 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="block font-bold text-sm uppercase tracking-widest">VIP Concierge</span>
                <span className="text-xs text-white/40">Personalized attention</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5">
                <MapPin className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <span className="block font-bold text-sm uppercase tracking-widest">We Come To You</span>
                <span className="text-xs text-white/40">Home/Office delivery</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="md:col-span-3 border-none shadow-none rounded-none p-6 md:p-10 bg-white">
          <CardHeader className="p-0 pb-8">
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="-ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-primary" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <Input
                      placeholder="John Doe"
                      required
                      className="pl-12 rounded-xl h-14 bg-muted/30 border-transparent focus:border-primary focus:bg-white transition-all font-medium"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <Input
                      placeholder="+233 XX XXX XXX"
                      required
                      type="tel"
                      className="pl-12 rounded-xl h-14 bg-muted/30 border-transparent focus:border-primary focus:bg-white transition-all font-medium"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Vehicle</Label>
                <div className="relative">
                  <Select
                    value={isCustomVehicle ? "custom_entry" : selectedVehicleId}
                    onValueChange={handleVehicleChange}
                    required={!isCustomVehicle}
                  >
                    <SelectTrigger className="pl-4 rounded-xl h-14 bg-muted/30 border-transparent focus:border-primary focus:bg-white transition-all font-medium">
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-muted-foreground/50" />
                        <SelectValue placeholder="Select a vehicle..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {vehicles.length > 0 ? (
                        vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id} className="font-medium">
                            {v.year} {v.make} {v.model}
                          </SelectItem>
                        ))
                      ) : null}
                      <SelectItem value="custom_entry" className="font-bold text-primary">
                        ✨ I want to type my own car
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isCustomVehicle && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-primary ml-1">Your Custom Vehicle Request</Label>
                  <Input
                    placeholder="e.g. 2024 Toyota Land Cruiser LC300"
                    required
                    value={customVehicleName}
                    onChange={(e) => setCustomVehicleName(e.target.value)}
                    className="rounded-xl h-14 bg-primary/5 border-primary/20 focus:border-primary focus:bg-white transition-all font-bold text-lg"
                    autoFocus
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Preferred Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <Input
                      type="date"
                      required
                      className="pl-12 rounded-xl h-14 bg-muted/30 border-transparent focus:border-primary focus:bg-white transition-all font-medium"
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Preferred Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <Input
                      type="time"
                      required
                      className="pl-12 rounded-xl h-14 bg-muted/30 border-transparent focus:border-primary focus:bg-white transition-all font-medium"
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest mt-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-primary/20">
                Confirm Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
