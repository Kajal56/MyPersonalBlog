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
  // Only show adminOnly tabs if isAdminMode is true
  const tabs = allTabs.filter(tab => !tab.adminOnly || isAdminMode);
  return (
    <nav className="relative z-10 flex justify-center overflow-x-auto" style={{ marginTop: '-2.5rem', marginBottom: '2.5rem' }}>
      <div className="bg-transparent shadow-lg border border-transparent px-2 py-2 flex gap-1 sm:gap-2 md:gap-4 min-w-max" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 rounded whitespace-nowrap
              ${pathname === tab.href
                ? 'bg-[#6600CC] text-white dark:bg-[#6600CC] dark:text-white shadow'
                : 'bg-transparent text-gray-200 hover:bg-[#7D2AE8] hover:text-white'}
            `}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
