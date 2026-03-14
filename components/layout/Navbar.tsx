'use client'
// @ts-nocheck

import { useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useCart } from '@/components/providers/CartProvider'
import { ShoppingBag, User, LogOut, ChevronDown } from 'lucide-react'

export function Navbar() {
  const { user, profile, signOut } = useSupabase()
  const itemCount = useCart((s) => s.itemCount)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-4 bg-black/85 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Logo */}
      <Link href="/" className="font-playfair text-3xl font-black tracking-tight text-gradient-electric">
        glam<span className="italic">.</span>co
      </Link>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-9">
        {[
          ['Feed', '/feed'],
          ['Find Artists', '/artists'],
          ['Shop', '/shop'],
        ].map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-xs font-semibold uppercase tracking-widest text-[#b8b0a8] hover:text-cream transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Cart */}
            <Link href="/shop/cart" className="relative p-2">
              <ShoppingBag size={20} className="text-[#b8b0a8] hover:text-cream transition-colors" />
              {itemCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-electric rounded-full text-[10px] font-bold flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wider text-cream hover:border-electric transition-colors"
              >
                <User size={14} />
                {profile?.full_name?.split(' ')[0] ?? 'Account'}
                <ChevronDown size={12} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card-bg rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                  <Link href="/dashboard" className="block px-5 py-3 text-sm text-[#b8b0a8] hover:text-cream hover:bg-white/5 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dashboard" className="block px-5 py-3 text-sm text-[#b8b0a8] hover:text-cream hover:bg-white/5 transition-colors">
                    My Bookings
                  </Link>
                  <Link href="/dashboard" className="block px-5 py-3 text-sm text-[#b8b0a8] hover:text-cream hover:bg-white/5 transition-colors">
                    Orders
                  </Link>
                  <div className="border-t border-white/10" />
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-5 py-3 text-sm text-[#b8b0a8] hover:text-electric hover:bg-white/5 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="px-5 py-2 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wider text-cream hover:border-electric hover:text-electric transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 rounded-full bg-gradient-electric text-white text-xs font-semibold uppercase tracking-wider shadow-[0_4px_20px_rgba(255,77,141,0.3)] hover:shadow-[0_8px_30px_rgba(255,77,141,0.45)] hover:-translate-y-px transition-all"
            >
              Join Free
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
