"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasskeyPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [newPasskey, setNewPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setNewPasskey(data.passkey);
      } else {
        setError(data.message || 'Failed to generate new passkey');
      }
    } catch (err) {
      setError('Failed to generate new passkey');
    } finally {
      setLoading(false);
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
            <h1 className="text-xl sm:text-2xl font-bold text-[#463F3A]">Forgot PassKey</h1>
            <p className="text-[#8A817C] text-xs sm:text-sm mt-2">Verify your credentials to generate a new passkey</p>
          </div>

          {error && (
            <div className="bg-[#E0AFA0] bg-opacity-20 border border-[#E0AFA0] text-[#463F3A] px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl mb-4 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {newPasskey ? (
            <div className="text-center space-y-4">
              <div className="bg-[#BCB8B1] bg-opacity-20 border border-[#BCB8B1] px-4 py-6 rounded-2xl">
                <p className="text-[#8A817C] text-sm mb-2">Your new passkey is:</p>
                <p className="text-2xl font-bold text-[#463F3A] tracking-wider">{newPasskey}</p>
                <p className="text-[#8A817C] text-xs mt-2">Save this passkey securely</p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2.5 sm:py-3 px-4 bg-[#463F3A] text-white rounded-xl sm:rounded-2xl hover:bg-[#8A817C] transition-colors font-medium text-sm sm:text-base"
              >
                Back to Login
              </button>
            </div>
          ) : (
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
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-[#BCB8B1] rounded-2xl focus:outline-none focus:border-[#463F3A] bg-[#F4F3EE] text-[#463F3A] placeholder-[#8A817C]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 px-4 bg-[#463F3A] text-white rounded-xl sm:rounded-2xl hover:bg-[#8A817C] transition-colors font-medium text-sm sm:text-base disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate New PassKey'}
              </button>
            </form>
          )}

          <div className="text-center mt-4 sm:mt-6">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center justify-center mx-auto text-[#8A817C] text-xs sm:text-sm hover:text-[#463F3A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}