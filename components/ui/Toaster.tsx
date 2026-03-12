'use client'

import { useState, useCallback, createContext, useContext } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  toast: (message: string, type?: Toast['type']) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType>({ toast: () => {} })
export const useToast = () => useContext(ToastContext)

// ─── Provider ─────────────────────────────────────────────────────────────────
// Wrap your root layout with <ToastProvider> so useToast() works everywhere.

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast renderer lives here — inside the provider so it can read state */}
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  )
}

// ─── Renderer ─────────────────────────────────────────────────────────────────
// Internal — renders the visible toast stack. Not exported for direct use.

function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl animate-fade-up min-w-[280px] ${
            t.type === 'success'
              ? 'bg-[#1c161c] border-green-400/30 text-green-400'
              : t.type === 'error'
              ? 'bg-[#1c161c] border-red-400/30 text-red-400'
              : 'bg-[#1c161c] border-electric/30 text-electric'
          }`}
        >
          <span className="text-xl">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="text-sm font-medium text-cream">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
