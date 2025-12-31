"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gauge, Settings2, Fuel, BadgeCheck, Shield, ChevronRight, Heart, Share2, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useGarageStore } from "@/store/garage-store"
import { toast } from "sonner"
import type { Vehicle } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface InventoryCardProps {
    vehicle: Vehicle
    currency?: "USD" | "GHS"
    exchangeRate?: number
}

export function InventoryCard({ vehicle, currency = "GHS", exchangeRate = 15.0 }: InventoryCardProps) {
    const { isLiked, toggleLike } = useGarageStore()
    const liked = isLiked(vehicle.id)
    const [showMonthly, setShowMonthly] = useState(false)
    const [viewCount, setViewCount] = useState(vehicle.view_count || 0)

    useEffect(() => {
        setViewCount(vehicle.view_count || 0)
    }, [vehicle.view_count])

    const formatPrice = (amount: number) => {
        const rate = currency === "USD" ? 1 : exchangeRate
        const converted = amount * rate
        const symbol = currency === "USD" ? "$" : "₵"
        return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault()
        const url = `${window.location.origin}/inventory/${vehicle.id}`
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                    text: `Check out this car on Woody Motors!`,
                    url: url
                })
            } catch (err) {
                console.log("Share cancelled")
            }
        } else {
            await navigator.clipboard.writeText(url)
            toast.success("Link copied to clipboard!")
        }
    }

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault()
        toggleLike(vehicle)
        if (!liked) {
            toast.success("Added to Dream Garage", {
                description: "View your saved cars in the garage.",
                icon: <Heart className="w-4 h-4 text-red-500 fill-current" />
            })
        }
    }

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5 group relative transform transition-all hover:-translate-y-1 hover:shadow-primary/5">
            {/* Live Pulse Badge */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{viewCount} watching</span>
                </div>
            </div>

            <Link href={`/inventory/${vehicle.id}`} className="block relative aspect-[4/3] overflow-hidden">
                <img
                    src={vehicle.images?.[0] || "/placeholder.svg?height=600&width=800"}
                    alt={vehicle.make}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
                    {/* Like Button */}
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={handleLike}
                        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all ${liked ? "bg-[#E4405F] text-white" : "bg-black/40 text-white hover:bg-black/60"
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                    </motion.button>
                    {/* Share Button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all"
                    >
                        <Share2 className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Status Badges */}
                <div className="absolute bottom-4 left-6 flex gap-2">
                    {vehicle.is_duty_paid && (
                        <Badge className="bg-green-500/90 backdrop-blur-md text-white border-none rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <BadgeCheck className="h-3 w-3" /> Duty
                        </Badge>
                    )}
                </div>

                {/* SOLD Overlay */}
                {vehicle.status?.toLowerCase() === "sold" && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <span className="bg-red-600/90 text-white font-black text-2xl px-6 py-2 rounded-xl transform -rotate-12 border-4 border-white/20 shadow-2xl backdrop-blur-md">
                            SOLD
                        </span>
                    </div>
                )}
            </Link>

            <div className="p-8 pt-6">
                <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-primary font-black text-lg mb-1 block">{vehicle.year}</span>
                            <h3 className="text-2xl font-black text-secondary leading-tight uppercase tracking-tighter hover:text-primary transition-colors cursor-pointer">
                                <Link href={`/inventory/${vehicle.id}`}>
                                    {vehicle.make} <span className="text-muted-foreground/60">{vehicle.model}</span>
                                </Link>
                            </h3>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <AnimatePresence mode="wait">
                                {showMonthly && vehicle.is_installment_available && vehicle.monthly_installment_value ? (
                                    <motion.div
                                        key="monthly"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-4xl font-black text-secondary tracking-tighter"
                                    >
                                        {formatPrice(vehicle.monthly_installment_value)} <span className="text-sm text-muted-foreground font-bold uppercase align-middle">/mo</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="cash"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-4xl font-black text-secondary tracking-tighter"
                                    >
                                        {formatPrice(vehicle.price)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Financial Toggle */}
                        {vehicle.is_installment_available && vehicle.monthly_installment_value && (
                            <div className="flex items-center gap-3 bg-secondary/5 rounded-xl p-2 px-3 self-start">
                                <Switch
                                    id={`finance-toggle-${vehicle.id}`}
                                    checked={showMonthly}
                                    onCheckedChange={setShowMonthly}
                                    className="data-[state=checked]:bg-primary scale-75"
                                />
                                <Label htmlFor={`finance-toggle-${vehicle.id}`} className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none text-secondary/70">
                                    Show Monthly
                                </Label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mb-8">
                    {[
                        { icon: Gauge, val: `${(vehicle.mileage / 1000).toFixed(0)}K` },
                        { icon: Settings2, val: vehicle.transmission?.slice(0, 4) },
                        { icon: Fuel, val: vehicle.fuel_type },
                    ].map((panel, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-[#f8f9fa] rounded-2xl p-3 flex flex-col items-center justify-center border border-border/50 group-hover:bg-primary/5 transition-colors"
                        >
                            <panel.icon className="h-4 w-4 text-secondary/40 mb-2 group-hover:text-primary transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-secondary/60">
                                {panel.val}
                            </span>
                        </div>
                    ))}
                </div>

                {vehicle.status?.toLowerCase() === "sold" ? (
                    <div className="w-full h-14 rounded-2xl border-2 border-red-500/50 text-red-600 flex items-center justify-center bg-transparent cursor-default">
                        <span className="font-black uppercase tracking-widest text-xs">Sold</span>
                    </div>
                ) : (
                    <Button
                        asChild
                        variant="outline"
                        className="w-full h-14 rounded-2xl border-2 border-green-500/30 hover:border-green-500 hover:bg-green-500 hover:text-white text-green-600 transition-all group/btn bg-transparent"
                    >
                        <Link
                            href={`/inventory/${vehicle.id}`}
                            className="flex items-center justify-center gap-2"
                        >
                            <span className="font-black uppercase tracking-widest text-xs">Available</span>
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}
