"use client"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-10 px-4">
  <div className="max-w-2xl w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 text-center">About Me</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center">
          Hi, I'm Kajal! Welcome to my personal blog. Here you'll find my thoughts, experiences, and projects. I love movies, books, travel, and great food. I'm passionate about learning, building, and sharing.
        </p>
        <div className="text-center text-gray-500 dark:text-gray-300 text-sm mb-6">
          Feel free to explore the site and connect with me!
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <a href="https://twitter.com/" target="_blank" rel="noopener" aria-label="Twitter">
            <svg className="w-7 h-7 text-blue-400 hover:text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37c-.83.5-1.75.87-2.72 1.07A4.28 4.28 0 0 0 12 9.75c0 .34.04.67.1.99C8.09 10.6 5.13 8.94 3.16 6.5c-.37.64-.58 1.38-.58 2.17 0 1.5.77 2.83 1.94 3.61-.72-.02-1.4-.22-1.99-.55v.06c0 2.1 1.49 3.85 3.47 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.2 8.2 0 0 1-2.36.65z"/></svg>
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noopener" aria-label="Instagram">
            <svg className="w-7 h-7 text-pink-500 hover:text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
          </a>
          <a href="https://facebook.com/" target="_blank" rel="noopener" aria-label="Facebook">
            <svg className="w-7 h-7 text-blue-700 hover:text-blue-800" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>
          </a>
          <a href="https://linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn">
            <svg className="w-7 h-7 text-blue-500 hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM7.1 19H3.6V9h3.5v10zm-1.8-11.3c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm14.7 11.3h-3.5v-5.4c0-1.3-.5-2.2-1.7-2.2-1 0-1.6.7-1.9 1.4-.1.2-.1.5-.1.8V19h-3.5s.1-10 0-10h3.5v1.4c.5-.8 1.3-1.9 3.2-1.9 2.3 0 4 1.5 4 4.7V19z"/></svg>
          </a>
        </div>
      </div>
    </div>
  )
}
