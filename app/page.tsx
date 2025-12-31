import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, ShieldCheck, Zap, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { NewArrivalsCarousel } from "@/components/new-arrivals-carousel"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { DriverApplicationForm } from "@/components/driver-application-form"

async function getNewArrivals() {
  // Return empty array if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
  const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false }).limit(6)
  return data || []
}

export default async function HomePage() {
  const newArrivals = await getNewArrivals()

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/luxury-car-showroom.png"
            alt="Woody Motors Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="container relative z-10 px-6 text-center">
          <span className="inline-block bg-white text-secondary text-xs px-5 py-2 rounded-full uppercase font-bold tracking-wider mb-8">
            Premium Automotive Excellence
          </span>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-12 tracking-tight leading-[0.85]">
            THE NEW <br />
            <span className="text-primary">STANDARD.</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="group h-14 px-8 rounded-full text-base font-bold bg-white text-secondary hover:bg-gray-100 shadow-xl transition-all"
            >
              <Link href="/inventory" className="flex items-center gap-2">
                View Showroom <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="group h-14 px-8 rounded-full text-base font-bold bg-transparent border-2 border-white text-white hover:bg-white hover:text-secondary transition-all"
            >
              <Link href="/bookings" className="flex items-center gap-2">
                <Play className="w-5 h-5 fill-current group-hover:scale-125 transition-transform" /> Book Service
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Scroll</span>
          <div className="w-px h-8 bg-white/30" />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white rounded-t-[4rem] -mt-20 relative z-20">
        <div className="container px-6 mx-auto">
          <div className="max-w-3xl mb-16 animate-[fadeInUp_0.6s_ease_forwards]">
            <h2 className="text-4xl md:text-5xl font-black text-secondary leading-tight">
              Crafting a <span className="text-primary">frictionless</span> automotive journey.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Car,
                title: "Curated Inventory",
                desc: "Hand-selected brand new and foreign used luxury vehicles.",
                color: "bg-primary/10",
                delay: "0.1s",
              },
              {
                icon: ShieldCheck,
                title: "Verified VIN",
                desc: "Every vehicle is duty paid and transparency verified.",
                color: "bg-blue-500/10",
                delay: "0.2s",
              },
              {
                icon: Zap,
                title: "Smart Lube",
                desc: "AI-driven maintenance tracking for peak performance.",
                color: "bg-amber-500/10",
                delay: "0.3s",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-[3rem] bg-secondary/5 hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-secondary/5 opacity-0 animate-[fadeInUp_0.6s_ease_forwards]"
                style={{ animationDelay: feature.delay }}
              >
                <div
                  className={`${feature.color} w-16 h-16 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-black text-secondary mb-4">{feature.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewArrivalsCarousel vehicles={newArrivals} />

      {/* Updated Uber Service Section */}
      <section className="bg-secondary py-24 text-white rounded-b-[4rem]">
        <div className="container px-6 mx-auto text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <Badge className="bg-primary/20 text-primary border-none text-xs px-4 py-1 rounded-full uppercase font-black tracking-widest mb-6">
              Elite Fleet Solutions
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase italic">
              Woody <span className="text-primary">Uber</span> Fleet.
            </h2>
            <p className="text-white/60 font-medium text-lg">
              Premium branded vehicles ready for professional service. Apply to join the elite fleet below.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-white/5 overflow-hidden group relative">
                <img
                  src={`/luxury-car-shot-.jpg?height=600&width=450&query=branded+uber+luxury+car+${i}`}
                  alt="Woody Uber Fleet"
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-secondary/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-700 flex flex-col items-center justify-center p-6 text-center">
                  <h4 className="text-primary font-black text-xl mb-4 tracking-tighter uppercase italic">
                    Ready to Drive?
                  </h4>
                  <DriverApplicationForm
                    trigger={
                      <Button className="rounded-full bg-primary text-white font-black px-8 py-6 text-lg hover:scale-110 transition-transform shadow-2xl shadow-primary/20">
                        APPLY FOR FLEET
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
