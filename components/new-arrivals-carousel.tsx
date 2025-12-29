"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { getStoredVehicles, type Vehicle } from "@/lib/local-storage"
import { DEMO_VEHICLES } from "@/lib/demo-data"

export function NewArrivalsCarousel({ vehicles }: { vehicles: Vehicle[] }) {
  // Use demo vehicles if no real data available
  const [displayVehicles, setDisplayVehicles] = React.useState<Vehicle[]>(vehicles)

  // Hydrate from localStorage if no DB vehicles are passed
  React.useEffect(() => {
    if (vehicles.length === 0) {
      const stored = getStoredVehicles()
      setDisplayVehicles(stored.length > 0 ? stored : DEMO_VEHICLES)
    } else {
      setDisplayVehicles(vehicles)
    }
  }, [vehicles])

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true }, [
    Autoplay({ delay: 2000, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
  }, [emblaApi, onSelect])

  return (
    <section className="bg-secondary py-32 overflow-hidden">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-black tracking-tighter text-lg">
                {String(selectedIndex + 1).padStart(2, "0")} / {String(displayVehicles.length).padStart(2, "0")}
              </span>
              <div className="h-px w-20 bg-primary/30" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase">
              New Arrivals. <br />
              <span className="text-primary">Uncluttered.</span>
            </h2>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="rounded-full w-16 h-16 border-2 border-white/10 text-white hover:bg-white/10 hover:border-white transition-all bg-transparent"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="rounded-full w-16 h-16 border-2 border-white/10 text-white hover:bg-white/10 hover:border-white transition-all bg-transparent"
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex gap-8">
            {displayVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="embla__slide flex-[0_0_80%] md:flex-[0_0_42%] lg:flex-[0_0_32%] min-w-0 relative group"
              >
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white/5 relative shadow-2xl">
                  <Link href={`/inventory/${vehicle.id}`} className="absolute inset-0 z-0">
                    <img
                      src={vehicle.images?.[0] || "/placeholder.svg"}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-90" />

                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex justify-between items-end gap-4">
                      <div>
                        <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
                          {vehicle.condition === "brand_new"
                            ? "Brand New"
                            : vehicle.condition === "foreign_used"
                              ? "Foreign Used"
                              : "Local Pre-Owned"}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-white/60 font-bold mt-2 text-lg">{vehicle.year}</p>
                      </div>
                      <Button
                        asChild
                        size="icon"
                        className="rounded-full w-14 h-14 bg-primary text-white hover:scale-110 transition-transform"
                      >
                        <Link href={`/inventory/${vehicle.id}`}>
                          <ArrowUpRight className="w-6 h-6" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
