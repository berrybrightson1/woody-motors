"use client"

import { useState, useEffect } from "react"
// @ts-ignore - Next.js 15+ params access
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, Share2, ShieldCheck, Truck, Wrench } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { PartsCard } from "@/components/parts-card"
import { SparePart } from "@/lib/types"

export default function PartDetailPage() {
    const params = useParams()
    const id = params?.id

    const [part, setPart] = useState<SparePart | null>(null)
    const [relatedParts, setRelatedParts] = useState<SparePart[]>([])
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)

    useEffect(() => {
        if (id) fetchPart()
    }, [id])

    async function fetchPart() {
        setLoading(true)
        const supabase = createClient()
        if (!supabase) return

        // 1. Fetch main part
        const { data, error } = await supabase
            .from("spare_parts")
            .select("*")
            .eq("id", id)
            .single()

        if (error || !data) {
            console.error(error)
            toast.error("Failed to load part")
        } else {
            // @ts-ignore
            setPart(data)

            // 2. Increment view count
            await supabase.rpc('increment_part_view_count', { part_id: id })

            // 3. Fetch related parts (same category, different ID)
            const { data: related } = await supabase
                .from("spare_parts")
                .select("*")
                .eq("category", data.category)
                .neq("id", id)
                .limit(3)

            // @ts-ignore
            if (related) setRelatedParts(related)
        }
        setLoading(false)
    }

    const handleShare = async () => {
        try {
            await navigator.share({
                title: part?.name,
                text: `Check out this ${part?.name} at Woody Motors`,
                url: window.location.href
            })
        } catch (err) {
            navigator.clipboard.writeText(window.location.href)
            toast.success("Link copied to clipboard")
        }
    }

    if (loading) return <div className="min-h-screen bg-[#0A0A0A] pt-32 text-center text-white/50">Loading part details...</div>
    if (!part) return <div className="min-h-screen bg-[#0A0A0A] pt-32 text-center text-white">Part not found</div>

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Breadcrumb / Back */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-lg">
                        <Link href="/parts">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-white/40">
                        <Link href="/parts" className="hover:text-white transition-colors">Parts</Link>
                        <span>/</span>
                        <span className="text-white">{part.name}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] bg-white/5 rounded-2xl overflow-hidden border border-white/5 relative group">
                            {part.images?.[activeImage] ? (
                                <img
                                    src={part.images[activeImage]}
                                    alt={part.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <Wrench className="w-16 h-16 opacity-50" />
                                </div>
                            )}

                            <Badge className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border-white/10 text-white">
                                {part.category}
                            </Badge>
                        </div>

                        {/* Thumbnails */}
                        {part.images && part.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {part.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-primary font-bold tracking-wider text-sm uppercase">{part.brand}</p>
                                <Button variant="ghost" size="icon" onClick={handleShare} title="Share Part" className="text-white/40 hover:text-primary">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{part.name}</h1>
                            <div className="flex items-center gap-4 text-white/40 text-sm font-mono">
                                <span>SKU: {part.part_number}</span>
                                <span className={part.in_stock ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                                    {part.stock_level.replace(/_/g, " ")}
                                </span>
                            </div>
                        </div>

                        {/* Price & CTA */}
                        <div className="p-6 bg-white/5 rounded-xl border border-white/5 space-y-6">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-white/40 text-sm font-bold uppercase mb-1">Price</p>
                                    <p className="text-3xl font-bold text-white tracking-tight">
                                        {part.currency} {part.price.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <Button asChild className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-xl">
                                <Link href={`/parts/quote?id=${part.id}`}>
                                    Request Quote / Buy Now
                                </Link>
                            </Button>

                            <div className="flex items-center justify-center gap-6 text-xs text-white/40 font-medium">
                                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Genuine Parts</span>
                                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Nationwide Delivery</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                            <div className="text-white/60 leading-relaxed space-y-4">
                                <p>{part.description || "No description available."}</p>
                            </div>
                        </div>

                        {/* Specifications */}
                        {part.specifications && Object.keys(part.specifications).length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">Specifications</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(part.specifications).map(([key, value]) => (
                                        <div key={key} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                            <p className="text-xs text-white/40 uppercase font-bold mb-1">{key}</p>
                                            <p className="text-white text-sm">{value as string}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Compatibility */}
                        {(part.compatible_makes?.length > 0 || part.is_universal) && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">Vehicle Compatibility</h3>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    {part.is_universal ? (
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Check className="w-5 h-5" />
                                            <span className="font-bold">Universal Fit - Compatible with most vehicles</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-white/40 uppercase font-bold mb-2">Fits Makes:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {part.compatible_makes.map(make => (
                                                        <Badge key={make} variant="secondary">{make}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            {part.compatible_models?.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-white/40 uppercase font-bold mb-2">Fits Models:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {part.compatible_models.map(model => (
                                                            <Badge key={model} variant="outline" className="text-white/60 border-white/10">{model}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Parts */}
                {relatedParts.length > 0 && (
                    <div className="mt-24 border-t border-white/10 pt-12">
                        <h2 className="text-2xl font-bold text-white mb-8">Related Parts</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedParts.map(p => (
                                <PartsCard key={p.id} part={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
