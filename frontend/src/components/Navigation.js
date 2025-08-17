
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.remove('dark', 'light')
      document.body.classList.add(theme)
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
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAdminMode
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {isAdminMode ? 'Exit Admin' : 'Admin Mode'}
            </button>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
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
