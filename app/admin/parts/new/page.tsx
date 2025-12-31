"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, X, ImagePlus, Send, Sparkles, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { PartCategory, StockLevel } from "@/lib/types"

const CATEGORIES: PartCategory[] = [
    "ENGINE", "BRAKES", "ELECTRICAL", "SUSPENSION", "BODY",
    "FILTERS", "FLUIDS", "TRANSMISSION", "ACCESSORIES", "OTHER"
]

const STOCK_LEVELS: StockLevel[] = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PRE_ORDER"]

export default function NewPartPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form State
    const [name, setName] = useState("")
    const [partNumber, setPartNumber] = useState("")
    const [category, setCategory] = useState<PartCategory>("OTHER")
    const [brand, setBrand] = useState("")
    const [price, setPrice] = useState("")
    const [stockLevel, setStockLevel] = useState<StockLevel>("IN_STOCK")
    const [description, setDescription] = useState("")
    const [isUniversal, setIsUniversal] = useState(false)

    // Compatibility State
    const [make, setMake] = useState("")
    const [model, setModel] = useState("")
    const [year, setYear] = useState("")
    const [compatibleMakes, setCompatibleMakes] = useState<string[]>([])
    const [compatibleModels, setCompatibleModels] = useState<string[]>([])
    const [compatibleYears, setCompatibleYears] = useState<string[]>([])

    const handleAddVisualClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files && files.length > 0) {
            setLoading(true)
            const newImages: string[] = []
            const fileArray = Array.from(files)

            // Dynamic import to avoid SSR issues
            const { compressImage } = await import("@/lib/utils")

            try {
                for (const file of fileArray) {
                    if (images.length + newImages.length < 5) {
                        const compressed = await compressImage(file)
                        newImages.push(compressed)
                    }
                }
                setImages(prev => [...prev, ...newImages])
                toast.success("Images compressed & added")
            } catch (error) {
                console.error("Compression failed:", error)
                toast.error("Failed to process images")
            } finally {
                setLoading(false)
            }
        }
        if (event.target) event.target.value = ''
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const addCompatibility = () => {
        if (make) {
            if (!compatibleMakes.includes(make)) setCompatibleMakes([...compatibleMakes, make])
            setMake("")
        }
        if (model) {
            if (!compatibleModels.includes(model)) setCompatibleModels([...compatibleModels, model])
            setModel("")
        }
        if (year) {
            if (!compatibleYears.includes(year)) setCompatibleYears([...compatibleYears, year])
            setYear("")
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        const supabase = createClient()

        if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            toast.error("Database connection failed")
            setLoading(false)
            return
        }

        const partData = {
            name,
            part_number: partNumber,
            category,
            brand,
            price: parseFloat(price) || 0,
            currency: "GHS",
            in_stock: stockLevel !== "OUT_OF_STOCK",
            stock_level: stockLevel,
            description,
            images,
            compatible_makes: compatibleMakes,
            compatible_models: compatibleModels,
            compatible_years: compatibleYears,
            is_universal: isUniversal,
            featured: false,
            view_count: 0
        }

        const { error } = await supabase.from("spare_parts").insert(partData)

        if (error) {
            console.error(error)
            toast.error("Failed to create part: " + error.message)
        } else {
            toast.success("PART LIVE ON CATALOG", {
                description: "Successfully added to inventory",
                className: "bg-[#00ff9d] border-none text-black font-black tracking-widest uppercase",
            })
            router.push("/admin/parts")
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <header className="p-4 md:p-8 flex items-center gap-4 md:gap-6">
                <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/5 hover:bg-white/10 text-white">
                    <Link href="/admin/parts">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <h1 className="text-lg md:text-2xl font-black text-white tracking-tight">Parts Creator Studio</h1>
            </header>

            <main className="flex-1 px-4 md:px-12 pb-12 space-y-8 md:space-y-12">
                {/* Step 1: Visuals */}
                <section className="space-y-6">
                    <div className="flex justify-between items-end">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Step 01: Visuals</h2>
                        <span className="text-[10px] font-bold text-primary/60 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 tracking-widest">
                            GALLERY READY
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />
                        {images.map((img, idx) => (
                            <div key={idx} className="aspect-[4/3] md:aspect-square bg-[#222222] rounded-2xl md:rounded-[2rem] relative overflow-hidden group border border-white/5 shadow-xl">
                                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-primary"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {images.length < 5 && (
                            <button
                                onClick={handleAddVisualClick}
                                className="aspect-[4/3] md:aspect-square bg-white/5 rounded-2xl md:rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all"
                            >
                                <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                                    <ImagePlus className="w-8 h-8 text-white/40 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">
                                    Add Visual
                                </span>
                            </button>
                        )}
                    </div>
                </section>

                {/* Step 2: Details */}
                <section className="space-y-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Step 02: Core Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Part Name</Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Ceramic Brake Pads"
                                className="rounded-xl md:rounded-2xl bg-white/5 border-white/5 h-12 md:h-14 text-white font-bold px-4 md:px-6 focus:bg-white/10 transition-colors text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Part Number (SKU)</Label>
                            <Input
                                value={partNumber}
                                onChange={e => setPartNumber(e.target.value)}
                                placeholder="e.g. OEM-998877"
                                className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Category</Label>
                            <Select value={category} onValueChange={(v) => setCategory(v as PartCategory)}>
                                <SelectTrigger className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#222222] border-white/10 text-white rounded-2xl">
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat} className="rounded-xl focus:bg-primary">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Brand</Label>
                            <Input
                                value={brand}
                                onChange={e => setBrand(e.target.value)}
                                placeholder="e.g. Brembo"
                                className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Price (GHS)</Label>
                            <Input
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Stock Status</Label>
                            <Select value={stockLevel} onValueChange={(v) => setStockLevel(v as StockLevel)}>
                                <SelectTrigger className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#222222] border-white/10 text-white rounded-2xl">
                                    {STOCK_LEVELS.map(level => (
                                        <SelectItem key={level} value={level} className="rounded-xl focus:bg-primary">{level.replace(/_/g, " ")}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-full space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Description</Label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Detailed product description..."
                                className="rounded-2xl bg-white/5 border-white/5 min-h-[150px] text-white p-6 focus:bg-white/10 transition-colors resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Step 3: Compatibility */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Step 03: Fitment</h2>
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <Label htmlFor="universal" className="text-xs font-bold text-white cursor-pointer">Universal Fit?</Label>
                            <Switch
                                id="universal"
                                checked={isUniversal}
                                onCheckedChange={setIsUniversal}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>

                    {!isUniversal && (
                        <div className="bg-[#222222] rounded-[3rem] p-8 border border-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Input
                                    placeholder="Make (e.g. Toyota)"
                                    value={make}
                                    onChange={e => setMake(e.target.value)}
                                    className="rounded-xl bg-black/20 border-white/5 h-12 text-white px-4"
                                />
                                <Input
                                    placeholder="Model (e.g. Camry)"
                                    value={model}
                                    onChange={e => setModel(e.target.value)}
                                    className="rounded-xl bg-black/20 border-white/5 h-12 text-white px-4"
                                />
                                <Input
                                    placeholder="Year (e.g. 2020)"
                                    value={year}
                                    onChange={e => setYear(e.target.value)}
                                    className="rounded-xl bg-black/20 border-white/5 h-12 text-white px-4"
                                />
                            </div>
                            <Button onClick={addCompatibility} variant="secondary" className="w-full h-12 rounded-xl font-bold mb-6">
                                <Plus className="w-4 h-4 mr-2" /> Add Compatibility Tag
                            </Button>

                            <div className="flex flex-wrap gap-2">
                                {compatibleMakes.map((m, i) => (
                                    <Badge key={`make-${i}`} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg cursor-pointer" onClick={() => setCompatibleMakes(prev => prev.filter(x => x !== m))}>
                                        Make: {m} <X className="w-3 h-3 ml-2" />
                                    </Badge>
                                ))}
                                {compatibleModels.map((m, i) => (
                                    <Badge key={`model-${i}`} className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-lg cursor-pointer" onClick={() => setCompatibleModels(prev => prev.filter(x => x !== m))}>
                                        Model: {m} <X className="w-3 h-3 ml-2" />
                                    </Badge>
                                ))}
                                {compatibleYears.map((y, i) => (
                                    <Badge key={`year-${i}`} className="bg-white/5 hover:bg-white/10 text-white/60 px-3 py-1.5 rounded-lg cursor-pointer" onClick={() => setCompatibleYears(prev => prev.filter(x => x !== y))}>
                                        {y} <X className="w-3 h-3 ml-2" />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <div className="pt-8 border-t border-white/5">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !name || !price || images.length === 0}
                        className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-2xl gap-4 shadow-[0_20px_50px_rgba(243,138,72,0.3)] hover:shadow-primary/50 transition-all border-none group"
                    >
                        {loading ? (
                            <div className="flex items-center gap-4">
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                PUBLISHING...
                            </div>
                        ) : (
                            <>
                                <Send className="w-7 h-7 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                                PUBLISH PART
                            </>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    )
}
