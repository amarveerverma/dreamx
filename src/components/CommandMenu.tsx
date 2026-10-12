'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchItem {
  id: string | number
  slug?: string
  title: string
  subtitle?: string
  price?: number
  rating?: number
  category?: string
  avatarUrl?: string
  type: 'mentor' | 'service' | 'action'
  url?: string
}

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mentors, setMentors] = useState<SearchItem[]>([])
  const [services, setServices] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    const handleCustomOpen = () => setOpen(true)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-command-menu', handleCustomOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-command-menu', handleCustomOpen)
    }
  }, [open])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      fetchSearchResults('')
    } else {
      setQuery('')
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      fetchSearchResults(query)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, open])

  const fetchSearchResults = async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/search/mentors?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setMentors(data.mentors || [])
        setServices(data.services || [])
        setSelectedIndex(0)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (item: SearchItem) => {
    setOpen(false)
    if (item.type === 'mentor') {
      router.push(`/mentors/${item.slug}`)
    } else if (item.type === 'service') {
      router.push(`/services/${item.slug}`)
    } else if (item.url) {
      router.push(item.url)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop Click to Close */}
      <div className="fixed inset-0" onClick={() => setOpen(false)} />

      {/* Dialog Modal Card */}
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Top Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-container">
          <span className="material-symbols-outlined text-[22px] text-primary">search</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-on-surface text-base placeholder:text-on-surface-variant/60 focus:outline-none"
            placeholder="Search mentors (e.g. 'Google', 'AI/ML'), services, or goals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-mono font-semibold">
            ESC
          </span>
        </div>

        {/* Scrollable Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8 text-on-surface-variant text-sm gap-2">
              <span className="material-symbols-outlined text-primary text-[20px] animate-spin">progress_activity</span>
              <span>Scanning mentor network & services...</span>
            </div>
          )}

          {/* Group 1: Mentors */}
          {mentors.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                Mentors & Practitioners
              </div>
              <div className="space-y-1">
                {mentors.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.title}
                          className="w-10 h-10 rounded-xl object-cover border border-surface-container-high"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold">
                          {item.title[0]}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-title-md text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-on-surface-variant truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {item.rating && (
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          {item.rating}
                        </span>
                      )}
                      {item.price && (
                        <span className="text-xs font-bold text-on-surface">
                          ₹{item.price}
                        </span>
                      )}
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Services */}
          {services.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-secondary">
                Standardized Services
              </div>
              <div className="space-y-1">
                {services.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-secondary-fixed/40 text-on-secondary-fixed flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </div>
                      <div className="truncate">
                        <div className="font-title-md text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-on-surface-variant truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {item.price && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface">
                          From ₹{item.price}
                        </span>
                      )}
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Quick Navigation */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Quick Shortcuts
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <Link
                href="/mentors"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container text-xs text-on-surface font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
                <span>Browse All 412+ Mentors</span>
              </Link>
              <Link
                href="/services"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container text-xs text-on-surface font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">category</span>
                <span>10 Standard Services</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2 bg-surface-container-low border-t border-surface-container flex items-center justify-between text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-surface-container font-mono">↑</kbd>
              <kbd className="px-1 rounded bg-surface-container font-mono">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 rounded bg-surface-container font-mono">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <span>CM-IN Zero-Trust Escrow Protected</span>
        </div>
      </div>
    </div>
  )
}
