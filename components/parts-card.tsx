"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"
import Link from "next/link"
import { SparePart, PartCategory } from "@/lib/types"

interface PartsCardProps {
    part: SparePart
}

export function PartsCard({ part }: PartsCardProps) {
    return (
        <Card className="group bg-[#141414] border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-500 h-full flex flex-col">
            {/* Image Area */}
            <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                {part.images?.[0] ? (
                    <img
                        src={part.images[0]}
                        alt={part.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                        No Image
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <Badge className={`${part.in_stock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} border-none shadow-lg backdrop-blur-md`}>
                        {part.in_stock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Category & Brand */}
                <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-wider text-primary/80 uppercase">
                    <span>{part.category}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-white/40">{part.brand}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {part.name}
                </h3>
                <p className="text-xs text-white/40 font-mono mb-4">#{part.part_number}</p>

                {/* Price & Footer */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-white/40 font-bold uppercase">Price</p>
                        <p className="text-xl font-bold text-white">
                            {part.currency} {part.price.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Action - Only visible on hover/focus or always visible if preferred */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button asChild size="sm" variant="outline" className="w-full bg-transparent border-white/10 hover:bg-white/5 text-white">
                        <Link href={`/parts/${part.id}`}>
                            Details
                        </Link>
                    </Button>
                    <Button asChild size="sm" className="w-full bg-primary text-white hover:bg-primary/90">
                        <Link href={`/parts/${part.id}`}>
                            Get Quote
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    )
}
