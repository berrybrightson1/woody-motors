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
import { CalendarIcon, Clock, Mic, MicOff, ArrowLeft } from "lucide-react"
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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image Placeholder */}
      <div className="hidden lg:block w-1/2 relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center space-y-6 max-w-lg">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
              World Class <br /> <span className="text-[#F58220]">Service Center</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Experience premium maintenance for your premium vehicle. certified technicians, genuine parts, and white-glove service.
            </p>
          </div>
        </div>
        {/* Placeholder for actual image: <img src="/garage.jpg" className="absolute inset-0 w-full h-full object-cover -z-10" /> */}
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 h-screen overflow-y-auto bg-[#fafafa]">
        <div className="max-w-2xl mx-auto py-12 px-6 lg:px-12">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="hover:bg-transparent text-muted-foreground pl-0 -ml-3 mb-6 h-auto py-2 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-4xl font-black text-secondary mb-2 uppercase tracking-tight">Schedule Service</h1>
            <p className="text-secondary/60 text-lg">Book your premium maintenance or test drive session.</p>
          </div>

          <Card className="border-none shadow-none bg-transparent p-0">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields remain same, just removing extra padding wrappers since parent handles it */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-xl h-14 bg-white border-zinc-200 focus:ring-[#F58220]"
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
                      className="rounded-xl h-14 bg-white"
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
                      className="rounded-xl h-14 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle">Select Vehicle</Label>
                  <Select name="vehicle" required value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger className="rounded-xl h-14 bg-white border-zinc-200">
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
                    <SelectTrigger className="rounded-xl h-14 bg-white border-zinc-200">
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
                      <Input id="date" name="date" type="date" required className="rounded-xl h-14 pl-10 bg-white" />
                      <CalendarIcon className="absolute left-3 top-4 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time</Label>
                    <div className="relative">
                      <Input id="time" name="time" type="time" required className="rounded-xl h-14 pl-10 bg-white" />
                      <Clock className="absolute left-3 top-4 h-5 w-5 text-muted-foreground" />
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
                      className={`gap-2 rounded-full px-4 h-8 transition-all ${isRecording ? "text-white bg-red-500 animate-pulse shadow-lg shadow-red-500/30" : "text-muted-foreground hover:bg-[#F58220]/10 hover:text-[#F58220]"}`}
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
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-white hover:bg-[#F58220] hover:text-white text-secondary/60 rounded-lg transition-all border border-border/50 shadow-sm"
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
                    className="rounded-xl min-h-[120px] bg-white border-zinc-200 focus:border-[#F58220] resize-none p-4"
                  />

                  {isRecording && (
                    <p className="text-xs text-[#F58220] font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      Listening...
                    </p>
                  )}
                </div>

                {error && <p className="text-sm text-destructive font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                <Button type="submit" className="w-full h-14 rounded-xl text-lg font-black uppercase tracking-wide mt-8 bg-[#F58220] hover:bg-[#d97018] text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={loading}>
                  {loading ? "Confirming Booking..." : "Request Appointment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
