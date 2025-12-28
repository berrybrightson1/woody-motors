import { Suspense } from "react"
import BookingForm from "./booking-form"

export default function TestDrivePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] py-16 px-4">
      <Suspense fallback={null}>
        <BookingForm />
      </Suspense>
    </div>
  )
}
