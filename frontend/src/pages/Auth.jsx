import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User } from 'lucide-react';
import api from '../services/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState('student');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate empty fields
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isLogin && !formData.name.trim()) {
      setError('Please provide your full name');
      return;
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : { ...formData };
        
      const { data } = await api.post(endpoint, payload);

      // Handle role mismatch for login
      if (isLogin && data.role !== loginRole) {
        setError(`You do not have ${loginRole} privileges.`);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = data.role === 'admin' ? '/admin' : '/student';
    } catch (error) {
      alert(error.response?.data?.message || 'Authentication error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] px-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center shadow-md mx-auto mb-5 transform transition-transform hover:scale-105">
            <GraduationCap className="text-white" size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Project Management Platform
          </h2>
          <p className="text-slate-500 mt-3 text-sm sm:text-base font-medium">
            {isLogin ? 'Sign in to manage your group projects' : 'Create an account to join projects'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Role Toggle for Login */}
          {isLogin && (
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setLoginRole('student')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-out ${
                  loginRole === 'student'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('admin')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-out ${
                  loginRole === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          )}

          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-200"
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
            <input 
              type="email" 
              placeholder={isLogin && loginRole === 'student' ? 'student@university.edu' : 'Email Address'} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-200"
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-200"
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="radio" value="student" checked={formData.role === 'student'} 
                         onChange={e => setFormData({ ...formData, role: e.target.value })} 
                         className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-slate-900 checked:border-[6px] transition-all cursor-pointer" />
                </div>
                Student
              </label>
              <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="radio" value="admin" checked={formData.role === 'admin'} 
                         onChange={e => setFormData({ ...formData, role: e.target.value })} 
                         className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-slate-900 checked:border-[6px] transition-all cursor-pointer" />
                </div>
                Admin (Teacher)
              </label>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all duration-200 mt-2 shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            {isLogin 
              ? `Sign In as ${loginRole === 'admin' ? 'Admin' : 'Student'}` 
              : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="text-slate-900 font-bold hover:underline transition-all"
            >
              {isLogin ? 'Create one' : 'Log in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
