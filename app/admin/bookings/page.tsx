"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Car, MessageSquare, Phone, Mail, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type Booking = {
    id: string
    customer_name: string
    customer_email: string
    customer_phone: string
    vehicle_details: string
    service_type: string
    booking_date: string
    booking_time: string
    notes: string
    status: "pending" | "confirmed" | "completed" | "cancelled"
    created_at: string
}

// Demo data removed for production

const SERVICE_LABELS: Record<string, string> = {
    oil_change: "Premium Oil Service",
    inspection: "Comprehensive Inspection",
    test_drive: "Test Drive Session",
    repair: "Major Repair",
    brake_service: "Brake Service",
    transmission: "Transmission Service",
    ac_climate: "AC / Climate Control",
    electrical: "Electrical Diagnostics",
    bodywork: "Body Work & Paint",
    alignment: "Wheel Alignment",
    tire_service: "Tire Service",
    detailing: "Full Detailing",
    PURCHASE_INQUIRY: "Vehicle Purchase Inquiry",
}

const STATUS_CONFIG = {
    pending: { color: "bg-yellow-500", icon: AlertCircle, label: "Pending" },
    confirmed: { color: "bg-blue-500", icon: CheckCircle, label: "Confirmed" },
    completed: { color: "bg-green-500", icon: CheckCircle, label: "Completed" },
    cancelled: { color: "bg-red-500", icon: XCircle, label: "Cancelled" },
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed">("all")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        async function fetchBookings() {
            let query = supabase.from("service_bookings").select("*").order("created_at", { ascending: false })

            if (filter !== "all") {
                query = query.eq("status", filter)
            }

            const { data, error } = await query

            if (error) {
                console.error("Error fetching bookings:", error)
                toast.error("Failed to load bookings")
            }

            setBookings(data || [])
            setLoading(false)
        }

        fetchBookings()

        // Realtime Subscription
        if (supabase) {
            const channel = supabase
                .channel('admin-bookings-changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'service_bookings' },
                    () => {
                        fetchBookings() // Refresh list on any change
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [filter])

    const filteredBookings = filter === "all"
        ? bookings
        : bookings.filter(b => b.status === filter)

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-lg">
                        <Link href="/admin">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Service Bookings</h1>
                        <p className="text-sm text-white/50">Manage customer appointments</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                            if (!confirm("⚠️ DELETE ALL BOOKINGS?\n\nThis action cannot be undone!")) return

                            const supabase = createClient()
                            if (!supabase) {
                                alert("Database connection not available")
                                return
                            }

                            try {
                                const { error } = await supabase
                                    .from("service_bookings")
                                    .delete()
                                    .gte('created_at', '2000-01-01')

                                if (error) throw error

                                toast.success("Queue Cleared!", { description: "All bookings deleted." })
                            } catch (err: any) {
                                console.error("Delete error:", err)
                                toast.error("Failed to clear queue", { description: err.message })
                            }
                        }}
                        className="rounded-md mr-2"
                    >
                        Clear Queue
                    </Button>
                    {["all", "pending", "confirmed", "completed"].map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(status as typeof filter)}
                            className={`rounded-md capitalize ${filter === status
                                ? "bg-primary text-white"
                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Bookings", value: bookings.length, color: "bg-white/10" },
                    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "bg-yellow-500/20" },
                    { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, color: "bg-blue-500/20" },
                    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, color: "bg-green-500/20" },
                ].map((stat) => (
                    <Card key={stat.label} className={`${stat.color} border-white/5 rounded-lg`}>
                        <CardContent className="p-5">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                            <p className="text-4xl font-black text-white mt-2">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-white/60">Loading bookings...</div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12 text-white/60">No bookings found</div>
                ) : (
                    filteredBookings.map((booking) => {
                        const statusConfig = STATUS_CONFIG[booking.status]
                        const StatusIcon = statusConfig.icon

                        return (
                            <Card key={booking.id} className="bg-[#1A1A1A] border-white/5 rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                                <CardContent className="p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                                        {/* Customer Info */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{booking.customer_name}</h3>
                                                    <Badge className={`${statusConfig.color} text-white border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest mt-1`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center gap-2 text-white/60">
                                                    <Mail className="w-4 h-4" />
                                                    <span>{booking.customer_email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/60">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{booking.customer_phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/60">
                                                    <Car className="w-4 h-4" />
                                                    <span>{booking.vehicle_details}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary font-bold">
                                                    <span>{SERVICE_LABELS[booking.service_type] || booking.service_type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date & Time */}
                                        <div className="flex lg:flex-col items-center gap-3 lg:gap-2 bg-white/5 rounded-lg p-3 lg:min-w-[130px]">
                                            <div className="flex items-center gap-2 text-white">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span className="font-bold text-sm">{formatDate(booking.booking_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/60">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-bold text-sm">{booking.booking_time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes / Described Problem */}
                                    {booking.notes && (
                                        <div className="mt-6 pt-6 border-t border-white/10">
                                            <div className="flex items-start gap-3">
                                                <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Described Problem</p>
                                                    <p className="text-white/80 leading-relaxed">{booking.notes}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div >
    )
}
