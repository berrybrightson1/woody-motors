import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Car } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
            <div className="text-center space-y-8 max-w-2xl">
                <div className="relative">
                    <h1 className="text-[12rem] font-black text-black/5 leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Car className="w-32 h-32 text-primary animate-pulse" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-secondary uppercase tracking-tighter">
                        Off Roading?
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        The page you are looking for seems to have taken a wrong turn. Let's get you back to the showroom.
                    </p>
                </div>

                <div className="flex justify-center gap-4">
                    <Button asChild size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold">
                        <Link href="/">
                            Drive Back Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold">
                        <Link href="/inventory">
                            View Inventory
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
