"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft, Trash2, Edit, Package, Wrench, Zap, Activity, Car, Filter, Droplet, Settings } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { SparePart, PartCategory } from "@/lib/types"

// Map categories to icons
const CATEGORY_ICONS: Record<PartCategory, any> = {
    ENGINE: Activity,
    BRAKES: parseIcon("Disc"), // disc isn't standard lucide, fallback
    ELECTRICAL: Zap,
    SUSPENSION: Activity,
    BODY: Car,
    FILTERS: Filter,
    FLUIDS: Droplet,
    TRANSMISSION: Settings,
    ACCESSORIES: Package,
    OTHER: Wrench
}

function parseIcon(name: string) {
    // Helper if we want dynamic icons, for now fallback to Wrench
    return Wrench
}

export default function AdminPartsPage() {
    const [parts, setParts] = useState<SparePart[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        if (!supabase) return

        fetchParts()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('admin-parts-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'spare_parts' },
                () => {
                    fetchParts()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function fetchParts() {
        setLoading(true)
        const supabase = createClient()

        if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from("spare_parts")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching parts:", error)
            toast.error("Failed to load parts")
        } else {
            // @ts-ignore - Supabase types might not perfectly align with our manual types yet
            setParts(data || [])
        }
        setLoading(false)
    }

    const handleDelete = async (partId: string) => {
        if (!confirm("Are you sure you want to delete this part? This cannot be undone.")) return

        const supabase = createClient()
        if (!supabase) {
            toast.error("Database connection failed")
            return
        }

        const { error } = await supabase
            .from("spare_parts")
            .delete()
            .eq("id", partId)

        if (error) {
            toast.error("Failed to delete part")
            console.error(error)
        } else {
            toast.success("Part deleted successfully")
            // Realtime subscription will handle the update
        }
    }

    const getCategoryIcon = (category: PartCategory) => {
        const Icon = CATEGORY_ICONS[category] || Wrench
        return <Icon className="w-4 h-4" />
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
                        <h1 className="text-2xl font-bold text-white">Spare Parts Inventory</h1>
                        <p className="text-sm text-white/50">Manage your parts catalog</p>
                    </div>
                </div>

                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold px-5 h-10 rounded-lg">
                    <Link href="/admin/parts/new" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add New Part
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="bg-[#1A1A1A] border-white/10 rounded-lg">
                    <CardContent className="p-4">
                        <p className="text-white/40 text-xs font-bold uppercase tracking-wide">Total Parts</p>
                        <p className="text-2xl font-bold text-white mt-1">{parts.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20 rounded-lg">
                    <CardContent className="p-4">
                        <p className="text-green-400/60 text-xs font-bold uppercase tracking-wide">In Stock</p>
                        <p className="text-2xl font-bold text-green-400 mt-1">
                            {parts.filter(p => p.in_stock).length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20 rounded-lg">
                    <CardContent className="p-4">
                        <p className="text-red-400/60 text-xs font-bold uppercase tracking-wide">Out of Stock</p>
                        <p className="text-2xl font-bold text-red-400 mt-1">
                            {parts.filter(p => !p.in_stock).length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Parts List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="text-center py-12 text-white/60">Loading parts...</div>
                ) : parts.length === 0 ? (
                    <div className="text-center py-12 text-white/60">No parts found</div>
                ) : (
                    parts.map((part) => (
                        <Card key={part.id} className="bg-[#141414] border-white/5 rounded-lg overflow-hidden hover:border-white/10 transition-colors">
                            <CardContent className="p-3 flex items-center gap-3">
                                {/* Image */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                                    {part.images?.[0] ? (
                                        <img
                                            src={part.images[0]}
                                            alt={part.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Wrench className="w-6 h-6 text-white/20" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-sm font-bold text-white truncate">
                                            {part.name}
                                        </h3>
                                        <Badge className="bg-white/5 text-white/60 border-none text-[10px] uppercase px-2 py-0.5 flex items-center gap-1">
                                            {getCategoryIcon(part.category)}
                                            {part.category}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-white/50">
                                        <span className="font-mono text-white/30">#{part.part_number}</span>
                                        <span>•</span>
                                        <span>{part.currency} {part.price.toLocaleString()}</span>
                                        <span>•</span>
                                        <span className={part.in_stock ? "text-green-400" : "text-red-400"}>
                                            {part.in_stock ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white/40 hover:text-white hover:bg-white/10 rounded-lg h-8 w-8"
                                        asChild
                                    >
                                        <Link href={`/admin/parts/${part.id}`}>
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg h-8 w-8"
                                        onClick={() => handleDelete(part.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
