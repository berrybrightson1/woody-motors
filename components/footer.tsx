import Link from "next/link"
import { Car, Mail, Phone, MapPin, Globe } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary text-white relative z-10 overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 py-12 md:py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">Woody Motors</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Premium automotive excellence with Afro-minimalist design philosophy. Delivering quality since 2024.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black uppercase tracking-widest text-xs text-white/40 mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { label: "Home", href: "/" },
                { label: "Showroom", href: "/inventory" },
                { label: "Spare Parts", href: "/parts" },
                { label: "Services", href: "/bookings" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white hover:translate-x-1 transition-all text-sm font-bold block py-1">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin"
                  className="text-white/70 hover:text-white hover:translate-x-1 transition-all text-sm font-bold pt-2 block py-1"
                >
                  Admin Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-black uppercase tracking-widest text-xs text-white/40 mb-6">Services</h3>
            <ul className="space-y-3 text-white/70 text-sm font-medium">
              <li className="py-1">Premium Oil Service</li>
              <li className="py-1">Comprehensive Inspection</li>
              <li className="py-1">Test Drive Sessions</li>
              <li className="py-1">Global Import/Export</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-black uppercase tracking-widest text-xs text-white/40 mb-6">Contact</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-white/80 text-sm">
                <div className="p-2 bg-white/5 rounded-xl shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white">Main Showroom</span>
                  <span className="text-white/60">Osu Labone, Accra, Ghana</span>
                </div>
              </li>
              <li className="flex items-center gap-4 text-white/80 text-sm">
                <div className="p-2 bg-white/5 rounded-xl shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <a href="tel:0209639823" className="hover:text-primary transition-colors font-bold tracking-wide">
                  020 963 9823
                </a>
              </li>
              <li className="flex items-center gap-4 text-white/80 text-sm">
                <div className="p-2 bg-white/5 rounded-xl shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <a href="mailto:info@woodymotors.com" className="hover:text-primary transition-colors font-medium">
                  info@woodymotors.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-white/40 text-xs">
          <p>&copy; {new Date().getFullYear()} Woody Motors. All rights reserved.</p>
          <div className="flex gap-6 font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
