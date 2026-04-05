'use client'
import { useState, useCallback, createContext, useContext, useRef } from 'react'

interface ToastContextType {
  toast: (icon: string, msg: string) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

interface ToastItem {
  id: number
  icon: string
  msg: string
}

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const toast = useCallback((icon: string, msg: string) => {
    const id = Date.now() + counter.current++
    setItems(prev => [...prev.slice(-4), { id, icon, msg }])
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[200] flex flex-col gap-2 pointer-events-none"
      >
        {items.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 bg-surface2 border border-border rounded-xl text-sm font-semibold shadow-2xl animate-slideUp"
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-white">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
