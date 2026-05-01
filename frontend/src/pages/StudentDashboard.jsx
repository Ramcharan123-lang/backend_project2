import React, { useEffect, useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import { Folder, CheckSquare, Clock, Users, UserCircle2, CheckCircle, Circle } from 'lucide-react';
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

const StudentDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [myGroup, setMyGroup] = useState(null);
  const [activeChat, setActiveChat] = useState({ type: 'global', id: 'global', name: 'Public Chat' });
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [taskRes, projRes, groupRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/groups')
      ]);
      
      const myTasks = taskRes.data.filter(t => t.assignedTo?._id === currentUser._id || t.assignedTo?.id === currentUser._id);
      setTasks(myTasks);
      setProjects(projRes.data);
      
      const group = groupRes.data.find(g => 
        g.members && g.members.some(m => m._id === currentUser._id || m.id === currentUser._id)
      );
      setMyGroup(group);
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [currentUser._id]);

  const toggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchData(); // Reload safely
    } catch (e) { console.error(e); }
  };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Keep track of your group projects and communicate with your team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Active Projects" value={projects.length || '-'} icon={Folder} colorClass="bg-indigo-500" />
        <SummaryCard title="Pending Tasks" value={pending || '-'} icon={Clock} colorClass="bg-amber-500" />
        <SummaryCard title="Completed Tasks" value={completed || '-'} icon={CheckSquare} colorClass="bg-emerald-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 pb-2">
           <h2 className="text-lg font-bold text-gray-900">Recent Assigned Tasks</h2>
           <p className="text-xs text-gray-500 mt-1">Manage, update, and track task progress.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No tasks assigned to you.</div>
          ) : (
            tasks.slice(0,5).map(task => (
              <div key={task._id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <h4 className="font-semibold text-gray-800">{task.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1 max-w-md">{task.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{task.projectId?.title || 'General'}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                  <div className="flex items-center justify-end">
                    <button onClick={() => toggleStatus(task)} className={`p-1.5 rounded-full transition-colors flex ${task.status === 'completed' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`} title={task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}>
                      {task.status === 'completed' ? <CheckCircle size={22} /> : <Circle size={22} />}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center justify-center min-w-[70px] ${task.marks ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                      {task.marks ? `Marks: ${task.marks}` : 'Not Marked'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[400px] flex flex-col lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {activeChat.type === 'global' ? 'Public Group Chat' : `Private Chat with ${activeChat.name}`}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {activeChat.type === 'global' ? 'A public space for all students and admins to chat.' : `Direct messaging with ${activeChat.name}`}
              </p>
            </div>
            {activeChat.type === 'private' && (
              <button onClick={() => setActiveChat({ type: 'global', id: 'global', name: 'Public Chat' })} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium transition-colors">
                Back to Public Chat
              </button>
            )}
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0">
               {activeChat.type === 'global' ? 
                 <ChatInterface groupId="global" key="global-chat" /> : 
                 <ChatInterface receiverId={activeChat.id} key={`private-${activeChat.id}`} />
               }
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[400px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <Users size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">{myGroup ? myGroup.name : 'My Group Members'}</h2>
          </div>
          
          {myGroup ? (
            <div className="space-y-4">
              {myGroup.members.map(member => (
                <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <UserCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{member.name} {member._id === currentUser._id && <span className="text-[10px] text-indigo-500 ml-1 font-bold">(You)</span>}</h4>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  {member._id !== currentUser._id && (
                    <button onClick={() => setActiveChat({ type: 'private', id: member._id, name: member.name })} className="ml-auto text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md hover:bg-gray-200 transition-colors font-medium">
                      Message
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 flex flex-col items-center justify-center h-full">
              <Users size={32} className="text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">No team assigned.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
