"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { Upload, CheckCircle2 } from "lucide-react"

export function DriverApplicationForm({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error } = await supabase.from("driver_applications").insert({
      full_name: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      license_number: formData.get("licenseNumber"),
      years_experience: Number(formData.get("experience")),
      vehicle_preference: formData.get("vehicle"),
    })

    setLoading(false)

    if (error) {
      toast.error("Failed to submit application. Please try again.")
    } else {
      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
      }, 3000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-secondary border-white/10 text-white rounded-[2.5rem]">
        {submitted ? (
          <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Application Received</h2>
            <p className="text-white/60">Our fleet manager will review your profile and reach out via WhatsApp.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                Join the Fleet
              </DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                Apply to become a professional Woody Motors fleet driver.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    required
                    className="bg-white/5 border-white/10 rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Phone (WhatsApp)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+234..."
                    required
                    className="bg-white/5 border-white/10 rounded-2xl h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="bg-white/5 border-white/10 rounded-2xl h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="licenseNumber"
                    className="text-[10px] font-black uppercase tracking-widest text-primary"
                  >
                    License Number
                  </Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    placeholder="ABC-12345"
                    required
                    className="bg-white/5 border-white/10 rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Years Exp.
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    placeholder="5"
                    required
                    className="bg-white/5 border-white/10 rounded-2xl h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle" className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Vehicle Preference
                </Label>
                <Select name="vehicle" required>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-12">
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-white/10 text-white">
                    <SelectItem value="mercedes-s-class">Mercedes S-Class (Elite)</SelectItem>
                    <SelectItem value="bmw-m5">BMW M5 (Executive)</SelectItem>
                    <SelectItem value="audi-rs7">Audi RS7 (Performance)</SelectItem>
                    <SelectItem value="lexus-es">Lexus ES (Comfort)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 border-2 border-dashed border-white/10 rounded-2xl text-center hover:border-primary/50 transition-colors cursor-pointer group">
                <Upload className="w-8 h-8 text-white/40 mx-auto mb-2 group-hover:text-primary transition-colors" />
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">
                  Upload License & ID (PDF/JPG)
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-full bg-primary text-white font-black text-lg hover:scale-[1.02] transition-transform"
              >
                {loading ? "PROCESSING..." : "SUBMIT APPLICATION"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
