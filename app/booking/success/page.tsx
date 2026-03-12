import Link from 'next/link'

export default function BookingSuccessPage() {
  return (
    <main className="min-h-screen bg-[#0a060a] flex flex-col items-center justify-center text-center px-6">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-electric/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg">
        <div className="text-7xl mb-8">✨</div>

        <h1 className="font-playfair text-5xl font-black mb-4">
          You&apos;re all set!
        </h1>

        <p className="text-[#b8b0a8] text-base leading-relaxed mb-10">
          Your booking is confirmed. The artist has been notified and will
          reach out with any details. Check your dashboard to track your booking status.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-full bg-gradient-electric text-white font-semibold uppercase tracking-wider text-sm shadow-[0_4px_20px_rgba(255,77,141,0.3)] hover:shadow-[0_8px_30px_rgba(255,77,141,0.45)] hover:-translate-y-px transition-all"
          >
            View Dashboard
          </Link>
          <Link
            href="/artists"
            className="px-8 py-3.5 rounded-full border border-white/20 text-cream font-semibold uppercase tracking-wider text-sm hover:border-electric transition-colors"
          >
            Browse More Artists
          </Link>
        </div>
      </div>
    </main>
  )
}
