'use client'

import { useState, useRef, useEffect } from 'react'

interface CalendarPickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
}

export default function CalendarPicker({ value, onChange, placeholder = 'Select date', className = '' }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && calendarRef.current && containerRef.current) {
      const calendar = calendarRef.current
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const calendarHeight = 340
      const calendarWidth = 300
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      calendar.style.top = '100%'
      calendar.style.bottom = 'auto'
      calendar.style.left = '0'
      calendar.style.right = 'auto'

      if (rect.bottom + calendarHeight > viewportHeight - 20) {
        calendar.style.top = 'auto'
        calendar.style.bottom = '100%'
        calendar.style.marginBottom = '4px'
        calendar.style.marginTop = '0'
      } else {
        calendar.style.marginTop = '4px'
        calendar.style.marginBottom = '0'
      }

      if (rect.left + calendarWidth > viewportWidth - 20) {
        calendar.style.left = 'auto'
        calendar.style.right = '0'
      }
    }
  }, [isOpen])

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear()
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    onChange(`${year}-${month}-${dayStr}`)
    setIsOpen(false)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)
  const days = []
  
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} style={{ width: '36px', height: '36px' }} />)
  }
  
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isSelected = dateStr === value
    const isToday = dateStr === todayStr
    
    days.push(
      <button
        key={day}
        type="button"
        onClick={() => handleDateClick(day)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          fontSize: '0.875rem',
          fontWeight: isSelected ? 700 : 500,
          color: isSelected ? '#0d0d0d' : isToday ? '#D4AF55' : '#e5e5e5',
          cursor: 'pointer',
          transition: 'all 0.2s',
          border: isToday && !isSelected ? '1px solid rgba(212, 175, 85, 0.4)' : 'none',
          background: isSelected 
            ? 'linear-gradient(135deg, #D4AF55 0%, #B8962E 100%)' 
            : isToday 
              ? 'rgba(212, 175, 85, 0.15)' 
              : 'transparent',
          boxShadow: isSelected ? '0 4px 15px -3px rgba(212, 175, 85, 0.5)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'rgba(212, 175, 85, 0.15)'
            e.currentTarget.style.color = '#D4AF55'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = isToday ? 'rgba(212, 175, 85, 0.15)' : 'transparent'
            e.currentTarget.style.color = isToday ? '#D4AF55' : '#e5e5e5'
          }
        }}
      >
        {day}
      </button>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.625rem 0.75rem',
          background: '#0d0d0d',
          border: '1px solid #2a2a2a',
          borderRadius: '0.5rem',
          color: value ? '#fff' : '#6b7280',
          fontSize: '0.875rem',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(212, 175, 85, 0.5)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
      >
        <span>{value ? formatDisplayDate(value) : placeholder}</span>
        <svg style={{ width: '20px', height: '20px', color: '#D4AF55' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div 
          ref={calendarRef}
          style={{ 
            position: 'absolute',
            zIndex: 50,
            marginTop: '4px',
            padding: '1rem',
            width: '300px',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.98) 0%, rgba(18, 18, 18, 0.98) 100%)',
            border: '1px solid rgba(212, 175, 85, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 85, 0.1)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={prevMonth}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                color: '#D4AF55',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 85, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ‹
            </button>
            <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                color: '#D4AF55',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 85, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ›
            </button>
          </div>

          {/* Day names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '0.5rem' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} style={{ 
                width: '36px', 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.7rem', 
                fontWeight: 600, 
                color: '#D4AF55',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days}
          </div>

          {/* Quick actions */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(212, 175, 85, 0.15)', display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                onChange(todayStr)
                setIsOpen(false)
              }}
              style={{ 
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#D4AF55',
                background: 'rgba(212, 175, 85, 0.15)',
                border: '1px solid rgba(212, 175, 85, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 85, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(212, 175, 85, 0.15)'}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('')
                setIsOpen(false)
              }}
              style={{ 
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#888',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#888' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
