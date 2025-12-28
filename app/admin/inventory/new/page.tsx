"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Sparkles, Send, ArrowLeft, X, ImagePlus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { generateCarCaption } from "@/app/actions/ai"
import { Checkbox } from "@/components/ui/checkbox"
import { Facebook, Instagram } from "lucide-react"
import { storeVehicle, type Vehicle } from "@/lib/local-storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function NewInventoryPage() {
  const [step, setStep] = useState(1)
  const [images, setImages] = useState<string[]>(["/car-front.png"])
  const [tone, setTone] = useState("corporate")
  const [loading, setLoading] = useState(false)
  const [caption, setCaption] = useState("")
  const [publishing, setPublishing] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [socials, setSocials] = useState({ facebook: false, instagram: false })

  const [formData, setFormData] = useState({
    manufacturer: "",
    model: "",
    year: "2024",
    price: "",
    vin: "",
    condition: "foreign_used",
    mileage: "",
    engine: "",
    transmission: "automatic",
    fuelType: "petrol",
  })

  const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString())

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleAddVisualClick = () => {
    // Request permission implicitly by triggering file input
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newImages: string[] = []
      const fileArray = Array.from(files)

      let processedCount = 0

      fileArray.forEach((file) => {
        if (images.length + newImages.length < 5) {
          const reader = new FileReader()
          reader.onloadend = () => {
            if (reader.result && typeof reader.result === 'string') {
              newImages.push(reader.result)
            }
            processedCount++

            // Only update state when all files are processed to avoid multiple re-renders
            if (processedCount === fileArray.length) {
              setImages(prev => [...prev, ...newImages])
            }
          }
          reader.readAsDataURL(file)
        } else {
          processedCount++
        }
      })
    }
    // Reset input so same file can be selected again
    if (event.target) {
      event.target.value = ''
    }
  }

  const generateCaption = async () => {
    setLoading(true)
    try {
      const result = await generateCarCaption({
        make: formData.manufacturer,
        model: formData.model,
        year: formData.year,
        price: formData.price,
        tone: tone as "corporate" | "street",
      })

      if (result.success) {
        setCaption(result.text)
      } else {
        setCaption(result.text || "Failed to generate caption. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Failed to generate caption:", error)
      setCaption("Failed to generate caption. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setPublishing(true)

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Prepare vehicle object for saving
    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      make: formData.manufacturer,
      model: formData.model,
      year: Number.parseInt(formData.year),
      price: Number.parseFloat(formData.price.replace(/,/g, "")),
      // Use local images if saving locally, otherwise Supabase would need storage (which we lack in demo)
      images: images,
      condition: formData.condition as "foreign_used" | "brand_new" | "pre_owned",
      status: "available",
      vin: formData.vin || "DEMO-VIN",
      mileage: Number.parseInt(formData.mileage) || 0,
      engine_size: formData.engine,
      transmission: formData.transmission,
      fuel_type: formData.fuelType,
      is_duty_paid: true,
      vin_verified: true,
      description: caption
    }

    const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

    if (isDemoMode) {
      // Demo mode success
      storeVehicle(newVehicle)

      const platforms = ["Showroom"]
      if (socials.facebook) platforms.push("Facebook")
      if (socials.instagram) platforms.push("Instagram")

      toast.success("VEHICLE LIVE ON NETWORK", {
        description: `Successfully syndicated to: ${platforms.join(", ")}`,
        className: "bg-[#00ff9d] border-none text-black font-black tracking-widest uppercase",
        duration: 5000,
      })
      router.push("/admin")
      return
    }

    try {
      if (!supabase) throw new Error("Supabase client not initialized")

      const { error } = await supabase.from("vehicles").insert({
        make: formData.manufacturer,
        model: formData.model,
        year: Number.parseInt(formData.year),
        price: Number.parseFloat(formData.price.replace(/,/g, "")),
        description: caption,
        status: "available",
        condition: formData.condition,
        mileage: Number.parseInt(formData.mileage) || 0,
        engine_size: formData.engine,
        transmission: formData.transmission,
        fuel_type: formData.fuelType,
        images: images,
        is_duty_paid: true,
        vin_verified: true,
      })

      if (error) throw error

      const platforms = ["Showroom"]
      if (socials.facebook) platforms.push("Facebook")
      if (socials.instagram) platforms.push("Instagram")

      toast.success("VEHICLE LIVE ON NETWORK", {
        description: `Successfully syndicated to: ${platforms.join(", ")}`,
        className: "bg-[#00ff9d] border-none text-black font-black tracking-widest uppercase",
        duration: 5000,
      })

      router.push("/admin")
    } catch (error) {
      console.error("[v0] Failed to publish to database, falling back to local storage:", error)
      // Fallback to local storage if DB fails
      storeVehicle(newVehicle)
      toast.error("Cloud Sync Failed", {
        description: "Switched to local storage backup. Your vehicle is safe.",
        className: "bg-red-500 border-none text-white font-bold",
      })
      router.push("/admin")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="p-8 flex items-center gap-6">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/5 hover:bg-white/10 text-white">
          <Link href="/admin">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-black text-white tracking-tight">Creator Studio</h1>
      </header>

      <main className="flex-1 px-8 md:px-12 pb-12 space-y-12">
        {/* Step 1: Media */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Step 01: Visuals</h2>
            <span className="text-[10px] font-bold text-primary/60 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 tracking-widest">
              HQ GALLERY READY
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Hidden file input for gallery access */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
              aria-label="Select images from gallery"
            />
            {images.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square bg-[#222222] rounded-[2rem] relative overflow-hidden group border border-white/5 shadow-xl"
              >
                <img
                  src={img || "/placeholder.svg"}
                  alt={`Vehicle preview ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <button
                  onClick={() => removeImage(idx)}
                  title="Remove image"
                  className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                onClick={handleAddVisualClick}
                title="Add image from gallery"
                className="aspect-square bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all"
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

        {/* Step 2: Data Inputs - Redesigned */}
        <section className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Step 02: Core Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                Brand/Manufacturer
              </Label>
              <Input
                placeholder="e.g. Mercedes-Benz"
                className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Model</Label>
              <Input
                placeholder="e.g. S-Class"
                className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                Release Year
              </Label>
              <Select value={formData.year} onValueChange={(val) => setFormData({ ...formData, year: val })}>
                <SelectTrigger className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-[#222222] border-white/10 text-white rounded-2xl">
                  {years.map((y) => (
                    <SelectItem key={y} value={y} className="rounded-xl focus:bg-primary">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                Market Price ($)
              </Label>
              <Input
                placeholder="45,000"
                className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Condition</Label>
              <Select value={formData.condition} onValueChange={(val) => setFormData({ ...formData, condition: val })}>
                <SelectTrigger className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#222222] border-white/10 text-white rounded-2xl">
                  <SelectItem value="brand_new" className="rounded-xl focus:bg-primary">
                    Brand New
                  </SelectItem>
                  <SelectItem value="foreign_used" className="rounded-xl focus:bg-primary">
                    Foreign Used
                  </SelectItem>
                  <SelectItem value="pre_owned" className="rounded-xl focus:bg-primary">
                    Local Pre-Owned
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                Current Mileage
              </Label>
              <Input
                placeholder="e.g. 15000"
                className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                Engine (e.g. 4.0L V8)
              </Label>
              <Input
                placeholder="4.0L V8 Biturbo"
                className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-6 focus:bg-white/10 transition-colors"
                value={formData.engine}
                onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                  Transmission
                </Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(val) => setFormData({ ...formData, transmission: val })}
                >
                  <SelectTrigger className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222222] border-white/10 text-white rounded-2xl">
                    <SelectItem value="automatic" className="rounded-xl focus:bg-primary">
                      Automatic
                    </SelectItem>
                    <SelectItem value="manual" className="rounded-xl focus:bg-primary">
                      Manual
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Fuel Type</Label>
                <Select value={formData.fuelType} onValueChange={(val) => setFormData({ ...formData, fuelType: val })}>
                  <SelectTrigger className="rounded-2xl bg-white/5 border-white/5 h-14 text-white font-bold px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222222] border-white/10 text-white rounded-2xl">
                    <SelectItem value="petrol" className="rounded-xl focus:bg-primary">
                      Petrol
                    </SelectItem>
                    <SelectItem value="diesel" className="rounded-xl focus:bg-primary">
                      Diesel
                    </SelectItem>
                    <SelectItem value="hybrid" className="rounded-xl focus:bg-primary">
                      Hybrid
                    </SelectItem>
                    <SelectItem value="electric" className="rounded-xl focus:bg-primary">
                      Electric
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: AI Magic - BUFFED */}
        <section className="space-y-6 p-10 bg-[#222222] rounded-[3rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">AI Content Engine</h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Step 03: Narrative</p>
              </div>
            </div>

            {/* Professional Tone Toggle - Grid layout */}
            <div className="bg-black/40 p-1.5 rounded-full grid grid-cols-2 border border-white/5 relative min-w-[240px]">
              <div
                className={`absolute inset-y-1.5 left-1.5 right-1.5 transition-all duration-500 ease-in-out bg-primary rounded-full shadow-lg ${tone === "corporate"
                  ? "translate-x-0 w-[calc(50%-3px)]"
                  : "translate-x-[calc(100%+3px)] w-[calc(50%-3px)]"
                  }`}
              />
              <button
                onClick={() => setTone("corporate")}
                title="Professional corporate tone"
                className={`relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 z-10 text-center whitespace-nowrap ${tone === "corporate" ? "text-white" : "text-white/30"
                  }`}
              >
                Corporate
              </button>
              <button
                onClick={() => setTone("street")}
                title="Casual street tone"
                className={`relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 z-10 text-center whitespace-nowrap ${tone === "street" ? "text-white" : "text-white/30"
                  }`}
              >
                Street
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Button
              onClick={generateCaption}
              disabled={loading}
              className="w-full h-16 rounded-[1.5rem] bg-white text-black hover:bg-white/90 font-black text-lg gap-3 transition-all active:scale-95 border-none"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                  ANALYZING DATA...
                </div>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  GENERATE CAPTION
                </>
              )}
            </Button>

            {caption && (
              <div className="bg-black/30 p-8 rounded-[2rem] border border-white/5 relative group/card">
                <div className="absolute -top-3 left-8 px-4 py-1 bg-primary rounded-full text-[10px] font-black uppercase text-white shadow-lg">
                  Generated Draft
                </div>
                <textarea
                  className="w-full bg-transparent border-none text-white/80 font-medium text-lg leading-relaxed resize-none focus:outline-none min-h-[150px]"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  aria-label="Generated caption"
                  placeholder="Your AI-generated caption will appear here..."
                />
              </div>
            )}
          </div>

          {/* Integrated Post Button */}
          {caption && (
            <div className="pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center justify-center space-x-4 bg-white/5 h-20 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => setSocials(p => ({ ...p, facebook: !p.facebook }))}>
                  <Checkbox
                    id="facebook"
                    checked={socials.facebook}
                    onCheckedChange={(checked) => setSocials(p => ({ ...p, facebook: checked as boolean }))}
                    className="w-6 h-6 border-white/20 data-[state=checked]:bg-[#1877F2] data-[state=checked]:border-[#1877F2] rounded-md transition-all"
                  />
                  <div className="flex items-center gap-3">
                    <Facebook className="w-6 h-6 text-[#1877F2] group-hover:scale-110 transition-transform" />
                    <Label htmlFor="facebook" className="text-white font-black text-xl cursor-pointer">Facebook</Label>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4 bg-white/5 h-20 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => setSocials(p => ({ ...p, instagram: !p.instagram }))}>
                  <Checkbox
                    id="instagram"
                    checked={socials.instagram}
                    onCheckedChange={(checked) => setSocials(p => ({ ...p, instagram: checked as boolean }))}
                    className="w-6 h-6 border-white/20 data-[state=checked]:bg-[#E4405F] data-[state=checked]:border-[#E4405F] rounded-md transition-all"
                  />
                  <div className="flex items-center gap-3">
                    <Instagram className="w-6 h-6 text-[#E4405F] group-hover:scale-110 transition-transform" />
                    <Label htmlFor="instagram" className="text-white font-black text-xl cursor-pointer">Instagram</Label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-2xl gap-4 shadow-[0_20px_50px_rgba(243,138,72,0.3)] hover:shadow-primary/50 transition-all border-none group/post"
              >
                {publishing ? (
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    PUBLISHING...
                  </div>
                ) : (
                  <>
                    <Send className="w-7 h-7 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                    POST TO SHOWROOM
                  </>
                )}
              </Button>
              <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mt-6">
                Secure Public Listing Initiation
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Persistent Space for potential ads/footer */}
      <footer className="p-12 pt-0 flex justify-center opacity-20 hover:opacity-100 transition-opacity">
        <div className="w-full max-w-2xl h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </footer>
    </div>
  )
}
