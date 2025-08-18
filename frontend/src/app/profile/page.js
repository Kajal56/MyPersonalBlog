"use client"

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
  <div className="max-w-2xl w-full bg-transparent shadow-lg p-8 border border-transparent">
  <h1 className="text-4xl font-extrabold text-white mb-4 text-center">Professional Profile</h1>
  <p className="text-lg text-white mb-6 text-center">
          Here you can find my qualifications, resume, and projects. I am passionate about technology, learning, and building impactful solutions.
        </p>
        <div className="space-y-4">
          <div className="bg-transparent p-4">
            <h2 className="text-xl font-bold text-white mb-2">Qualifications</h2>
            <ul className="list-disc list-inside text-white">
              <li>Bachelor's in Computer Science</li>
              <li>Certified Web Developer</li>
              <li>Open Source Contributor</li>
            </ul>
          </div>
          <div className="bg-transparent p-4">
            <h2 className="text-xl font-bold text-white mb-2">Resume</h2>
            <a href="/resume.pdf" target="_blank" className="text-blue-400 hover:underline">Download Resume (PDF)</a>
          </div>
          <div className="bg-transparent p-4">
            <h2 className="text-xl font-bold text-white mb-2">Projects</h2>
            <ul className="list-disc list-inside text-white">
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
