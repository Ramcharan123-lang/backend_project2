import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import { Users, Folder, CheckSquare } from 'lucide-react';
import api from '../services/api';

// eslint-disable-next-line
const SummaryCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass}`} />
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${colorClass} bg-opacity-20`}>
      <Icon size={28} className={colorClass.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ projects: 0, groups: 0, users: 0, tasks: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [adminGroups, setAdminGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projRes, grpRes, taskRes, userRes] = await Promise.all([
          api.get('/projects'),
          api.get('/groups'),
          api.get('/tasks'),
          api.get('/users')
        ]);
        
        // Compute standard stats
        setStats({
          projects: projRes.data.length,
          groups: grpRes.data.length,
          tasks: taskRes.data.length,
          users: userRes.data.length
        });
        
        // Slice top 3 most recent projects for the UI based on created info (reverse array)
        setRecentProjects(projRes.data.reverse().slice(0, 3));
        
        // Load groups to chat config
        setAdminGroups(grpRes.data);
        if (grpRes.data.length > 0) {
          setSelectedGroupId(grpRes.data[0]._id);
        }
      } catch (e) {
        console.error('Error fetching dashboard stats:', e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Active Projects" value={stats.projects} icon={Folder} colorClass="bg-indigo-500" />
        <SummaryCard title="Total Groups" value={stats.groups} icon={Users} colorClass="bg-emerald-500" />
        <SummaryCard title="Total Students" value={stats.users} icon={Users} colorClass="bg-amber-500" />
        <SummaryCard title="Total Tasks" value={stats.tasks} icon={CheckSquare} colorClass="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Projects</h2>
            <button onClick={() => navigate('/admin/projects')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              View All
            </button>
          </div>
          
          {recentProjects.length > 0 ? (
            <div className="space-y-4 flex-1">
              {recentProjects.map(project => (
                <div key={project._id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Assigned: {project.assignedGroup?.name || 'None'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {project.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Due: {new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              
              <button onClick={() => navigate('/admin/projects')} className="w-full mt-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                Manage All Projects
              </button>
            </div>
          ) : (
            <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
              <Folder size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium pb-2">No projects assigned yet</p>
              <button onClick={() => navigate('/admin/projects')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                Create New Project
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Group Chat</h2>
            <select 
              value={selectedGroupId} 
              onChange={(e) => setSelectedGroupId(e.target.value)} 
              className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:ring-indigo-500 bg-gray-50 text-gray-700 outline-none"
            >
              <option value="">Select Group...</option>
              <option value="global" className="font-bold">Public Global Chat</option>
              {adminGroups.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col">
               {selectedGroupId ? (
                 <ChatInterface groupId={selectedGroupId} key={selectedGroupId} />
               ) : (
                 <div className="flex-1 flex items-center justify-center border border-gray-100 rounded-xl bg-gray-50">
                   <button onClick={() => setSelectedGroupId('global')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg">Join Public Global Chat</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
