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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AdminModeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </AdminModeProvider>
      </body>
    </html>
  )
}
