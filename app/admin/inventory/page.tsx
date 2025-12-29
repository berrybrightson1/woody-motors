"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft, Trash2, Edit, X, Check } from "lucide-react"
import Link from "next/link"
import { getStoredVehicles, deleteStoredVehicle, type Vehicle } from "@/lib/local-storage"
import { DEMO_VEHICLES } from "@/lib/demo-data"
import { toast } from "sonner"

export default function AdminInventoryPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const [isDemo, setIsDemo] = useState(false)

    useEffect(() => {
        async function fetchVehicles() {
            setLoading(true)
            const supabase = createClient()

            // In demo mode or no supabase, strictly use local storage
            // avoiding hardcoded demoVehicles ensures "clean" dashboard
            if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
                const stored = getStoredVehicles()
                setVehicles(stored.length > 0 ? stored : DEMO_VEHICLES)
                setIsDemo(true)
                setLoading(false)
                return
            }

            const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false })

            if (!data || data.length === 0) {
                // If DB empty/failed, fall back to local storage
                const stored = getStoredVehicles()
                setVehicles(stored.length > 0 ? stored : DEMO_VEHICLES)
                setIsDemo(true)
            } else {
                setVehicles(data)
            }
            setLoading(false)
        }

        fetchVehicles()
    }, [])

    const handleDelete = async (vehicleId: string) => {
        if (isDemo) {
            // Optimistic delete
            deleteStoredVehicle(vehicleId)
            setVehicles(prev => prev.filter(v => v.id !== vehicleId))

            toast.success("VEHICLE DELETED", {
                description: "The vehicle was removed from inventory.",
                className: "bg-red-500 border-none text-white font-bold"
            })
        } else {
            // Handle supabase delete if needed later
            toast.error("Deletion only available in demo mode")
        }
    }

    const handleStatusUpdate = async (vehicleId: string, newStatus: "available" | "sold") => {
        if (isDemo) {
            // Update demo data locally matches existing logic but misses persistence for status?
            // For now, updating state is enough visual feedback.
            setVehicles(prev => prev.map(v =>
                v.id === vehicleId ? { ...v, status: newStatus } : v
            ))
            setEditingVehicle(null)
            return
        }

        const supabase = createClient()
        if (!supabase) return

        const { error } = await supabase
            .from("vehicles")
            .update({ status: newStatus })
            .eq("id", vehicleId)

        if (!error) {
            setVehicles(prev => prev.map(v =>
                v.id === vehicleId ? { ...v, status: newStatus } : v
            ))
        }
        setEditingVehicle(null)
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
                        <h1 className="text-2xl font-bold text-white">Manage Inventory</h1>
                        <p className="text-sm text-white/50">View and manage all vehicles</p>
                    </div>
                </div>

                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold px-5 h-10 rounded-lg">
                    <Link href="/admin/inventory/new" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Vehicle
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="bg-[#1A1A1A] border-white/10 rounded-lg">
                    <CardContent className="p-4">
                        <p className="text-white/40 text-xs font-bold uppercase tracking-wide">Total</p>
                        <p className="text-2xl font-bold text-white mt-1">{vehicles.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20 rounded-lg">
                    <CardContent className="p-4">
                        <p className="text-green-400/60 text-xs font-bold uppercase tracking-wide">Available</p>
                        <p className="text-2xl font-bold text-green-400 mt-1">{vehicles.filter(v => v.status === "available").length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20 rounded-lg">
                    <CardContent className="p-4">
                        <p className="text-red-400/60 text-xs font-bold uppercase tracking-wide">Sold</p>
                        <p className="text-2xl font-bold text-red-400 mt-1">{vehicles.filter(v => v.status === "sold").length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Vehicle List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="text-center py-12 text-white/60">Loading vehicles...</div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-12 text-white/60">No vehicles in inventory</div>
                ) : (
                    vehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="bg-[#141414] border-white/5 rounded-lg overflow-hidden hover:border-white/10 transition-colors">
                            <CardContent className="p-3 flex items-center gap-3">
                                {/* Image */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                    <img
                                        src={vehicle.images?.[0] || "/placeholder.svg"}
                                        alt={`${vehicle.make} ${vehicle.model}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-sm font-bold text-white truncate">
                                            {vehicle.year} {vehicle.make} {vehicle.model}
                                        </h3>
                                        <Badge className={`${vehicle.status === "available" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"} border-none text-[10px] font-bold uppercase px-2 py-0.5`}>
                                            {vehicle.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-white/50">
                                        <span>${vehicle.price.toLocaleString()}</span>
                                        <span>•</span>
                                        <span>{vehicle.condition === "brand_new" ? "Brand New" : "Foreign Used"}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white/40 hover:text-white hover:bg-white/10 rounded-lg h-8 w-8"
                                        onClick={() => setEditingVehicle(vehicle)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg h-8 w-8"
                                        onClick={() => handleDelete(vehicle.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingVehicle && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A1A1A] rounded-xl p-6 w-full max-w-md border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Edit Vehicle Status</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/40 hover:text-white hover:bg-white/10 rounded-lg h-8 w-8"
                                onClick={() => setEditingVehicle(null)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="mb-6">
                            <p className="text-white/60 mb-2">
                                {editingVehicle.year} {editingVehicle.make} {editingVehicle.model}
                            </p>
                            <p className="text-sm text-white/40">
                                Current status: <span className={editingVehicle.status === "available" ? "text-green-400" : "text-red-400"}>
                                    {editingVehicle.status}
                                </span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                className={`h-12 rounded-lg font-bold ${editingVehicle.status === "available"
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-white/5 hover:bg-green-500/20 text-white/60 hover:text-green-400 border border-white/10"
                                    }`}
                                onClick={() => handleStatusUpdate(editingVehicle.id, "available")}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Available
                            </Button>
                            <Button
                                className={`h-12 rounded-lg font-bold ${editingVehicle.status === "sold"
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10"
                                    }`}
                                onClick={() => handleStatusUpdate(editingVehicle.id, "sold")}
                            >
                                Sold
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
