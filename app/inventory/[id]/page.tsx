"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Gauge, Fuel, Settings2, CheckCircle2, ShieldCheck, Share2, ArrowRight, Copy, Check, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

import { getStoredVehicles } from "@/lib/local-storage"

type Vehicle = {
    id: string
    make: string
    model: string
    year: number
    price: number
    mileage: number
    transmission: string
    fuel_type: string
    condition: "foreign_used" | "brand_new"
    is_duty_paid: boolean
    vin_verified: boolean
    images: string[]
    description?: string
    features?: string[]
    view_count?: number
}

const demoVehicles: Vehicle[] = [
    {
        id: "demo-1",
        make: "Mercedes-Benz",
        model: "S-Class",
        year: 2024,
        price: 85000,
        mileage: 12000,
        transmission: "Automatic",
        fuel_type: "Petrol",
        condition: "brand_new",
        is_duty_paid: true,
        vin_verified: true,
        images: [
            "/luxury-car-showroom.png",
            "/car-front.png",
            "/luxury-car-shot-.jpg",
            "/luxury-car-showroom.png",
            "/car-front.png"
        ],
        features: ["Panoramic Sunroof", "Burmester Sound", "Massage Seats", "Heads-up Display"]
    },
    {
        id: "demo-2",
        make: "BMW",
        model: "7 Series",
        year: 2023,
        price: 72000,
        mileage: 28000,
        transmission: "Automatic",
        fuel_type: "Diesel",
        condition: "foreign_used",
        is_duty_paid: true,
        vin_verified: true,
        images: [
            "/car-front.png",
            "/luxury-car-showroom.png",
            "/luxury-car-shot-.jpg",
            "/car-front.png",
            "/luxury-car-showroom.png"
        ],
        features: ["Executive Lounge", "Theatre Screen", "Laser Lights"]
    },
    // Add other demos locally for fallback matching
]

export default function VehicleDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [vehicle, setVehicle] = useState<Vehicle | null>(null)
    const [loading, setLoading] = useState(true)
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: true })])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [copied, setCopied] = useState(false)
    const [viewCount, setViewCount] = useState<number>(0)

    useEffect(() => {
        if (!emblaApi) return
        emblaApi.on("select", () => {
            setSelectedIndex(emblaApi.selectedScrollSnap())
        })
    }, [emblaApi])

    const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
    const scrollNext = () => emblaApi && emblaApi.scrollNext()
    const scrollTo = (index: number) => emblaApi && emblaApi.scrollTo(index)

    const handleShare = async () => {
        const shareData = {
            title: `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`,
            text: `Check out this ${vehicle?.year} ${vehicle?.make} ${vehicle?.model} at Woody Motors!`,
            url: window.location.href,
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                console.log("Error sharing:", err)
            }
        } else {
            navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    // ...

    useEffect(() => {
        async function fetchVehicle() {
            const id = params.id as string

            // 1. Check hardcoded demos
            const demo = demoVehicles.find(v => v.id === id)
            if (demo) {
                setVehicle(demo)
                setLoading(false)
                return
            }

            // 2. Check local storage (newly published vehicles)
            const storedVehicles = getStoredVehicles()
            // @ts-ignore - Local storage vehicle type might slightly differ but is compatible for display
            const localMatch = storedVehicles.find(v => v.id === id)

            if (localMatch) {
                setVehicle({
                    ...localMatch,
                    // Ensure mandatory fields for this view are present
                    condition: localMatch.condition as "foreign_used" | "brand_new",
                    features: [] // Default features as empty for local vehicles
                })
                setLoading(false)
                return
            }

            // 3. Fetch from Supabase (Real DB)
            if (supabase) {
                const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).single()
                if (data && !error) {
                    setVehicle(data)
                    setViewCount(data.view_count || 0)
                }
            }
            setLoading(false)
        }
        fetchVehicle()
    }, [params.id])

    // Real-time View Count Logic
    useEffect(() => {
        const id = params.id as string
        const supabase = createClient()
        if (!supabase) return

        // 1. Increment View Count
        const incrementView = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                console.log("Admin view skipped")
                return
            }
            await supabase.rpc("increment_vehicle_view_count", { vehicle_id: id })
        }
        incrementView()

        // 2. Subscribe to Real-time Updates
        const channel = supabase
            .channel(`public:vehicles:id=eq.${id}`)
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "vehicles", filter: `id=eq.${id}` }, (payload) => {
                console.log("Real-time update:", payload)
                if (payload.new && typeof payload.new.view_count === 'number') {
                    setViewCount(payload.new.view_count)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [params.id])

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">Loading...</div>
    if (!vehicle) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">Vehicle not found</div>

    return (
        <div className="min-h-screen bg-[#fafafa] py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <Button variant="ghost" asChild className="mb-8 hover:bg-white">
                    <Link href="/inventory" className="flex items-center gap-2 text-muted-foreground">
                        <ArrowLeft className="w-4 h-4" /> Back to Inventory
                    </Link>
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                >
                    {/* Left: Images (Carousel) */}
                    <div className="space-y-6">
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white relative group">
                            {/* Watching Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="absolute top-6 left-6 z-20 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 shadow-xl"
                            >
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                                </span>
                                <span className="text-xs font-bold tracking-wider">{viewCount} WATCHING</span>
                            </motion.div>

                            <div className="overflow-hidden h-full" ref={emblaRef}>
                                <div className="flex h-full">
                                    {(vehicle.images && vehicle.images.length > 0 ? vehicle.images : ["/placeholder.png"]).filter(img => !img.includes("placeholder") || vehicle.images.length === 0).map((img, index) => (
                                        <div key={index} className="flex-[0_0_100%] min-w-0 relative">
                                            <img
                                                src={img}
                                                alt={`${vehicle.make} ${vehicle.model} - View ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Arrows */}
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-white/80 hover:bg-white text-black opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                                onClick={scrollPrev}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-white/80 hover:bg-white text-black opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                                onClick={scrollNext}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-5 gap-3">
                            {(vehicle.images && vehicle.images.length > 0 ? vehicle.images : ["/placeholder.png"]).map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollTo(i)}
                                    className={`aspect-square rounded-xl bg-white shadow-sm overflow-hidden cursor-pointer transition-all border-2 ${selectedIndex === i ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                                >
                                    <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                {vehicle.condition === "brand_new" && <Badge className="bg-black text-white hover:bg-black/90">BRAND NEW</Badge>}
                                {vehicle.is_duty_paid && <Badge className="bg-green-500 text-white hover:bg-green-600 gap-1"><CheckCircle2 className="w-3 h-3" /> DUTY PAID</Badge>}
                                {vehicle.vin_verified && <Badge className="bg-blue-500 text-white hover:bg-blue-600 gap-1"><ShieldCheck className="w-3 h-3" /> VERIFIED VIN</Badge>}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-secondary mb-2 uppercase tracking-tighter">
                                {vehicle.year} {vehicle.make} <span className="text-muted-foreground">{vehicle.model}</span>
                            </h1>
                            <p className="text-6xl md:text-7xl font-black text-primary tracking-tighter">
                                ${vehicle.price.toLocaleString()}
                            </p>
                        </div>

                        <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden">
                            <CardContent className="p-8 grid grid-cols-2 gap-y-8 gap-x-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Gauge className="w-4 h-4" /> Mileage
                                    </span>
                                    <p className="text-xl font-bold">{vehicle.mileage.toLocaleString()} km</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Settings2 className="w-4 h-4" /> Transmission
                                    </span>
                                    <p className="text-xl font-bold">{vehicle.transmission}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Fuel className="w-4 h-4" /> Fuel Type
                                    </span>
                                    <p className="text-xl font-bold">{vehicle.fuel_type}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Year
                                    </span>
                                    <p className="text-xl font-bold">{vehicle.year}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-4">
                            <Button asChild size="lg" className="h-16 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                                <Link href={`/bookings?vehicle=${encodeURIComponent(`${vehicle.year} ${vehicle.make} ${vehicle.model}`)}`}>
                                    REQUEST SESSION
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 font-bold rounded-xl border-2"
                                onClick={handleShare}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-5 h-5 mr-2 text-green-500" /> Copied!
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-5 h-5 mr-2" /> Share / Copy Link
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                            <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
                            <div>
                                <h3 className="font-bold text-blue-900 mb-1">Woody Certified</h3>
                                <p className="text-sm text-blue-700/80">This vehicle has passed our rigorous 150-point inspection and comes with a 1-year warranty on major components.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
