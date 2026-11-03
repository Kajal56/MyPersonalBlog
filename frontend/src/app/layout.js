import './globals.css'
import { Inter, Fraunces } from 'next/font/google'
import Navigation from '../components/Navigation'
import { AdminModeProvider } from '../components/AdminModeContext'
import MotionEffects from '../components/MotionEffects'
import { themeInitScript } from '../components/ThemeToggle'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' })

export const metadata = {
  title: 'Life Curated',
  description: 'A personal blog to track movies, books, trips, and restaurants',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen w-full font-sans overflow-x-hidden" style={{ minHeight: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <MotionEffects />
        <AdminModeProvider>
          <div className="relative min-h-screen flex flex-col w-full">
            <Navigation />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-screen-xl min-h-[80vh]" style={{minHeight: '80dvh'}}>
              {children}
            </main>
          </div>
        </AdminModeProvider>
      </body>
    </html>
  );
}
