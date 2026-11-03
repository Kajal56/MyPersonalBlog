import './globals.css'
import { Inter, Fraunces } from 'next/font/google'
import Navigation from '../components/Navigation'
import { AdminModeProvider } from '../components/AdminModeContext'
import MotionEffects from '../components/MotionEffects'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' })

export const metadata = {
  title: 'Life Curated',
  description: 'A personal blog to track movies, books, trips, and restaurants',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head />
      <body className="min-h-screen w-full font-sans text-gray-100 transition-colors duration-500 overflow-x-hidden" style={{background: 'linear-gradient(135deg, #000000 0%, #000000 35%, #6600CC 100%)', backgroundAttachment: 'fixed', minHeight: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)'}}>
        {/* Ambient glows behind the content */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
          <div className="animate-drift-1 absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#6600CC]/25 blur-[120px]" />
          <div className="animate-drift-2 absolute bottom-[-10%] left-[-10%] h-[24rem] w-[24rem] rounded-full bg-fuchsia-700/15 blur-[120px]" />
          <div className="animate-drift-1 absolute top-1/3 left-1/3 h-[20rem] w-[20rem] rounded-full bg-indigo-600/10 blur-[110px]" style={{ animationDelay: '-11s' }} />
        </div>
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
