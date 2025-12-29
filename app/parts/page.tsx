"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { PartsCard } from "@/components/parts-card"
import { PartCategoryFilter } from "@/components/part-category-filter"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SparePart, PartCategory } from "@/lib/types"

export default function PartsPage() {
    const [parts, setParts] = useState<SparePart[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategories, setSelectedCategories] = useState<PartCategory[]>([])
    const [priceRange, setPriceRange] = useState([50000]) // Default max
    const [showInStockOnly, setShowInStockOnly] = useState(false)
    const [sortBy, setSortBy] = useState("newest")

    useEffect(() => {
        fetchParts()
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

        if (!error && data) {
            // @ts-ignore
            setParts(data)
        }
        setLoading(false)
    }

    // Filter Logic
    const filteredParts = parts.filter(part => {
        // Search
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            part.name.toLowerCase().includes(searchLower) ||
            part.part_number.toLowerCase().includes(searchLower) ||
            part.brand.toLowerCase().includes(searchLower)

        // Category
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(part.category)

        // Price
        const matchesPrice = part.price <= priceRange[0]

        // Stock
        const matchesStock = !showInStockOnly || part.in_stock

        return matchesSearch && matchesCategory && matchesPrice && matchesStock
    })

    // Sort Logic
    const sortedParts = [...filteredParts].sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price
        if (sortBy === "price_desc") return b.price - a.price
        if (sortBy === "name_asc") return a.name.localeCompare(b.name)
        // Default newest
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
    })

    const clearFilters = () => {
        setSelectedCategories([])
        setPriceRange([50000])
        setShowInStockOnly(false)
        setSearchTerm("")
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">
                            Woody <span className="text-primary">Parts</span>
                        </h1>
                        <p className="text-white/50 mt-2 max-w-lg">
                            Genuine OEM spare parts, accessories, and maintenance essentials for your premium vehicle.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            placeholder="Search by part name, number, or brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-white/10 text-white pl-10 h-12 rounded-xl"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar (hidden on mobile) */}
                    <div className="hidden lg:block w-64 flex-shrink-0 space-y-8">
                        <PartCategoryFilter
                            selectedCategories={selectedCategories}
                            setSelectedCategories={setSelectedCategories}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            showInStockOnly={showInStockOnly}
                            setShowInStockOnly={setShowInStockOnly}
                            onClearFilters={clearFilters}
                        />
                    </div>

                    {/* Mobile Filters & Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6 sticky top-20 z-10 bg-[#0A0A0A]/90 backdrop-blur-md py-2 border-b border-white/5">
                            <p className="text-sm text-white/50">
                                Showing <strong className="text-white">{sortedParts.length}</strong> parts
                            </p>

                            <div className="flex items-center gap-2">
                                {/* Mobile Filter Sheet */}
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="lg:hidden bg-white/5 border-white/10 text-white gap-2">
                                            <SlidersHorizontal className="w-4 h-4" /> Filters
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="bg-[#1A1A1A] border-white/10 text-white overflow-y-auto">
                                        <div className="mt-6">
                                            <PartCategoryFilter
                                                selectedCategories={selectedCategories}
                                                setSelectedCategories={setSelectedCategories}
                                                priceRange={priceRange}
                                                setPriceRange={setPriceRange}
                                                showInStockOnly={showInStockOnly}
                                                setShowInStockOnly={setShowInStockOnly}
                                                onClearFilters={clearFilters}
                                            />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white h-9">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest Arrivals</SelectItem>
                                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                                        <SelectItem value="name_asc">Name: A to Z</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-white/5 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : sortedParts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedParts.map(part => (
                                    <PartsCard key={part.id} part={part} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No Parts Found</h3>
                                <p className="text-white/50 mb-6">Try adjusting your filters or search term.</p>
                                <Button onClick={clearFilters} variant="secondary">Clear All Filters</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
