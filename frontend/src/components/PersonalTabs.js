"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminMode } from './AdminModeContext'
import { useSlidingHighlight } from './useSlidingHighlight'

const allTabs = [
  { href: '/personal/feed', label: 'Thoughts' },
  { href: '/personal/movies', label: 'Movies' },
  { href: '/personal/books', label: 'Books' },
  { href: '/personal/trips', label: 'Trips' },
  { href: '/personal/upsc-notes', label: 'UPSC Notes' },
  { href: '/personal/restaurants', label: 'Restaurants', adminOnly: true },
  { href: '/personal/flats', label: 'Flats', adminOnly: true },
]

export default function PersonalTabs() {
  const pathname = usePathname()
  const { isAdminMode } = useAdminMode();
  // Only show adminOnly tabs if isAdminMode is true
  const tabs = allTabs.filter(tab => !tab.adminOnly || isAdminMode);
  const highlight = useSlidingHighlight(`${pathname}|${tabs.length}`);
  // Detail pages (e.g. a single movie) don't show the tab bar
  if (!allTabs.some(tab => tab.href === pathname)) return null;
  return (
    <nav className="relative z-10 flex justify-center overflow-x-auto" style={{ marginTop: '-1rem', marginBottom: '2.5rem' }}>
      <div
        ref={highlight.containerRef}
        {...highlight.containerProps}
        className="relative flex gap-1 min-w-max rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-sm"
      >
        <span
          aria-hidden="true"
          className={`absolute rounded-md bg-[#6600CC] shadow-md shadow-purple-700/40 ${highlight.highlightClassName}`}
          style={highlight.highlightStyle}
        />
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            data-active={pathname === tab.href}
            {...highlight.itemProps}
            className={`relative z-10 px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-colors duration-300 rounded-md whitespace-nowrap
              ${pathname === tab.href
                ? 'text-white'
                : 'text-purple-100/80 hover:text-white'}
            `}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
