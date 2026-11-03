'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAdminMode } from './AdminModeContext'
import { useSlidingHighlight } from './useSlidingHighlight'
import { isWritingPath } from './PersonalTabs'
import ThemeToggle from './ThemeToggle'

export default function Navigation() {
  const pathname = usePathname()
  const { isAdminMode, setIsAdminMode } = useAdminMode()
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Theme logic removed; always use dark theme

  const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/personal/feed', label: 'Writing' },
  { href: '/personal/movies', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
  ]

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    if (href === '/personal/feed') return isWritingPath(pathname)
    if (href === '/personal/movies') return pathname.startsWith('/personal') && !isWritingPath(pathname)
    return pathname.startsWith(href)
  }

  const navHighlight = useSlidingHighlight(pathname)

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-line bg-sunken backdrop-blur-md">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between py-4 px-6">
        <div className="flex items-center">
          <a href="/" className="font-display text-2xl font-semibold text-ink hover:text-muted transition-colors">
            Kajal Malik
          </a>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div
            ref={navHighlight.containerRef}
            {...navHighlight.containerProps}
            className="group/nav relative flex items-center gap-1 rounded-lg border border-line bg-sunken p-1"
          >
            <span
              aria-hidden="true"
              className={`absolute rounded-md accent-pill ${navHighlight.highlightClassName}`}
              style={navHighlight.highlightStyle}
            />
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                data-active={isActive(item.href)}
                {...navHighlight.itemProps}
                className={`relative z-10 rounded-md px-5 py-1.5 text-sm font-medium transition-colors duration-300 ${
                  isActive(item.href)
                    ? 'text-on-accent group-hover/nav:text-muted hover:!text-on-accent'
                    : 'text-muted hover:text-on-accent'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAdminMode && (
            <span className="text-on-accent font-semibold px-3 py-1 rounded text-sm bg-accent">
              Admin Mode
            </span>
          )}
          <button
            onClick={() => {
              if (isAdminMode) {
                setIsAdminMode(false)
              } else {
                setShowAdminModal(true)
              }
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isAdminMode
                ? 'text-on-accent shadow-lg bg-danger hover:opacity-90'
                : 'text-muted hover:text-ink hover:bg-sunken'
            }`}
          >
            {isAdminMode ? 'Exit Admin' : 'Admin'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between py-4 px-4">
        <div className="flex items-center">
          <a href="/" className="font-display text-xl font-semibold text-ink hover:text-muted transition-colors">
            Kajal Malik
          </a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAdminMode && (
            <span className="text-on-accent font-semibold px-2 py-1 rounded text-xs bg-accent">
              Admin
            </span>
          )}
          <button
            onClick={() => {
              if (isAdminMode) {
                setIsAdminMode(false)
              } else {
                setShowAdminModal(true)
              }
            }}
            className={`px-3 py-1 text-xs font-medium transition-all duration-200 ${
              isAdminMode
                ? 'text-on-accent shadow-lg bg-danger hover:opacity-90'
                : 'text-muted hover:text-ink hover:bg-sunken'
            }`}
          >
            {isAdminMode ? 'Exit' : 'Admin'}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-ink p-2 hover:text-accent-ink transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-line bg-canvas/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                className={`block rounded-md px-4 py-2.5 font-medium transition-colors ${
                  isActive(item.href) ? 'bg-accent text-on-accent' : 'text-ink hover:bg-sunken'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface shadow-lg p-6 sm:p-8 w-full max-w-sm rounded-lg border border-line">
            <h2 className="text-xl font-bold mb-4 text-ink">
              Admin Authentication
            </h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-line bg-surface bg-transparent text-ink mb-4"
            />
            {adminError && (
              <div className="text-danger mb-2 text-sm">{adminError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-sunken bg-transparent text-muted hover:bg-sunken"
                onClick={() => {
                  setShowAdminModal(false)
                  setAdminPassword('')
                  setAdminError('')
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-accent text-on-accent font-semibold hover:bg-accent"
                onClick={() => {
                  if (adminPassword === 'supsup') {
                    setIsAdminMode(true)
                    setShowAdminModal(false)
                    setAdminPassword('')
                    setAdminError('')
                  } else {
                    setAdminError('Nice Try Diddy!!')
                  }
                }}
              >
                Authenticate
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
