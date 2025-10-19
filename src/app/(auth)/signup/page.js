"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, CheckCircle, Copy } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '', 
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [passKey, setPassKey] = useState('');
  const [showPassKey, setShowPassKey] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setPassKey(data.passKey);
        setShowPassKey(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  if (showPassKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE] px-4 py-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-[#BCB8B1] text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#463F3A] mb-2">Account Created!</h2>
            <p className="text-[#8A817C] text-xs sm:text-sm mb-4 sm:mb-6">Your account has been successfully created</p>
            
            <div className="bg-[#E0AFA0] bg-opacity-20 border border-[#E0AFA0] p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-[#463F3A] mb-3 font-medium">{`Save this PassKey - you'll need it to login:`}</p>
              <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm break-all text-[#463F3A] border border-[#BCB8B1]">
                {passKey}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(passKey)}
                className="mt-3 px-3 sm:px-4 py-2 bg-[#463F3A] text-white text-xs rounded-lg sm:rounded-xl hover:bg-[#8A817C] transition-colors flex items-center gap-2 mx-auto"
              >
                <Copy className="w-3 h-3" />
                Copy PassKey
              </button>
            </div>
            
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 sm:py-3 px-4 bg-[#463F3A] text-white rounded-xl sm:rounded-2xl hover:bg-[#8A817C] transition-colors font-medium text-sm sm:text-base"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE] px-4 py-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-[#BCB8B1]">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-[#463F3A]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#463F3A]">Create Account</h1>
            <p className="text-[#8A817C] text-xs sm:text-sm mt-2">Join GuftaGu and start chatting</p>
          </div>
        
          {error && (
            <div className="bg-[#E0AFA0] bg-opacity-20 border border-[#E0AFA0] text-[#463F3A] px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl mb-4 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-4 py-3 border border-[#BCB8B1] rounded-2xl focus:outline-none focus:border-[#463F3A] bg-[#F4F3EE] text-[#463F3A] placeholder-[#8A817C]"
              />
            </div>

            <div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-3 border border-[#BCB8B1] rounded-2xl focus:outline-none focus:border-[#463F3A] bg-[#F4F3EE] text-[#463F3A] placeholder-[#8A817C]"
              />
            </div>

            <div>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 border border-[#BCB8B1] rounded-2xl focus:outline-none focus:border-[#463F3A] bg-[#F4F3EE] text-[#463F3A] placeholder-[#8A817C]"
              />
            </div>

            <div>
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 border border-[#BCB8B1] rounded-2xl focus:outline-none focus:border-[#463F3A] bg-[#F4F3EE] text-[#463F3A] placeholder-[#8A817C]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 px-4 bg-[#463F3A] text-white rounded-xl sm:rounded-2xl hover:bg-[#8A817C] transition-colors font-medium text-sm sm:text-base"
            >
              Create Account
            </button>
          </form>

          <div className="text-center mt-4 sm:mt-6">
            <p className="text-[#8A817C] text-xs sm:text-sm">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#463F3A] font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
