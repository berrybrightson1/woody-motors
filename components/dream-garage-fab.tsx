"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useGarageStore } from "@/store/garage-store"
import { Car, X, ChevronRight, Trash2 } from "lucide-react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export function DreamGarageFAB() {
    const { likedVehicles, toggleLike } = useGarageStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Sheet>
            <AnimatePresence>
                {likedVehicles.length > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <SheetTrigger asChild>
                            <Button
                                size="lg"
                                className="h-16 w-16 rounded-full bg-gradient-to-br from-[#F58220] to-[#D96B10] shadow-[0_10px_40px_rgba(245,130,32,0.4)] hover:shadow-[0_20px_60px_rgba(245,130,32,0.6)] border-4 border-white transition-all hover:scale-110 p-0 relative"
                            >
                                <Car className="w-7 h-7 text-white" />
                                <Badge className="absolute -top-2 -right-2 bg-black text-white border-2 border-white min-w-[24px] h-6 rounded-full flex items-center justify-center px-0 text-xs font-black">
                                    {likedVehicles.length}
                                </Badge>
                            </Button>
                        </SheetTrigger>
                    </motion.div>
                )}
            </AnimatePresence>

            <SheetContent className="w-full sm:max-w-md bg-secondary border-l-white/10 p-0">
                <SheetHeader className="p-8 pb-4 border-b border-white/10">
                    <SheetTitle className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <span className="bg-primary/20 p-2 rounded-xl text-primary">
                            <Car className="w-6 h-6" />
                        </span>
                        Dream Garage
                    </SheetTitle>
                    <p className="text-white/50 font-medium">Your saved collection of premium machinery.</p>
                </SheetHeader>

                <div className="flex flex-col h-full overflow-y-auto p-6 gap-4 pb-24">
                    {likedVehicles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
                            <Car className="w-16 h-16 mb-4" />
                            <p className="font-bold uppercase tracking-widest">Garage Empty</p>
                        </div>
                    ) : (
                        likedVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-white/5 rounded-2xl p-4 flex gap-4 border border-white/5 group relative hover:bg-white/10 transition-colors">
                                <div className="w-24 h-24 rounded-xl bg-black/50 overflow-hidden flex-shrink-0">
                                    <img
                                        src={vehicle.images?.[0] || "/placeholder.svg"}
                                        alt={vehicle.model}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">{vehicle.year}</p>
                                    <h4 className="text-white font-bold text-lg leading-tight truncate">{vehicle.make} {vehicle.model}</h4>
                                    <p className="text-white/60 font-bold mt-1">${vehicle.price.toLocaleString()}</p>

                                    <Link href={`/inventory/${vehicle.id}`} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white mt-3 transition-colors">
                                        View Details <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                                <button
                                    onClick={() => toggleLike(vehicle)}
                                    className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-white/10 bg-secondary/95 backdrop-blur-xl">
                    <Button asChild className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-base">
                        <Link href="/bookings/test-drive">
                            Book Test Drive for All
                        </Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
