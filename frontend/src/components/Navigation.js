'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAdminMode } from './AdminModeContext'
import { useSlidingHighlight } from './useSlidingHighlight'

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
  { href: '/personal/feed', label: 'Personal' },
  { href: '/contact', label: 'Contact' },
  ]

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.split('/').slice(0, 2).join('/'))

  const navHighlight = useSlidingHighlight(pathname)

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/40 backdrop-blur-md">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between py-4 px-6">
        <div className="flex items-center">
          <a href="/" className="font-display text-2xl font-semibold text-white hover:text-purple-200 transition-colors">
            Kajal Malik
          </a>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div
            ref={navHighlight.containerRef}
            {...navHighlight.containerProps}
            className="relative flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1"
          >
            <span
              aria-hidden="true"
              className={`absolute rounded-md bg-[#6600CC] shadow-md shadow-purple-700/40 ${navHighlight.highlightClassName}`}
              style={navHighlight.highlightStyle}
            />
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                data-active={isActive(item.href)}
                {...navHighlight.itemProps}
                className={`relative z-10 rounded-md px-5 py-1.5 text-sm font-medium transition-colors duration-300 ${
                  isActive(item.href) ? 'text-white' : 'text-purple-100/80 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdminMode && (
            <span className="text-white font-semibold px-3 py-1 rounded bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg text-sm">
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
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-800 hover:bg-opacity-30'
            }`}
          >
            {isAdminMode ? 'Exit Admin' : 'Admin'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between py-4 px-4">
        <div className="flex items-center">
          <a href="/" className="font-display text-xl font-semibold text-white hover:text-purple-200 transition-colors">
            Kajal Malik
          </a>
        </div>
        <div className="flex items-center gap-2">
          {isAdminMode && (
            <span className="text-white font-semibold px-2 py-1 rounded bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg text-xs">
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
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-800 hover:bg-opacity-30'
            }`}
          >
            {isAdminMode ? 'Exit' : 'Admin'}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 hover:text-purple-300 transition-colors"
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
        <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                className={`block rounded-md px-4 py-2.5 font-medium transition-colors ${
                  isActive(item.href) ? 'bg-[#6600CC] text-white' : 'text-white hover:bg-white/5'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-[#181825] shadow-lg p-6 sm:p-8 w-full max-w-sm rounded-lg border border-blue-900">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Admin Authentication
            </h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white bg-transparent text-gray-900 dark:text-gray-100 mb-4"
            />
            {adminError && (
              <div className="text-red-500 mb-2 text-sm">{adminError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                onClick={() => {
                  setShowAdminModal(false)
                  setAdminPassword('')
                  setAdminError('')
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700"
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
