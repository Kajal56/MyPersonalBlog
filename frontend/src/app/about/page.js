"use client"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-4">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-blue-100">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">About Me</h1>
        <p className="text-lg text-gray-600 mb-6 text-center">
          Hi, I'm Kajal! Welcome to my personal blog. Here you'll find my thoughts, experiences, and projects. I love movies, books, travel, and great food. I'm passionate about learning, building, and sharing.
        </p>
        <div className="text-center text-gray-500 text-sm">
          Feel free to explore the site and connect with me!
        </div>
      </div>
    </div>
  )
}
