import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, CheckCircle, Circle, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TaskManagement = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: '', projectId: '' });
  
  const role = localStorage.getItem('role');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadData = async () => {
    try {
      const [taskRes, projRes, groupRes, userRes] = await Promise.all([
        api.get('/tasks'), 
        api.get('/projects'),
        api.get('/groups'),
        api.get('/users')
      ]);
      
      const allTasks = taskRes.data;
      const allProjects = projRes.data;
      const allUsers = userRes.data;
      const allGroups = groupRes.data;

      if (role === 'student') {
        // Filter Tasks Assigned To Me
        const myTasks = allTasks.filter(t => t.assignedTo?._id === user._id || t.assignedTo?.id === user._id);
        setTasks(myTasks);

        // Find my true group ID
        const myGroup = allGroups.find(g => 
          g.members && g.members.some(m => m._id === user._id || m.id === user._id)
        );

        if (myGroup) {
          const groupIdStr = String(myGroup._id || myGroup.id);
          const studentProjects = allProjects.filter(p => {
             const pGrpIdStr = String(p.assignedGroup?._id || p.assignedGroup?.id || p.assignedGroup);
             return pGrpIdStr === groupIdStr;
          });
          setMyProjects(studentProjects);
        }

      } else {
        setTasks(allTasks);
        setProjects(allProjects);
        setStudents(allUsers.filter(u => u.role === 'student'));
      }
    } catch (e) { console.error(e); }
  };

  // eslint-disable-next-line
  useEffect(() => {
    loadData();
  }, [role]);

  const toggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', assignedTo: '', projectId: '' });
      loadData();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{role === 'admin' ? 'All Tasks' : 'My Tasks'}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, update, and track task progress.</p>
        </div>
        {role === 'admin' && (
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700">
            <Plus size={18} /> Assign Task
          </button>
        )}
      </div>

      {role === 'student' && myProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">My Assigned Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map(project => (
              <div key={project._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Folder size={20} />
                   </div>
                   <h3 className="font-bold text-gray-900 line-clamp-1">{project.title}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                    {project.status || 'active'}
                  </span>
                  <p className="text-xs text-gray-400 font-medium max-w-[50%] overflow-hidden text-ellipsis whitespace-nowrap" title={new Date(project.deadline).toLocaleDateString()}>
                    Due: {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/student/submissions', { state: { projectId: project._id } })}
                  className="w-full bg-indigo-50 text-indigo-600 font-semibold text-sm py-2 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
                  Submit Project
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">{role === 'admin' ? 'Task Tracking' : 'Your Action Items'}</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {tasks.map(task => (
              <div key={task._id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <h4 className="font-semibold text-gray-800">{task.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1 max-w-md">{task.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{task.projectId?.title || 'General'}</span>
                    {role === 'admin' && <span className="text-xs text-indigo-500 font-medium">Assigned to: {task.assignedTo?.name || 'Unassigned'}</span>}
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
                    {role === 'admin' && (
                      <input type="text" placeholder="Grade..." defaultValue={task.marks || ''} className="w-20 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500" 
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            try {
                              await api.put(`/tasks/${task._id}`, { marks: e.target.value });
                              loadData();
                              alert('Marks saved!');
                            } catch(err) { console.error(err); alert('Failed to save marks'); }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <div className="p-8 text-center text-gray-400">No tasks found.</div>}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required placeholder="Task Title" className="w-full border-gray-200 rounded-xl py-2 px-3 border focus:ring-2 outline-none" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} />
          <textarea required placeholder="Description" rows={3} className="w-full border-gray-200 rounded-xl py-2 px-3 border focus:ring-2 outline-none" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
          <select required className="w-full border-gray-200 rounded-xl py-2 px-3 border focus:ring-2 outline-none" value={formData.projectId} onChange={e=>setFormData({...formData, projectId:e.target.value})}>
             <option value="">Select Project</option>
             {projects.map(p => <option value={p._id} key={p._id}>{p.title}</option>)}
          </select>
          <select required className="w-full border-gray-200 rounded-xl py-2 px-3 border focus:ring-2 outline-none" value={formData.assignedTo} onChange={e=>setFormData({...formData, assignedTo:e.target.value})}>
             <option value="">Assign To Student</option>
             {students.map(s => <option value={s._id} key={s._id}>{s.name}</option>)}
          </select>
          <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700">Assign Task</button>
        </form>
      </Modal>
    </div>
  );
};

export default TaskManagement;
