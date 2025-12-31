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
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Clock, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function BuyNowPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BuyNowForm />
        </Suspense>
    )
}

function BuyNowForm() {
    const [loading, setLoading] = useState(false)
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
            // Mock data removed for production

            const supabaseClient = createClient()
            if (supabaseClient) {
                const { data } = await supabaseClient.from("vehicles").select("id, make, model, year")
                if (data && data.length > 0) {
                    setVehicles(data)
                }
            }
        }
        fetchVehicles()
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        // HYBRID FLOW: Database Save (Best Effort) -> WhatsApp Redirect
        const whatsappNumber = "+233551171353"

        // Construct message with newlines (\n) and formatting
        const rawMessage = `*New Purchase Inquiry* 🚗\n\n*Vehicle:* ${formData.get("vehicle")}\n*Customer:* ${name}\n*Email:* ${email}\n*Phone:* ${phone}\n*Payment:* ${formData.get("payment_method")}\n\n*Message:* ${notes}`

        // Encode properly for URL
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(rawMessage)}`

        try {
            if (supabase) {
                const { error: insertError } = await supabase.from("service_bookings").insert({
                    customer_name: name,
                    customer_email: email,
                    customer_phone: phone,
                    vehicle_details: formData.get("vehicle") as string,
                    service_type: "PURCHASE_INQUIRY",
                    booking_date: formData.get("date") as string || new Date().toISOString().split('T')[0], // Fallback to today if missing
                    booking_time: formData.get("time") as string || "09:00", // Fallback Default
                    notes: `Payment Method: ${formData.get("payment_method")}\n\nNotes: ${notes}`,
                })

                if (insertError) {
                    console.error("Background DB save failed (proceeding to WhatsApp):", insertError)
                }
            } else {
                console.warn("Supabase client not initialized - skipping DB save")
            }
        } catch (err) {
            console.error("Unexpected DB error:", err)
        }

        // Always succeed to user
        toast.success("Inquiry Prepared!", {
            description: "Opening WhatsApp to send your request...",
            duration: 2000
        })

        // Redirect
        setTimeout(() => {
            window.location.href = whatsappUrl
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[#fafafa] pt-20 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-white p-8 border-b border-gray-100 flex flex-col items-start text-left">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="hover:bg-black/5 text-muted-foreground pl-0 -ml-3 mb-6 h-auto py-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <h1 className="text-4xl font-bold text-secondary mb-2">Secure Your Vehicle</h1>
                        <p className="text-secondary/60 text-lg">Start your purchase or book a private viewing.</p>
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
                                <Label htmlFor="vehicle">Interested Vehicle</Label>
                                {vehicleParam ? (
                                    <div className="relative">
                                        <Input
                                            value={vehicleParam}
                                            readOnly
                                            className="rounded-xl h-12 bg-gray-50 font-bold text-gray-700 border-gray-200"
                                        />
                                        <input type="hidden" name="vehicle" value={vehicleParam} />
                                        <p className="text-xs text-muted-foreground mt-1 ml-1">
                                            * Vehicle automatically selected from your browsing session
                                        </p>
                                    </div>
                                ) : (
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
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Preferred Payment Method</Label>
                                <Select name="payment_method" required>
                                    <SelectTrigger className="rounded-xl h-12">
                                        <SelectValue placeholder="Select payment option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash / Bank Transfer</SelectItem>
                                        <SelectItem value="financing">Financing / Installment</SelectItem>
                                        <SelectItem value="crypto">Cryptocurrency (BTC/USDT)</SelectItem>
                                        <SelectItem value="trade_in">Trade-In + Cash</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="notes">Additional Messages or Offers</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="I am interested in this car. Is the price negotiable? ..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="rounded-xl min-h-[100px]"
                                />
                            </div>

                            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

                            <Button type="submit" className="w-full h-14 rounded-xl text-xl font-bold mt-4 bg-[#F58220] hover:bg-[#D96B10] text-white" disabled={loading}>
                                {loading ? "Processing..." : "Submit Purchase Inquiry"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
