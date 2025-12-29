import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { DreamGarageFAB } from "@/components/dream-garage-fab"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Woody Motors | Premium Automotive Excellence",
  description:
    "Experience premium automotive excellence with our curated collection of luxury vehicles and world-class service. Afro-minimalist design philosophy meets automotive perfection.",
  keywords: ["luxury cars", "premium vehicles", "car service", "automotive", "car dealership", "Woody Motors"],
  authors: [{ name: "Woody Motors" }],
  generator: "v0.app",
  metadataBase: new URL("https://woodymotors.com"),
  openGraph: {
    title: "Woody Motors | Premium Automotive Excellence",
    description: "Experience premium automotive excellence with our curated collection of luxury vehicles.",
    url: "https://woodymotors.com",
    siteName: "Woody Motors",
    images: [
      {
        url: "/luxury-car-showroom.png",
        width: 1200,
        height: 630,
        alt: "Woody Motors Showroom",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Woody Motors | Premium Automotive Excellence",
    description: "Experience premium automotive excellence with our curated collection of luxury vehicles.",
    images: ["/luxury-car-showroom.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <main>{children}</main>
          <Footer />
          <Toaster />
          <DreamGarageFAB />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

