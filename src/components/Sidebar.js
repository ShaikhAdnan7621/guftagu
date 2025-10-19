import { useState } from 'react';
import { Settings, LogOut, Copy, UserPlus, RefreshCw, Clock } from 'lucide-react';

export default function Sidebar({ user, chats, onChatSelect, activeChat, onLogout, requests, onAcceptRequest, isOpen, onClose, onOpenKeyModal }) {

  return (
    <div className={`w-full sm:w-80 md:w-80 lg:w-80 xl:w-80 bg-[#F4F3EE] border-r border-[#BCB8B1] flex flex-col sm:relative absolute inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
    }`}>
      {/* Header */}
      <div className="p-3 sm:p-4 bg-[#463F3A] text-white flex justify-between items-center">
        <h1 className="text-lg font-medium">GuftaGu</h1>
        <div className="flex gap-2">
          <button
            onClick={onOpenKeyModal}
            className="p-2 bg-[#8A817C] hover:bg-[#BCB8B1] rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
          </button>
          <button
            onClick={onLogout}
            className="p-2 bg-[#E0AFA0] hover:bg-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
          </button>
        </div>
      </div>



      {/* Requests Section */}
      {requests.length > 0 && (
        <div className="p-2 sm:p-3 bg-[#E0AFA0] bg-opacity-20 border-b border-[#BCB8B1]">
          <p className="text-xs font-medium text-[#463F3A] mb-2">Chat Requests</p>
          {requests.map(request => (
            <div key={request._id} className="flex items-center justify-between mb-2 p-2 bg-white rounded-lg">
              <div>
                <p className="text-xs font-medium text-[#463F3A]">{request.from.username}</p>
                <p className="text-xs text-[#8A817C]">{request.from.email}</p>
              </div>
              <button
                onClick={() => onAcceptRequest(request._id)}
                className="py-1 px-2 bg-[#463F3A] text-white text-xs rounded-lg hover:bg-[#8A817C] transition-colors"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-[#F4F3EE]">
        {chats.length === 0 ? (
          <div className="p-4 sm:p-6 text-center text-[#8A817C]">
            <p className="text-sm font-medium">No chats yet</p>
            <p className="text-xs mt-1">Generate and share your key to start chatting</p>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => onChatSelect(chat)}
              className={`p-3 sm:p-4 border-b border-[#BCB8B1] cursor-pointer transition-all hover:shadow-sm ${
                activeChat?._id === chat._id 
                  ? 'bg-white border-l-4 border-l-[#463F3A] shadow-sm' 
                  : 'hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#463F3A]">
                    {chat.participants.find(p => p._id !== user._id)?.username}
                  </div>
                  <div className="text-xs text-[#8A817C] mt-1">Click to start chatting</div>
                </div>
                <div className="w-2 h-2 bg-[#E0AFA0] rounded-full"></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}