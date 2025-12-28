import Link from "next/link"
import { Car, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">Woody Motors</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Premium automotive excellence with Afro-minimalist design philosophy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black uppercase tracking-widest text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/70 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="text-white/70 hover:text-primary transition-colors text-sm">
                  Inventory
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-white/70 hover:text-primary transition-colors text-sm">
                  Book Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-white/70 hover:text-primary transition-colors text-sm font-bold border-t border-white/10 pt-2 inline-block"
                >
                  Admin Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-black uppercase tracking-widest text-sm mb-4">Services</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>Premium Oil Service</li>
              <li>Comprehensive Inspection</li>
              <li>Test Drive Sessions</li>
              <li>Major Repairs</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-black uppercase tracking-widest text-sm mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Motor Ave, City</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@woodymotors.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Woody Motors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
