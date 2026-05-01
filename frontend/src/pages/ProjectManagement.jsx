import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', assignedGroup: '', deadline: '' });

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (e) { console.error(e); }
  };

  const loadGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (e) { console.error(e); }
  };

  // eslint-disable-next-line
  useEffect(() => {
    loadProjects();
    loadGroups();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setFormData({ title: '', description: '', assignedGroup: '', deadline: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (project) => {
    setEditId(project._id);
    setFormData({
      title: project.title,
      description: project.description,
      assignedGroup: project.assignedGroup?._id || project.assignedGroup?.id || '',
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/projects/${id}`);
        loadProjects();
      } catch (error) {
        alert('Error deleting project');
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/projects/${editId}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      setIsModalOpen(false);
      setFormData({ title: '', description: '', assignedGroup: '', deadline: '' });
      setEditId(null);
      loadProjects();
    } catch (error) { 
      alert(editId ? 'Error updating project' : 'Error creating project'); 
      console.error(error); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, assign, edit, and manage group projects.</p>
        </div>
        <button onClick={openCreateModal} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18} />
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-gray-900 mb-2 truncate pr-2">{project.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEditClick(project)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Project">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(project._id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Project">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                {project.status}
              </span>
              <p className="text-xs text-gray-400 font-medium">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
            </div>
            <p className="text-xs text-indigo-500 font-medium mt-2">Assigned to: {project.assignedGroup?.name || 'Unassigned'}</p>
          </div>
        ))}
        {projects.length === 0 && <div className="col-span-2 text-center py-10 bg-white rounded-2xl border border-gray-100 text-gray-400">No active projects</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Project" : "Create Project"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required placeholder="Project Title" className="w-full border-gray-200 rounded-xl py-2 px-3 border focus:ring-2 outline-none" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} />
          <textarea required placeholder="Description" rows={3} className="w-full border-gray-200 rounded-xl py-2 px-3 border focus:ring-2 outline-none" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
          <select required className="w-full border-gray-200 rounded-xl py-2 px-3 border focus:ring-2 outline-none" value={formData.assignedGroup} onChange={e=>setFormData({...formData, assignedGroup:e.target.value})}>
             <option value="">Select Group</option>
             {groups.map(g => <option value={g._id} key={g._id}>{g.name}</option>)}
          </select>
          <input type="date" required className="w-full border-gray-200 rounded-xl py-2 px-3 border focus:ring-2 outline-none" value={formData.deadline} onChange={e=>setFormData({...formData, deadline:e.target.value})} />
          <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700">{editId ? "Save Changes" : "Create Project"}</button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;
