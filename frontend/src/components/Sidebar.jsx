import React from 'react';
import { Home, Users, Folder, CheckSquare, Upload, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const location = useLocation();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: Home },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Groups', path: '/admin/groups', icon: Folder },
    { name: 'Projects', path: '/admin/projects', icon: Folder },
    { name: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
    { name: 'Submissions', path: '/admin/submissions', icon: Upload },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: Home },
    { name: 'My Tasks', path: '/student/tasks', icon: CheckSquare },
    { name: 'Submissions', path: '/student/submissions', icon: Upload },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-white shadow-xl shadow-gray-200/50 hidden md:flex flex-col z-10 relative border-r border-gray-100">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            ProjectSync
          </span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all w-full font-medium">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
