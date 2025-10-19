"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passkey: ''
  });
  const [loginType, setLoginType] = useState('password');
  const [error, setError] = useState('');
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
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: loginType === 'password' ? formData.password : undefined,
          passkey: loginType === 'passkey' ? formData.passkey : undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        document.cookie = `token=${data.token}; path=/; max-age=604800`;
        router.push('/chat');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE] px-4 py-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-[#BCB8B1]">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[#463F3A]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#463F3A]">Welcome Back</h1>
            <p className="text-[#8A817C] text-xs sm:text-sm mt-2">Sign in to continue chatting</p>
          </div>

          <div className="flex bg-[#F4F3EE] rounded-xl sm:rounded-2xl p-1 mb-4 sm:mb-6">
            <button
              onClick={() => setLoginType('password')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                loginType === 'password' 
                  ? 'bg-[#463F3A] text-white shadow-sm' 
                  : 'text-[#8A817C] hover:text-[#463F3A]'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setLoginType('passkey')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                loginType === 'passkey' 
                  ? 'bg-[#463F3A] text-white shadow-sm' 
                  : 'text-[#8A817C] hover:text-[#463F3A]'
              }`}
            >
              PassKey
            </button>
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

            {loginType === 'password' ? (
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
            ) : (
              <div>
                <input
                  name="passkey"
                  type="text"
                  required
                  value={formData.passkey}
                  onChange={handleChange}
                  placeholder="PassKey"
                  className="w-full px-4 py-3 border border-[#BCB8B1] rounded-2xl focus:outline-none focus:border-[#463F3A] bg-[#F4F3EE] text-[#463F3A] placeholder-[#8A817C]"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 px-4 bg-[#463F3A] text-white rounded-xl sm:rounded-2xl hover:bg-[#8A817C] transition-colors font-medium text-sm sm:text-base"
            >
              Sign In
            </button>
          </form>

          {loginType === 'passkey' && (
            <div className="text-center mt-3">
              <button
                onClick={() => router.push('/forgot-passkey')}
                className="text-[#8A817C] text-xs hover:text-[#463F3A] hover:underline transition-colors"
              >
                Forgot PassKey?
              </button>
            </div>
          )}

          <div className="text-center mt-4 sm:mt-6">
            <p className="text-[#8A817C] text-xs sm:text-sm">
             {`Don't have an account? `}
              <button
                onClick={() => router.push('/signup')}
                className="text-[#463F3A] font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}