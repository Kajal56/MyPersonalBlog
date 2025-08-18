"use client"
import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import { useAdminMode } from '../../components/AdminModeContext'

export default function ContactPage() {
  const { isAdminMode } = useAdminMode();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (isAdminMode) {
      loadMessages();
    }
  }, [isAdminMode]);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await apiService.getContactMessages();
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await apiService.sendContactMessage(form);
      setSuccess('Message sent!');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-10 px-4">
      <div className="max-w-2xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg p-8 border border-blue-100 dark:border-gray-800">
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
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Your Name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900" />
          <input name="email" type="email" placeholder="Your Email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900" />
          <textarea name="message" placeholder="Your Message" value={form.message} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900" rows={4} />
          <button type="submit" disabled={submitting} className="w-full bg-blue-600 dark:bg-blue-800 text-white py-2 font-semibold hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors">
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
          {success && <div className="text-green-600 dark:text-green-400 text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 dark:text-red-400 text-center mt-2">{error}</div>}
        </form>
        {isAdminMode && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Contact Messages</h2>
            {loadingMessages ? (
              <div className="text-gray-600 dark:text-gray-300">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">No messages yet.</div>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{msg.name || 'Anonymous'}</div>
                    <div className="text-gray-700 dark:text-gray-300 text-sm">{msg.message}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{msg.email || 'No email'} | {new Date(msg.dateSent).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
