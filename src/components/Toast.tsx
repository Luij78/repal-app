'use client'

import { useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'success', onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: 'bg-green-500/90 border-green-400',
    error: 'bg-red-500/90 border-red-400',
    info: 'bg-blue-500/90 border-blue-400'
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }

  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg z-50 animate-fade-in border shadow-lg flex items-center gap-2`}>
      <span className="text-lg font-bold">{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}
