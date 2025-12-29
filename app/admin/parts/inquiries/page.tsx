"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, Clock, Trash2, Mail, Phone, MessageSquare } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { PartInquiry, PartInquiryStatus } from "@/lib/types"

export default function PartInquiriesPage() {
    const [inquiries, setInquiries] = useState<PartInquiry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchInquiries()

        const supabase = createClient()
        if (!supabase) return

        const channel = supabase
            .channel('admin-part-inquiries')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'part_inquiries' },
                () => {
                    fetchInquiries()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function fetchInquiries() {
        setLoading(true)
        const supabase = createClient()
        if (!supabase) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from("part_inquiries")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error(error)
            toast.error("Failed to load inquiries")
        } else {
            // @ts-ignore
            setInquiries(data || [])
        }
        setLoading(false)
    }

    const updateStatus = async (id: string, newStatus: PartInquiryStatus) => {
        const supabase = createClient()
        if (!supabase) return

        const { error } = await supabase
            .from("part_inquiries")
            .update({ status: newStatus })
            .eq("id", id)

        if (error) {
            toast.error("Failed to update status")
        } else {
            toast.success("Status updated")
            // Realtime will update list
        }
    }

    const deleteInquiry = async (id: string) => {
        if (!confirm("Delete this inquiry?")) return

        const supabase = createClient()
        if (!supabase) return

        const { error } = await supabase
            .from("part_inquiries")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Failed to delete")
        } else {
            toast.success("Inquiry deleted")
        }
    }

    const clearQueue = async () => {
        if (!confirm("Are you sure you want to delete ALL inquiries? This cannot be undone.")) return

        const supabase = createClient()
        if (!supabase) return

        // Using gte trick for 'delete all' safely
        const { error } = await supabase
            .from("part_inquiries")
            .delete()
            .gte("created_at", "2000-01-01")

        if (error) {
            toast.error("Failed to clear queue")
        } else {
            toast.success("Queue cleared")
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-lg">
                        <Link href="/admin">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Part Inquiries</h1>
                        <p className="text-sm text-white/50">Manage quotes and requests</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        onClick={clearQueue}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-border/5"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Queue
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-white/60">Loading inquiries...</div>
                ) : inquiries.length === 0 ? (
                    <div className="text-center py-12 text-white/60">No pending inquiries</div>
                ) : (
                    inquiries.map((inquiry) => (
                        <Card key={inquiry.id} className="bg-[#141414] border-white/5 hover:border-white/10 transition-colors">
                            <CardContent className="p-5">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-white">{inquiry.part_name}</h3>
                                            <Badge variant="secondary" className="text-xs">{inquiry.status}</Badge>
                                        </div>
                                        <p className="text-sm text-white/40 font-mono">#{inquiry.part_number} • Qty: {inquiry.quantity}</p>

                                        <div className="pt-2 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-white/70">
                                                <span className="font-bold">{inquiry.customer_name}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-white/50">
                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {inquiry.customer_phone}</span>
                                                {inquiry.customer_email && (
                                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {inquiry.customer_email}</span>
                                                )}
                                            </div>
                                        </div>

                                        {inquiry.message && (
                                            <div className="mt-3 p-3 bg-white/5 rounded-lg text-sm text-white/80 border border-white/5">
                                                <MessageSquare className="w-3 h-3 text-white/30 mb-1" />
                                                "{inquiry.message}"
                                            </div>
                                        )}

                                        {inquiry.vehicle_info && (
                                            <p className="text-xs text-primary/80 mt-1">Vehicle: {inquiry.vehicle_info}</p>
                                        )}
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2 self-start md:self-center">
                                        {inquiry.status === "PENDING" && (
                                            <Button
                                                size="sm"
                                                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                                onClick={() => updateStatus(inquiry.id, "QUOTED")}
                                            >
                                                Mark Quoted
                                            </Button>
                                        )}
                                        {inquiry.status !== "COMPLETED" && (
                                            <Button
                                                size="sm"
                                                className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                                onClick={() => updateStatus(inquiry.id, "COMPLETED")}
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Complete
                                            </Button>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-white/20 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => deleteInquiry(inquiry.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
