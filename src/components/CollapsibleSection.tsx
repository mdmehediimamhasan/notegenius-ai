'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  icon?: ReactNode
  defaultExpanded?: boolean
  badge?: string
  children: ReactNode
  className?: string
  headerClassName?: string
}

export default function CollapsibleSection({
  title,
  icon,
  defaultExpanded = true,
  badge,
  children,
  className = '',
  headerClassName = '',
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        setContentHeight(contentRef.current.scrollHeight)
        // After animation, set to auto to handle dynamic content
        const timer = setTimeout(() => setContentHeight('auto'), 300)
        return () => clearTimeout(timer)
      } else {
        // Set explicit height first for smooth collapse
        setContentHeight(contentRef.current.scrollHeight)
        requestAnimationFrame(() => {
          setContentHeight(0)
        })
      }
    }
  }, [isExpanded])

  return (
    <div className={`rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl overflow-hidden transition-all ${className}`}>
      {/* Clickable Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-5 sm:p-6 cursor-pointer select-none group transition-all hover:bg-white/[0.02] ${headerClassName}`}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-violet-400 shrink-0">{icon}</span>}
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-slate-500 group-hover:text-slate-300 transition-all duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        ref={contentRef}
        style={{
          height: typeof contentHeight === 'number' ? `${contentHeight}px` : contentHeight,
          overflow: isExpanded && contentHeight === 'auto' ? 'visible' : 'hidden',
        }}
        className="transition-[height] duration-300 ease-in-out"
      >
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-white/[0.04]">
          {children}
        </div>
      </div>
    </div>
  )
}
