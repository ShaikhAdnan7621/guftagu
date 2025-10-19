"use client"

import { useRouter } from 'next/navigation';
import { MessageCircle, Users, Shield, Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F4F3EE]">
      {/* Header */}
      <header className="bg-[#463F3A] text-white p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-xl sm:text-2xl font-bold">GuftaGu</h1>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-[#8A817C] hover:bg-[#BCB8B1] rounded-lg transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-[#E0AFA0] text-[#463F3A] hover:bg-[#BCB8B1] rounded-lg transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-[#463F3A] mb-4 sm:mb-6">
            Connect & Chat Instantly
          </h2>
          <p className="text-lg sm:text-xl text-[#8A817C] mb-6 sm:mb-8 max-w-2xl mx-auto">
            Share your unique key, connect with friends, and start chatting in real-time. Simple, secure, and seamless.
          </p>
          <button
            onClick={() => router.push('/signup')}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-[#463F3A] text-white text-lg rounded-2xl hover:bg-[#8A817C] transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 rounded-2xl border border-[#BCB8B1] text-center">
            <Users className="w-12 h-12 text-[#463F3A] mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-[#463F3A] mb-2">Easy Connection</h3>
            <p className="text-sm sm:text-base text-[#8A817C]">Share your 8-digit key to instantly connect with anyone</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#BCB8B1] text-center">
            <Shield className="w-12 h-12 text-[#463F3A] mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-[#463F3A] mb-2">Secure Chat</h3>
            <p className="text-sm sm:text-base text-[#8A817C]">Your conversations are private and secure</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#BCB8B1] text-center sm:col-span-2 lg:col-span-1">
            <Zap className="w-12 h-12 text-[#463F3A] mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-[#463F3A] mb-2">Real-time</h3>
            <p className="text-sm sm:text-base text-[#8A817C]">Messages delivered instantly with live updates</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#463F3A] text-white p-4 sm:p-6 mt-12 sm:mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm sm:text-base text-[#BCB8B1]">
            © 2024 GuftaGu. Simple, secure messaging for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}
