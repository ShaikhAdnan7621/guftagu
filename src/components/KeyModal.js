import { useState } from 'react';
import { Copy, UserPlus, RefreshCw, Clock, X, Key, User } from 'lucide-react';

export default function KeyModal({ user, isOpen, onClose }) {
  const [inputKey, setInputKey] = useState('');
  const [copied, setCopied] = useState(false);

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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-primary">Profile & Keys</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
          </button>
        </div>
        
        {/* User Info */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-accent rounded-lg sm:rounded-xl border border-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-primary truncate">{user.username}</p>
              <p className="text-xs sm:text-sm text-text-secondary truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Shareable Key Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-primary">Your Shareable Key</h3>
            {checkKeyExpiry() && (
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-red-50 text-red-500 rounded-full">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Expired</span>
              </div>
            )}
          </div>
          
          <div className="mb-3 sm:mb-4">
            <div className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${
              checkKeyExpiry() 
                ? 'border-red-200 bg-red-50' 
                : 'border-border bg-bg'
            }`}>
              <input
                type="text"
                value={user.shareableKey?.key || 'No key generated'}
                readOnly
                className={`w-full text-sm sm:text-lg font-mono text-center tracking-[0.2em] sm:tracking-[0.3em] bg-transparent border-none outline-none ${
                  checkKeyExpiry() 
                    ? 'text-red-500' 
                    : 'text-primary'
                }`}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={copyKey}
              disabled={!user.shareableKey?.key || checkKeyExpiry()}
              className="py-2 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary-light disabled:opacity-50 text-white rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Key'}</span>
              <span className="sm:hidden">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={generateNewKey}
              className="py-2 sm:py-3 px-3 sm:px-4 bg-accent hover:bg-primary-lighter text-primary rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base font-medium"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{user.shareableKey?.key ? 'New Key' : 'Generate'}</span>
              <span className="sm:hidden">{user.shareableKey?.key ? 'New' : 'Gen'}</span>
            </button>
          </div>
          
          {user.shareableKey?.expiresAt && !checkKeyExpiry() && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-accent border border-border rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2 justify-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-text-secondary" />
                <p className="text-xs sm:text-sm text-text-secondary font-medium">
                  Expires: {new Date(user.shareableKey.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Connect Section */}
        <div className="border-t border-border pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Connect with Someone</h3>
          <div className="space-y-2 sm:space-y-3">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value.toUpperCase())}
              placeholder="Enter 8-digit key"
              maxLength={8}
              className="w-full text-sm sm:text-lg p-3 sm:p-4 border-2 border-border rounded-lg sm:rounded-xl focus:outline-none focus:border-primary bg-bg text-primary placeholder-text-secondary font-mono text-center tracking-[0.15em] sm:tracking-[0.2em] transition-colors"
            />
            <button
              onClick={sendRequest}
              disabled={inputKey.length !== 8}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-primary hover:bg-primary-light disabled:opacity-50 text-white rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 disabled:cursor-not-allowed font-semibold text-sm sm:text-lg"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Connect Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}