"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// @ts-ignore - Using Next.js 15+ compatible params access
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Plus, X, Upload, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { PartCategory, StockLevel, SparePart } from "@/lib/types"

const CATEGORIES: PartCategory[] = [
    "ENGINE", "BRAKES", "ELECTRICAL", "SUSPENSION", "BODY",
    "FILTERS", "FLUIDS", "TRANSMISSION", "ACCESSORIES", "OTHER"
]

const STOCK_LEVELS: StockLevel[] = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PRE_ORDER"]

interface PageProps {
    params: { id: string }
}

// Next 14+ params are async in some contexts, but client side we use useParams
export default function EditPartPage({ params }: any) {
    const router = useRouter()
    // Fallback to useParams if props are issue
    const paramsHook = useParams()
    const id = params?.id || paramsHook?.id

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [originalPart, setOriginalPart] = useState<SparePart | null>(null)

    // Form State
    const [name, setName] = useState("")
    const [partNumber, setPartNumber] = useState("")
    const [category, setCategory] = useState<PartCategory>("OTHER")
    const [brand, setBrand] = useState("")
    const [price, setPrice] = useState("")
    const [stockLevel, setStockLevel] = useState<StockLevel>("IN_STOCK")
    const [description, setDescription] = useState("")
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [currentImageUrl, setCurrentImageUrl] = useState("")
    const [isUniversal, setIsUniversal] = useState(false)

    // Compatibility State
    const [make, setMake] = useState("")
    const [model, setModel] = useState("")
    const [year, setYear] = useState("")
    const [compatibleMakes, setCompatibleMakes] = useState<string[]>([])
    const [compatibleModels, setCompatibleModels] = useState<string[]>([])
    const [compatibleYears, setCompatibleYears] = useState<string[]>([])

    useEffect(() => {
        if (id) fetchPart()
    }, [id])

    async function fetchPart() {
        setLoading(true)
        const supabase = createClient()
        if (!supabase) return

        const { data, error } = await supabase
            .from("spare_parts")
            .select("*")
            .eq("id", id)
            .single()

        if (error || !data) {
            console.error(error)
            toast.error("Failed to load part details")
            router.push("/admin/parts")
        } else {
            // Populate form
            const part = data as SparePart
            setOriginalPart(part)
            setName(part.name)
            setPartNumber(part.part_number)
            setCategory(part.category)
            setBrand(part.brand)
            setPrice(part.price.toString())
            setStockLevel(part.stock_level)
            setDescription(part.description || "")
            setImageUrls(part.images || [])
            setIsUniversal(part.is_universal)
            setCompatibleMakes(part.compatible_makes || [])
            setCompatibleModels(part.compatible_models || [])
            setCompatibleYears(part.compatible_years || [])
        }
        setLoading(false)
    }

    const handleAddImage = () => {
        if (currentImageUrl && !imageUrls.includes(currentImageUrl)) {
            setImageUrls([...imageUrls, currentImageUrl])
            setCurrentImageUrl("")
        }
    }

    const removeImage = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index))
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const supabase = createClient()
        if (!supabase) {
            toast.error("Database connection failed")
            setSaving(false)
            return
        }

        const updates = {
            name,
            part_number: partNumber,
            category,
            brand,
            price: parseFloat(price),
            stock_level: stockLevel,
            in_stock: stockLevel !== "OUT_OF_STOCK",
            description,
            images: imageUrls,
            is_universal: isUniversal,
            compatible_makes: compatibleMakes,
            compatible_models: compatibleModels,
            compatible_years: compatibleYears,
        }

        const { error } = await supabase
            .from("spare_parts")
            .update(updates)
            .eq("id", id)

        if (error) {
            console.error(error)
            toast.error("Failed to update part")
        } else {
            toast.success("Part updated successfully")
            router.push("/admin/parts")
        }
        setSaving(false)
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this part?")) return

        const supabase = createClient()
        if (!supabase) return

        const { error } = await supabase.from("spare_parts").delete().eq("id", id)
        if (error) {
            toast.error("Failed to delete")
        } else {
            toast.success("Part deleted")
            router.push("/admin/parts")
        }
    }

    if (loading) return <div className="text-white text-center py-20">Loading...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-lg">
                        <Link href="/admin/parts">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Edit Part</h1>
                        <p className="text-sm text-white/50">{name}</p>
                    </div>
                </div>
                <Button variant="destructive" size="icon" onClick={handleDelete} className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <Card className="bg-[#141414] border-white/5 rounded-xl">
                    <CardContent className="p-6 space-y-6">
                        <h2 className="text-lg font-bold text-white mb-4">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-white">Part Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} required className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Part Number (SKU)</Label>
                                <Input value={partNumber} onChange={e => setPartNumber(e.target.value)} required className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Category</Label>
                                <Select value={category} onValueChange={(v) => setCategory(v as PartCategory)}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Brand / Manufacturer</Label>
                                <Input value={brand} onChange={e => setBrand(e.target.value)} required className="bg-white/5 border-white/10 text-white" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white">Description</Label>
                            <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-white/5 border-white/10 text-white min-h-[100px]" />
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing & Stock */}
                <Card className="bg-[#141414] border-white/5 rounded-xl">
                    <CardContent className="p-6 space-y-6">
                        <h2 className="text-lg font-bold text-white mb-4">Pricing & Inventory</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-white">Price (GHS)</Label>
                                <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Stock Status</Label>
                                <Select value={stockLevel} onValueChange={(v) => setStockLevel(v as StockLevel)}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STOCK_LEVELS.map(level => (
                                            <SelectItem key={level} value={level}>{level.replace(/_/g, " ")}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Compatibility */}
                <Card className="bg-[#141414] border-white/5 rounded-xl">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Vehicle Compatibility</h2>
                            <div className="flex items-center gap-2">
                                <Switch checked={isUniversal} onCheckedChange={setIsUniversal} id="universal" />
                                <Label htmlFor="universal" className="text-white">Universal Fit</Label>
                            </div>
                        </div>

                        {!isUniversal && (
                            <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="grid grid-cols-3 gap-3">
                                    <Input
                                        placeholder="Make"
                                        value={make}
                                        onChange={e => setMake(e.target.value)}
                                        className="bg-[#141414] border-white/10 text-white"
                                    />
                                    <Input
                                        placeholder="Model"
                                        value={model}
                                        onChange={e => setModel(e.target.value)}
                                        className="bg-[#141414] border-white/10 text-white"
                                    />
                                    <Input
                                        placeholder="Year"
                                        value={year}
                                        onChange={e => setYear(e.target.value)}
                                        className="bg-[#141414] border-white/10 text-white"
                                    />
                                </div>
                                <Button type="button" onClick={addCompatibility} variant="secondary" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" /> Add Compatibility Tag
                                </Button>
                            </div>
                        )}

                        {/* Tags Display */}
                        <div className="space-y-2">
                            {compatibleMakes.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-white/40 uppercase font-bold mr-2">Makes:</span>
                                    {compatibleMakes.map((m, i) => (
                                        <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setCompatibleMakes(prev => prev.filter(item => item !== m))}>
                                            {m} <X className="w-3 h-3 ml-1" />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            {compatibleModels.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-white/40 uppercase font-bold mr-2">Models:</span>
                                    {compatibleModels.map((m, i) => (
                                        <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setCompatibleModels(prev => prev.filter(item => item !== m))}>
                                            {m} <X className="w-3 h-3 ml-1" />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Images */}
                <Card className="bg-[#141414] border-white/5 rounded-xl">
                    <CardContent className="p-6 space-y-6">
                        <h2 className="text-lg font-bold text-white mb-4">Part Images</h2>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Paste image URL..."
                                value={currentImageUrl}
                                onChange={e => setCurrentImageUrl(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                            <Button type="button" onClick={handleAddImage} variant="secondary">
                                <Upload className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {imageUrls.map((url, i) => (
                                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                                    <img src={url} alt="Part preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        title="Remove Image"
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" asChild>
                        <Link href="/admin/parts" className="text-white/60 hover:text-white">Cancel</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-12 rounded-xl"
                    >
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    )
}
