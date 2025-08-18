"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminMode } from './AdminModeContext'

const allTabs = [
  { href: '/personal/movies', label: 'Movies' },
  { href: '/personal/books', label: 'Books' },
  { href: '/personal/trips', label: 'Trips' },
  { href: '/personal/restaurants', label: 'Restaurants', adminOnly: true },
  { href: '/personal/flats', label: 'Flats', adminOnly: true },
  { href: '/personal/feed', label: 'Feed' },
]

export default function PersonalTabs() {
  const pathname = usePathname()
  const { isAdminMode } = useAdminMode();
  const tabs = allTabs.filter(tab => !tab.adminOnly || isAdminMode);
  return (
    <nav className="relative z-10 flex justify-center" style={{ marginTop: '-2.5rem', marginBottom: '2.5rem' }}>
  <div className="bg-transparent shadow-lg border border-transparent px-2 py-2 flex gap-2 md:gap-4" style={{ minWidth: 'fit-content', maxWidth: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200
              ${pathname === tab.href
                ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white shadow'
                : 'bg-gray-100 text-gray-700 bg-transparent dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900'}
            `}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
