import { Send, Reply, X } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  replyTo, 
  onCancelReply, 
  isLoading 
}) {
  const inputRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSend();
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  };

  const handleSendClick = () => {
    if (value.trim()) {
      onSend();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div 
      className="px-3 sm:px-6 py-3 sm:py-4 bg-surface border-t border-border flex-shrink-0 sticky bottom-0 z-10"
      style={{
        paddingBottom: `max(12px, env(safe-area-inset-bottom, 0px))`,
        marginBottom: 'env(keyboard-inset-height, 0px)'
      }}
    >
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-3 p-3 bg-bg border-l-4 border-l-primary rounded-r-lg flex items-start gap-3 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Reply className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-primary">Replying to {replyTo.sender?.username}</p>
            </div>
            <p className="text-sm text-text-secondary truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-text-secondary hover:text-primary transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Input Area */}
      <div className="flex gap-3 items-center">
        <textarea
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyPress}
          placeholder={replyTo ? "Reply..." : "Type a message..."}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          spellCheck="true"
          rows={1}
          style={{ resize: 'none', minHeight: '40px', maxHeight: '120px' }}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface text-primary placeholder-text-secondary text-sm sm:text-base overflow-hidden"
        />
        <button
          onClick={handleSendClick}
          className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-light transition-colors"
        >
          <Send className="w-4 h-4 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}