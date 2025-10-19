import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Menu } from 'lucide-react';

export default function ChatArea({ activeChat, messages, user, onSendMessage, isLoading, onToggleSidebar }) {
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessages, setSendingMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  // Remove sending messages when real messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setSendingMessages(prev => 
        prev.filter(sending => 
          !messages.some(real => real.content === sending.content)
        )
      );
    }
  }, [messages]);

  // Get message border radius based on grouping
  const getMessageRadius = (message, index, allMessages) => {
    const isOwn = message.sender._id === user._id;
    const prevMsg = allMessages[index - 1];
    const nextMsg = allMessages[index + 1];
    
    const isSameSenderPrev = prevMsg && prevMsg.sender._id === message.sender._id;
    const isSameSenderNext = nextMsg && nextMsg.sender._id === message.sender._id;
    
    const isSameMinutePrev = prevMsg && 
      Math.abs(new Date(prevMsg.createdAt) - new Date(message.createdAt)) < 60000;
    const isSameMinuteNext = nextMsg && 
      Math.abs(new Date(nextMsg.createdAt) - new Date(message.createdAt)) < 60000;
    
    const groupedPrev = isSameSenderPrev && isSameMinutePrev;
    const groupedNext = isSameSenderNext && isSameMinuteNext;
    
    if (isOwn) {
      if (groupedPrev && groupedNext) return 'rounded-l-lg rounded-tr-sm rounded-br-sm';
      if (groupedPrev) return 'rounded-tl-lg rounded-bl-2xl rounded-br-2xl rounded-tr-sm mb-1';
      if (groupedNext) return 'rounded-bl-lg rounded-tl-2xl rounded-tr-2xl rounded-br-sm mt-1';
      return 'rounded-2xl';
    } else {
      if (groupedPrev && groupedNext) return 'rounded-r-xl rounded-tl-sm rounded-bl-sm';
      if (groupedPrev) return 'rounded-tr-lg rounded-br-2xl rounded-bl-2xl rounded-tl-sm mb-1';
      if (groupedNext) return 'rounded-br-lg rounded-tr-2xl rounded-tl-2xl rounded-bl-sm mt-1';
      return 'rounded-2xl';
    }
  };



  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    // Add to sending array
    const sendingMsg = {
      id: Date.now(),
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setSendingMessages(prev => [...prev, sendingMsg]);
    onSendMessage(newMessage);
    setNewMessage('');
    setTimeout(scrollToBottom, 100);
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col bg-[#F4F3EE]">
        {/* Empty state header with menu button */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-[#BCB8B1] flex items-center">
          <button
            onClick={onToggleSidebar}
            className="sm:hidden p-2 text-[#463F3A] hover:bg-[#F4F3EE] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 flex-shrink-0" />
          </button>
          <h2 className="font-semibold text-[#463F3A] text-sm sm:text-base ml-2 sm:ml-0">
            GuftaGu
          </h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center text-[#8A817C]">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50 flex-shrink-0" />
            <p className="text-base sm:text-lg font-medium text-[#463F3A]">Welcome to GuftaGu</p>
            <p className="text-xs sm:text-sm mt-1">Select a chat to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F4F3EE] w-full sm:w-auto">
      {/* Chat Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-[#BCB8B1] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="sm:hidden p-2 text-[#463F3A] hover:bg-[#F4F3EE] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 flex-shrink-0" />
          </button>
          <div>
            <h2 className="font-semibold text-[#463F3A] text-sm sm:text-base">
              {activeChat.participants.find(p => p._id !== user._id)?.username}
            </h2>
            <p className="text-xs text-[#E0AFA0] mt-0.5">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-2"
      >
        {!Array.isArray(messages) || (messages.length === 0 && sendingMessages.length === 0) ? (
          <div className="text-center text-[#8A817C] mt-12">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1 opacity-75">Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const allMessages = [...messages, ...sendingMessages.map(s => ({
                ...s, sender: { _id: user._id }, createdAt: s.timestamp
              }))];
              return (
                <div
                  key={`${message._id}-${index}`}
                  className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'} mb-0.5`}
                >
                  <div
                    className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-2 sm:px-3 py-2 ${getMessageRadius(message, index, messages)} ${
                      message.sender._id === user._id
                        ? 'bg-[#463F3A] text-white'
                        : 'bg-white text-[#463F3A] border border-[#BCB8B1]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed break-words">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              );
            })}
            {sendingMessages.map((sending, index) => {
              const sendingAsMessage = { sender: { _id: user._id }, createdAt: sending.timestamp };
              const allMessages = [...messages, ...sendingMessages.map(s => ({
                ...s, sender: { _id: user._id }, createdAt: s.timestamp
              }))];
              const msgIndex = messages.length + index;
              return (
                <div key={sending.id} className="flex justify-end mb-0.5">
                  <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-2 sm:px-3 py-2 ${getMessageRadius(sendingAsMessage, msgIndex, allMessages)} bg-[#8A817C] text-white opacity-70`}>
                    <p className="text-xs sm:text-sm leading-relaxed break-words">{sending.content}</p>
                    <p className="text-xs opacity-75 mt-1">Sending...</p>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-t border-[#BCB8B1]">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-[#BCB8B1] rounded-full focus:outline-none focus:border-[#463F3A] focus:ring-1 focus:ring-[#463F3A] bg-white text-[#463F3A] placeholder-[#8A817C] text-sm sm:text-base"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !newMessage.trim()}
            className="p-2.5 bg-[#463F3A] text-white rounded-full hover:bg-[#8A817C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}