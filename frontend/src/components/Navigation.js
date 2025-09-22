'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAdminMode } from './AdminModeContext'

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
  { href: '/profile', label: 'Professional' },
  { href: '/personal', label: 'Personal' },
  { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="w-full bg-transparent">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between py-4 px-6">
        <div className="flex items-center">
          <a href="/" className="text-white font-bold text-xl hover:text-purple-300 transition-colors">
            Kajal Malik
          </a>
        </div>
        <div className="flex-1 flex items-center justify-center gap-6">
          <a
            href="/"
            className="text-white font-semibold hover:text-purple-300 transition-colors"
          >
            Home
          </a>
          <a
            href="/about"
            className="text-white font-semibold hover:text-purple-300 transition-colors"
          >
            About
          </a>
          <a
            href="/profile"
            className="text-white font-semibold hover:text-purple-300 transition-colors"
          >
            Professional
          </a>
          <a
            href="/personal"
            className="text-white font-semibold hover:text-purple-300 transition-colors"
          >
            Personal
          </a>
          <a
            href="/contact"
            className="text-white font-semibold hover:text-purple-300 transition-colors"
          >
            Contact
          </a>
        </div>
        <div className="flex items-center gap-2">
          {isAdminMode && (
            <span className="text-white font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg text-sm">
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
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
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
          <a href="/" className="text-white font-bold text-lg hover:text-purple-300 transition-colors">
            Kajal Malik
          </a>
        </div>
        <div className="flex items-center gap-2">
          {isAdminMode && (
            <span className="text-white font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg text-xs">
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
        <div className="md:hidden bg-black bg-opacity-95 border-t border-purple-900">
          <div className="px-4 py-2 space-y-2">
            <a
              href="/"
              className="block text-white font-semibold py-2 hover:text-purple-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="/about"
              className="block text-white font-semibold py-2 hover:text-purple-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="/profile"
              className="block text-white font-semibold py-2 hover:text-purple-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Professional
            </a>
            <a
              href="/personal"
              className="block text-white font-semibold py-2 hover:text-purple-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Personal
            </a>
            <a
              href="/contact"
              className="block text-white font-semibold py-2 hover:text-purple-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
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
