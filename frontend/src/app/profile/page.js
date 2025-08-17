"use client"

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-4">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-blue-100">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">Professional Profile</h1>
        <p className="text-lg text-gray-600 mb-6 text-center">
          Here you can find my qualifications, resume, and projects. I am passionate about technology, learning, and building impactful solutions.
        </p>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Qualifications</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>Bachelor's in Computer Science</li>
              <li>Certified Web Developer</li>
              <li>Open Source Contributor</li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Resume</h2>
            <a href="/resume.pdf" target="_blank" className="text-blue-600 hover:underline">Download Resume (PDF)</a>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Projects</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>Personal Blog Platform</li>
              <li>Movie Review App</li>
              <li>Travel Diary Website</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
