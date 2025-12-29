"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { SparePart } from "@/lib/types"

// Hardcoded WhatsApp Number for inquiries
const WHATSAPP_NUMBER = "233551171353"

export default function PartQuotePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const partId = searchParams.get("id")

    const [part, setPart] = useState<SparePart | null>(null)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        quantity: 1,
        vehicle_info: "",
        message: ""
    })

    useEffect(() => {
        if (partId) fetchPart()
    }, [partId])

    async function fetchPart() {
        setLoading(true)
        const supabase = createClient()
        if (!supabase) return

        const { data, error } = await supabase
            .from("spare_parts")
            .select("*")
            .eq("id", partId)
            .single()

        if (data) {
            // @ts-ignore
            setPart(data)
        }
        setLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const supabase = createClient()
        if (!supabase) {
            toast.error("Connection error")
            setSubmitting(false)
            return
        }

        // 1. Save to Supabase
        const inquiryData = {
            part_id: part?.id,
            part_name: part?.name || "General Quote",
            part_number: part?.part_number || "N/A",
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_email: formData.email,
            quantity: formData.quantity,
            vehicle_info: formData.vehicle_info,
            message: formData.message,
            status: "PENDING"
        }

        const { error } = await supabase
            .from("part_inquiries")
            .insert(inquiryData)

        if (error) {
            console.error(error)
            toast.error("Failed to save request, but trying WhatsApp...")
        } else {
            toast.success("Request saved! Opening WhatsApp...")
        }

        // 2. Redirect to WhatsApp
        const text = `*New Part Inquiry*\n\n*Part:* ${part?.name || "N/A"}\n*Part #:* ${part?.part_number || "N/A"}\n*Qty:* ${formData.quantity}\n\n*Customer:* ${formData.name}\n*Phone:* ${formData.phone}\n*Vehicle:* ${formData.vehicle_info || "N/A"}\n\n*Message:* ${formData.message || "I am interested in this part."}`

        const encodedText = encodeURIComponent(text)
        const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`

        setTimeout(() => {
            window.location.href = waLink
        }, 1500)
    }

    if (loading) return <div className="min-h-screen bg-[#0A0A0A] pt-32 text-center text-white/50">Loading details...</div>

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-20">
            <div className="max-w-xl mx-auto px-4">
                <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-lg mb-6">
                    <Link href={partId ? `/parts/${partId}` : "/parts"}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>

                <Card className="bg-[#141414] border-white/5">
                    <CardContent className="p-8 space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Request Quote</h1>
                            <p className="text-white/50">
                                {part ? `Submit an inquiry for ${part.name}` : "Tell us what part you need"}
                            </p>
                        </div>

                        {part && (
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                    {part.images?.[0] && (
                                        <img src={part.images[0]} alt={part.name} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm line-clamp-1">{part.name}</h3>
                                    <p className="text-xs text-white/40 font-mono">{part.part_number}</p>
                                    <p className="text-primary font-bold text-sm mt-1">{part.currency} {part.price.toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-white">Full Name *</Label>
                                    <Input
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="bg-white/5 border-white/10 text-white"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white">Phone Number *</Label>
                                        <Input
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 text-white"
                                            placeholder="055..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white">Email (Optional)</Label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 text-white"
                                            placeholder="you@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white">Quantity</Label>
                                        <Input
                                            name="quantity"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white">Your Vehicle Info</Label>
                                        <Input
                                            name="vehicle_info"
                                            value={formData.vehicle_info}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 text-white"
                                            placeholder="e.g. 2018 Toyota Camry"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Additional Details</Label>
                                    <Textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="bg-white/5 border-white/10 text-white min-h-[100px]"
                                        placeholder="Any specific requirements or questions?"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-14 text-lg font-bold bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-xl gap-2"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Request via WhatsApp
                                    </>
                                )}
                            </Button>
                            <p className="text-center text-xs text-white/30">
                                You will be redirected to WhatsApp to complete your inquiry.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
