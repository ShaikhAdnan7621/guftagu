import { useState } from 'react';
import { Copy, UserPlus, RefreshCw, Clock } from 'lucide-react';

export default function KeyModal({ user, isOpen, onClose }) {
  const [inputKey, setInputKey] = useState('');

  const sendRequest = async () => {
    if (!inputKey.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shareableKey: inputKey })
      });
      
      const data = await response.json();
      if (response.ok) {
        setInputKey('');
        onClose();
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(user.shareableKey?.key || '');
  };

  const generateNewKey = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/generate-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error generating new key:', error);
    }
  };

  const checkKeyExpiry = () => {
    if (user.shareableKey?.expiresAt) {
      const now = new Date();
      const expiry = new Date(user.shareableKey.expiresAt);
      return now > expiry;
    }
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-[#463F3A]">Profile & Keys</h2>
          <button
            onClick={onClose}
            className="text-[#8A817C] hover:text-[#463F3A] text-lg sm:text-xl p-1"
          >
            ×
          </button>
        </div>
        
        {/* User Info */}
        <div className="mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-[#F4F3EE]">
          <p className="text-xs sm:text-sm font-medium text-[#463F3A] truncate">{user.username}</p>
          <p className="text-xs text-[#8A817C] truncate">{user.email}</p>
        </div>

        {/* Shareable Key Section */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs sm:text-sm font-medium text-[#463F3A]">Your Shareable Key</p>
            {checkKeyExpiry() && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">Expired</span>
              </div>
            )}
          </div>
          
          <div className="mb-2 sm:mb-3">
            <input
              type="text"
              value={user.shareableKey?.key || 'No key generated'}
              readOnly
              className={`w-full text-xs sm:text-sm p-2 sm:p-3 border rounded-lg sm:rounded-xl font-mono text-center tracking-wider ${
                checkKeyExpiry() 
                  ? 'border-red-200 bg-red-50 text-red-400' 
                  : 'border-[#BCB8B1] bg-[#F4F3EE] text-[#463F3A]'
              }`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            <button
              onClick={copyKey}
              disabled={!user.shareableKey?.key || checkKeyExpiry()}
              className="py-2 px-2 sm:px-3 bg-[#463F3A] text-white text-xs sm:text-sm rounded-lg sm:rounded-xl hover:bg-[#8A817C] transition-colors flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Copy Key</span>
              <span className="sm:hidden">Copy</span>
            </button>
            <button
              onClick={generateNewKey}
              className="py-2 px-2 sm:px-3 bg-[#E0AFA0] text-[#463F3A] text-xs sm:text-sm rounded-lg sm:rounded-xl hover:bg-[#BCB8B1] transition-colors flex items-center justify-center gap-1 sm:gap-2"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{user.shareableKey?.key ? 'New Key' : 'Generate'}</span>
              <span className="sm:hidden">{user.shareableKey?.key ? 'New' : 'Gen'}</span>
            </button>
          </div>
          
          {user.shareableKey?.expiresAt && !checkKeyExpiry() && (
            <p className="text-xs text-[#8A817C] mt-2 text-center">
              Expires: {new Date(user.shareableKey.expiresAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Connect Section */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#463F3A] mb-2 sm:mb-3">Connect with Someone</p>
          <div className="flex gap-1 sm:gap-2">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value.toUpperCase())}
              placeholder="8-digit key"
              maxLength={8}
              className="flex-1 text-xs sm:text-sm p-2 sm:p-3 border border-[#BCB8B1] rounded-lg sm:rounded-xl focus:outline-none focus:border-[#463F3A] bg-[#F4F3EE] text-[#463F3A] placeholder-[#8A817C] font-mono text-center tracking-wider"
            />
            <button
              onClick={sendRequest}
              disabled={inputKey.length !== 8}
              className="py-2 px-3 sm:py-3 sm:px-4 bg-[#E0AFA0] text-[#463F3A] text-xs sm:text-sm rounded-lg sm:rounded-xl hover:bg-[#BCB8B1] transition-colors flex items-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}