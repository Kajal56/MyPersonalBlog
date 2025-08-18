
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
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/personal', label: 'Personal' },
    { href: '/about', label: 'About' },
    { href: '/profile', label: 'Professional' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">
            My Blog
          </Link>
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
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
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {isAdminMode ? 'Exit Admin' : 'Admin Mode'}
            </button>
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 shadow-lg p-8 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Admin Authentication</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-4"
            />
            {adminError && <div className="text-red-500 mb-2 text-sm">{adminError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                onClick={() => {
                  setShowAdminModal(false)
                  setAdminPassword('')
                  setAdminError('')
                }}
              >Cancel</button>
              <button
                className="px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700"
                onClick={() => {
                  if (adminPassword === 'kajal') {
                    setIsAdminMode(true)
                    setShowAdminModal(false)
                    setAdminPassword('')
                    setAdminError('')
                  } else {
                    setAdminError("Nice Try Diddy!!")
                  }
                }}
              >Authenticate</button>
            </div>
          </div>
        </div>
      )}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-4 py-2 text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
