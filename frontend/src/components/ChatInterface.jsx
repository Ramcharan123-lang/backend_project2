import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:5000';
const socket = io(SOCKET_URL);

const ChatInterface = ({ groupId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user._id) {
       socket.emit('register_user', user._id);
    }

    if (!groupId && !receiverId) return;

    const fetchMessages = async () => {
      try {
        const endpoint = groupId ? `/groups/${groupId}/messages` : `/users/${receiverId}/messages`;
        const { data } = await api.get(endpoint);
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };
    fetchMessages();

    if (groupId) socket.emit('join_group', groupId);

    const handleReceiveMessage = (msg) => {
      if (groupId && msg.groupId === groupId) {
        setMessages((prev) => [...prev, msg]);
      } else if (receiverId && !msg.groupId) {
        if (
          (msg.sender._id === user._id && msg.receiverId === receiverId) || 
          (msg.sender._id === receiverId && msg.receiverId === user._id) ||
          (msg.sender === user._id && msg.receiverId === receiverId) ||
          (msg.sender === receiverId && msg.receiverId === user._id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [groupId, receiverId, user._id]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit('send_message', {
        sender: user._id, 
        groupId: groupId || null,
        receiverId: receiverId || null,
        content: input
      });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-72 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender?._id === user._id || msg.sender === user._id ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-gray-400 mb-0.5">{msg.sender?.name || 'User'}</span>
            <div className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] ${msg.sender?._id === user._id || msg.sender === user._id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-xs text-center text-gray-400 mt-10">Start of conversation</p>}
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white flex">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..." 
          className="w-full text-sm rounded-full bg-gray-100 border-none py-2 pl-4 pr-4 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-colors"
        />
        <button type="submit" disabled={!input.trim()} className="ml-2 bg-indigo-600 text-white rounded-full px-4 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
