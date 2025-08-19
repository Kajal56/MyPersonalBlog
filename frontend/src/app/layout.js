import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '../components/Navigation'
import { AdminModeProvider } from '../components/AdminModeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My Personal Blog',
  description: 'A personal blog to track movies, books, trips, and restaurants',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen w-full text-gray-100 transition-colors duration-500 overflow-x-hidden" style={{background: 'linear-gradient(135deg, #000000 0%, #000000 35%, #6600CC 100%)'}}>
        <AdminModeProvider>
          <div className="min-h-screen flex flex-col w-full">
            <Navigation />
            <main className="container mx-auto px-4 py-8 w-full min-h-screen" style={{minHeight: '100vh'}}>
              {children}
            </main>
          </div>
        </AdminModeProvider>
      </body>
    </html>
  );
}
