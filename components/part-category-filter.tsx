"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
    Activity, Wrench, Zap, Car, Filter, Droplet,
    Settings, Package, Search, X
} from "lucide-react"

import type { PartCategory } from "@/lib/types"

const CATEGORIES: { id: PartCategory; label: string; icon: any }[] = [
    { id: "ENGINE", label: "Engine & Drivetrain", icon: Activity },
    { id: "BRAKES", label: "Brakes & Rotors", icon: Wrench },
    { id: "ELECTRICAL", label: "Electrical & Lights", icon: Zap },
    { id: "SUSPENSION", label: "Suspension & Steering", icon: Activity },
    { id: "BODY", label: "Body & Exterior", icon: Car },
    { id: "FILTERS", label: "Filters (Oil/Air/Fuel)", icon: Filter },
    { id: "FLUIDS", label: "Oils & Fluids", icon: Droplet },
    { id: "TRANSMISSION", label: "Transmission", icon: Settings },
    { id: "ACCESSORIES", label: "Accessories", icon: Package },
    { id: "OTHER", label: "Other Parts", icon: Wrench },
]

interface FilterProps {
    selectedCategories: PartCategory[]
    setSelectedCategories: (categories: PartCategory[]) => void
    priceRange: number[]
    setPriceRange: (range: number[]) => void
    showInStockOnly: boolean
    setShowInStockOnly: (show: boolean) => void
    onClearFilters: () => void
}

export function PartCategoryFilter({
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange,
    showInStockOnly,
    setShowInStockOnly,
    onClearFilters
}: FilterProps) {

    const toggleCategory = (category: PartCategory) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category))
        } else {
            setSelectedCategories([...selectedCategories, category])
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="text-white font-black text-xl tracking-tight">Filters</h3>
                {(selectedCategories.length > 0 || priceRange[0] > 0 || showInStockOnly) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10 h-8 px-3 text-xs font-bold uppercase tracking-wider rounded-lg"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Availability */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider">Availability</h4>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="in-stock"
                        checked={showInStockOnly}
                        onCheckedChange={(c) => setShowInStockOnly(c as boolean)}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="in-stock" className="text-white cursor-pointer">In Stock Only</Label>
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider">Categories</h4>
                <div className="space-y-2">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon
                        const isSelected = selectedCategories.includes(cat.id)

                        return (
                            <div
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                className={`
                  flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all
                  ${isSelected ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'}
                `}
                            >
                                <div className={`p-1.5 rounded-md ${isSelected ? 'bg-primary/20' : 'bg-white/5'}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">{cat.label}</span>
                                {isSelected && <CheckIcon className="w-4 h-4 ml-auto" />}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4 px-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider">Price Range</h4>
                    <span className="text-xs text-white/40">Up to {priceRange[0].toLocaleString()} GHS</span>
                </div>
                <Slider
                    defaultValue={[50000]}
                    max={50000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="my-6 cursor-pointer"
                />
            </div>
        </div>
    )
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
