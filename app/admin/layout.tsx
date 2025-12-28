import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Woody Motors | Admin Studio",
  description: "Manage your premium vehicle inventory",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 md:py-12">
        {children}
      </div>
    </div>
  )
}
