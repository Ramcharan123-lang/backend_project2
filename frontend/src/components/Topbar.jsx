import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Topbar = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('role') || 'student';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-10 shadow-sm relative">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64 md:w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search projects, tasks..." 
            className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold group-hover:ring-2 ring-indigo-200 transition-all">
            <User size={18} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">{user.name || 'Student User'}</p>
            <p className="text-xs text-gray-500 font-medium capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
