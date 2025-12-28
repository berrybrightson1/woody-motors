import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Home } from "lucide-react"

export default function BookingSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/5 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden p-8 text-center bg-white">
        <CardHeader>
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-20 w-20 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-secondary">Appointment Requested</CardTitle>
          <CardDescription className="text-lg">
            Your booking request has been received. Our concierge will contact you shortly to confirm the session.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6 flex flex-col gap-4">
          <Button asChild className="w-full h-12 rounded-xl text-lg font-semibold">
            <Link href="/">Return to Homepage</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full h-12 rounded-xl text-lg font-semibold border-2 border-primary text-primary bg-transparent"
          >
            <Link href="/inventory">
              <Home className="mr-2 h-5 w-5" />
              View Inventory
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
