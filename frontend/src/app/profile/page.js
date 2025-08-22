"use client"

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
  <div className="max-w-2xl w-full bg-transparent shadow-lg p-8 border border-transparent">
  <h1 className="text-4xl font-extrabold text-white mb-4 text-center">Professional Profile</h1>
  <p className="text-lg text-white mb-6 text-left">
    Welcome to my professional profile! I’m Kajal—a software engineer with a love for building, learning, and connecting.
    <br/><br/>
    I did my schooling in Haryana and graduated from IIT Bombay, Computer Science and Engineering Department, with Honors. My academic journey included core CSE projects in databases, networks, compilers, and operating systems, but I’ve always been especially fascinated by algorithm design (I’m a big fan!).
    <br/><br/>
    I’ve also explored machine learning and am keen to dive deeper. Recently, I read up on network security topics in my final semester.
    <br/><br/>
    After college, I worked for Microsoft in Bangalore as a Software Engineer. Before that, I was an SDE intern at two other companies—details are in my resume below :)
    <br/><br/>
  </p>
        <div className="space-y-4">
             <div className="w-full">
               <h2 className="text-xl font-bold text-white mb-6 text-left">Resume</h2>
               <a href="https://drive.google.com/file/d/1TeZpOFuS0fojkrbYZnWYGhpq_6-freE8/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline text-left block mb-6">View Resume (Google Drive)</a>
             </div>
        </div>
      </div>
    </div>
  )
}
