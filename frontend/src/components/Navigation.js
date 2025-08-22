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
  // Theme logic removed; always use dark theme

  const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/profile', label: 'Professional' },
  { href: '/personal', label: 'Personal' },
  { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="w-full flex items-center justify-between py-4 px-6 bg-transparent">
      <div className="flex items-center gap-6">
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
      <div className="flex items-center justify-end min-w-[120px]">
        {isAdminMode && (
          <span className="text-white font-semibold ml-4 px-3 py-1 rounded bg-blue-700 shadow-lg">
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
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            isAdminMode
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
              : 'bg-gray-100 bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {isAdminMode ? 'Exit Admin' : 'Admin Mode'}
        </button>
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-[#181825] shadow-lg p-8 w-full max-w-sm rounded-lg border border-blue-900">
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
        {/* Theme toggle removed; always dark mode */}
      </div>
    </nav>
  )
}
