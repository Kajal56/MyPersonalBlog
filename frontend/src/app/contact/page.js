"use client"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-10 px-4">
      <div className="max-w-2xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-blue-100 dark:border-gray-800">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 text-center">Contact Me</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center">
          Connect with me on social media or send a message below!
        </p>
        <div className="flex justify-center gap-6 mb-8">
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-400 text-2xl">🐦</a>
          <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600 text-2xl">💼</a>
          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-600 text-2xl">📸</a>
          <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 text-2xl">📘</a>
        </div>
        <form className="space-y-4">
          <input type="text" placeholder="Your Name" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900" />
          <input type="email" placeholder="Your Email" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900" />
          <textarea placeholder="Your Message" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900" rows={4} />
          <button type="submit" className="w-full bg-blue-600 dark:bg-blue-800 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors">Send Message</button>
        </form>
      </div>
    </div>
  )
}
