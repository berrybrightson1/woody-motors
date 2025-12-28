import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Car, Wrench, Users, Award } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-secondary text-white py-24 px-4 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/luxury-car-showroom.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary to-secondary" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Badge className="bg-primary/20 text-white border-none text-sm px-4 py-2 rounded-full uppercase font-black tracking-widest mb-6">
            About Us
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-balance">
            Premium Automotive Excellence Since Day One
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto text-pretty leading-relaxed">
            Woody Motors combines Afro-minimalist design philosophy with world-class automotive service to deliver an
            unmatched customer experience.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-4xl font-black text-secondary mb-6">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              Founded with a vision to revolutionize the automotive industry, Woody Motors brings together premium
              vehicle selection, expert maintenance services, and a customer-first philosophy.
            </p>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              We believe in transparency, quality, and building lasting relationships with every client who walks
              through our doors.
            </p>
            <Button asChild className="rounded-xl h-12 px-6 text-lg font-semibold mt-4">
              <Link href="/inventory">Explore Our Collection</Link>
            </Button>
          </div>
          <div className="bg-muted rounded-3xl overflow-hidden aspect-square">
            <img src="/luxury-car-showroom.png" alt="Woody Motors Showroom" className="object-cover w-full h-full" />
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-4xl font-black text-secondary mb-12 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden text-center p-8">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-secondary mb-2">Premium Quality</CardTitle>
              <CardDescription>Hand-selected vehicles that meet the highest standards</CardDescription>
            </Card>

            <Card className="border-none shadow-xl rounded-3xl overflow-hidden text-center p-8">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-secondary mb-2">Expert Service</CardTitle>
              <CardDescription>Factory-trained technicians with decades of experience</CardDescription>
            </Card>

            <Card className="border-none shadow-xl rounded-3xl overflow-hidden text-center p-8">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-secondary mb-2">Customer First</CardTitle>
              <CardDescription>Your satisfaction is our top priority, always</CardDescription>
            </Card>

            <Card className="border-none shadow-xl rounded-3xl overflow-hidden text-center p-8">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-secondary mb-2">Trusted Excellence</CardTitle>
              <CardDescription>Award-winning service recognized industry-wide</CardDescription>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Visit our showroom or schedule your service appointment today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-2xl h-14 px-8 text-lg font-bold bg-white text-primary hover:bg-white/90"
              >
                <Link href="/inventory">Browse Vehicles</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-2xl h-14 px-8 text-lg font-bold border-2 border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/bookings">Schedule Service</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
