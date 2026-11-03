"use client"

import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <h1 className="page-title text-4xl sm:text-5xl mb-3 text-center animate-fade-up">About Me</h1>
        <p className="mb-10 text-center text-purple-200/80 animate-fade-up" style={{ '--i': 1 }}>
          Software engineer by day, Kathak dancer at heart.
        </p>

        <section className="glass-card animate-fade-up p-6 sm:p-8 mb-6" style={{ '--i': 2 }}>
          <h2 className="font-display text-2xl font-semibold text-white mb-4">Hello there 👋</h2>
          <p className="text-base sm:text-lg leading-relaxed text-purple-50 mb-5">
            I&apos;m Kajal — a software engineer who loves building, learning, and connecting with
            like-minded people. I&apos;m from a small town in Haryana, and my interests revolve around
            dance — I started with Bhangra, explored Bollywood and hip-hop, and am now pursuing
            Kathak. I also enjoy music; I&apos;ve tried playing the flute and am hoping to learn
            piano soon (tips are welcome!). I really dream of performing Kathak/Dance in general and
            Piano on a big stage one day — that matters to me the most. Badminton is another hobby I
            love (I never said I&apos;m good at it :/).
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-purple-50">
            I built this site to share my thoughts on movies, books, and travels — you&apos;ll find
            suggestion buttons throughout, so please share your recommendations! For the more personal
            side — my venting place, reading list, watchlist, and more — head to{" "}
            <Link
              href="/personal/feed"
              className="text-purple-300 hover:text-purple-100 underline underline-offset-2"
            >
              Personal
            </Link>
            .
          </p>
        </section>

        <section id="professional" className="glass-card animate-fade-up p-6 sm:p-8 mb-10" style={{ '--i': 3 }}>
          <h2 className="font-display text-2xl font-semibold text-white mb-4">Worky-worky 💻</h2>
          <p className="text-base sm:text-lg leading-relaxed text-purple-50 mb-6">
            I did my schooling in Haryana and graduated from IIT Bombay, Computer Science and
            Engineering Department, with Honors — databases, networks, compilers, operating systems,
            the usual CSE stack — but algorithm design is what I&apos;ve always enjoyed most. I&apos;ve
            explored machine learning (keen to go deeper) and dipped into network security in my final
            semester. After college I worked at Microsoft in Bangalore as a Software Engineer; before
            that, two SDE internships — the full story is in my resume below.
          </p>
          <a
            href="https://drive.google.com/file/d/1TeZpOFuS0fojkrbYZnWYGhpq_6-freE8/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            View my resume <span aria-hidden="true">↗</span>
          </a>
        </section>

        <div className="flex justify-center gap-4 animate-fade-up" style={{ '--i': 4 }}>
          <a href="https://x.com/KajalMalik56" target="_blank" rel="noopener" className="social-btn" aria-label="Twitter">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37c-.83.5-1.75.87-2.72 1.07A4.28 4.28 0 0 0 12 9.75c0 .34.04.67.1.99C8.09 10.6 5.13 8.94 3.16 6.5c-.37.64-.58 1.38-.58 2.17 0 1.5.77 2.83 1.94 3.61-.72-.02-1.4-.22-1.99-.55v.06c0 2.1 1.49 3.85 3.47 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.2 8.2 0 0 1-2.36.65z"/></svg>
          </a>
          <a href="https://www.instagram.com/kajal_._malik" target="_blank" rel="noopener" className="social-btn" aria-label="Instagram">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
          </a>
          <a href="https://www.facebook.com/kajal.malik.7712826/" target="_blank" rel="noopener" className="social-btn" aria-label="Facebook">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/kajalmalikk/" target="_blank" rel="noopener" className="social-btn" aria-label="LinkedIn">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM7.1 19H3.6V9h3.5v10zm-1.8-11.3c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm14.7 11.3h-3.5v-5.4c0-1.3-.5-2.2-1.7-2.2-1 0-1.6.7-1.9 1.4-.1.2-.1.5-.1.8V19h-3.5s.1-10 0-10h3.5v1.4c.5-.8 1.3-1.9 3.2-1.9 2.3 0 4 1.5 4 4.7V19z"/></svg>
          </a>
        </div>
    </div>
  )
}
