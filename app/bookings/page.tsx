"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Clock, Mic, MicOff } from "lucide-react"
import { toast } from "sonner"



export default function NewBookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewBookingForm />
    </Suspense>
  )
}

function NewBookingForm() {
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleParam = searchParams.get("vehicle")
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleParam || "")
  const supabase = createClient()

  useEffect(() => {
    async function fetchVehicles() {
      // Mock data for fallback
      const mockVehicles = [
        { id: "1", make: "Mercedes-Benz", model: "S-Class", year: 2024 },
        { id: "2", make: "BMW", model: "7 Series", year: 2023 },
        { id: "3", make: "Lexus", model: "LX 600", year: 2024 },
        { id: "4", make: "Range Rover", model: "Sport", year: 2023 },
        { id: "5", make: "Toyota", model: "Land Cruiser", year: 2024 },
      ]

      const supabaseClient = createClient()
      if (supabaseClient) {
        const { data } = await supabaseClient.from("vehicles").select("id, make, model, year")
        if (data && data.length > 0) {
          setVehicles(data)
        } else {
          setVehicles(mockVehicles)
        }
      } else {
        setVehicles(mockVehicles)
      }
    }
    fetchVehicles()
  }, [])

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.warning("BROWSER UNSUPPORTED", {
        description: "Voice recognition is not supported in your browser.",
        className: "bg-yellow-500 border-none text-black font-bold"
      })
      return
    }

    if (isRecording) {
      setIsRecording(false)
      return
    }

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => setIsRecording(true)
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }

    recognition.start()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    if (!supabase) {
      setError("System configuration error: Database not connected")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("service_bookings").insert({
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      vehicle_details: formData.get("vehicle") as string,
      service_type: formData.get("service") as string,
      booking_date: formData.get("date") as string,
      booking_time: formData.get("time") as string,
      notes: notes,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push("/bookings/success")
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-white p-8 text-center border-b border-gray-100">
            <h1 className="text-4xl font-bold text-secondary mb-2">Schedule Service</h1>
            <p className="text-secondary/60 text-lg">Book your premium maintenance or test drive session</p>
          </div>

          {/* Form */}
          <CardContent className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl h-12"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="rounded-xl h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Select Vehicle</Label>
                <Select name="vehicle" required value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="rounded-xl h-12 bg-white border-border">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Other / Not Listed</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={`${v.year} ${v.make} ${v.model}`}>
                        {v.year} {v.make} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service Type</Label>
                <Select name="service" required>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oil_change">Premium Oil Service</SelectItem>
                    <SelectItem value="inspection">Comprehensive Inspection</SelectItem>
                    <SelectItem value="test_drive">Test Drive Session</SelectItem>
                    <SelectItem value="repair">Major Repair</SelectItem>
                    <SelectItem value="brake_service">Brake Service</SelectItem>
                    <SelectItem value="transmission">Transmission Service</SelectItem>
                    <SelectItem value="ac_climate">AC / Climate Control</SelectItem>
                    <SelectItem value="electrical">Electrical Diagnostics</SelectItem>
                    <SelectItem value="bodywork">Body Work & Paint</SelectItem>
                    <SelectItem value="alignment">Wheel Alignment</SelectItem>
                    <SelectItem value="tire_service">Tire Service</SelectItem>
                    <SelectItem value="detailing">Full Detailing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date</Label>
                  <div className="relative">
                    <Input id="date" name="date" type="date" required className="rounded-xl h-12 pl-10" />
                    <CalendarIcon className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <div className="relative">
                    <Input id="time" name="time" type="time" required className="rounded-xl h-12 pl-10" />
                    <Clock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes">Describe Your Problem</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceInput}
                    className={`gap-2 rounded-full px-4 h-8 ${isRecording ? "text-white bg-red-500 animate-pulse" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isRecording ? "Listening..." : "Use Voice"}
                    </span>
                  </Button>
                </div>

                {/* Quick Problem Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Engine making strange noise",
                    "Brakes squeaking",
                    "AC not cooling",
                    "Oil change needed",
                    "Check engine light on",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setNotes((prev) => prev ? `${prev}. ${suggestion}` : suggestion)}
                      className="px-3 py-1.5 text-xs font-medium bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-full transition-colors border border-secondary/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Click a suggestion above, use voice, or type your problem..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl min-h-[100px]"
                />

                {isRecording && (
                  <p className="text-xs text-primary animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    Speak now... Your words will appear in the box above
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-destructive font-medium">{error}</p>}

              <Button type="submit" className="w-full h-14 rounded-xl text-xl font-bold mt-4" disabled={loading}>
                {loading ? "Confirming Booking..." : "Request Appointment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
