import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Trash, Edit } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', year: '', branch: '', groupId: '', role: 'student' });

  const loadStudents = async () => {
    try {
      const { data } = await api.get('/users');
      setStudents(data.filter(u => u.role === 'student'));
    } catch (e) { console.error(e); }
  };

  const loadGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadStudents();
    loadGroups();
  }, []);

  const deleteStudent = async (id) => {
    if (confirm('Are you sure?')) {
      await api.delete(`/users/${id}`);
      loadStudents();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', year: '', branch: '', groupId: '', role: 'student' });
      loadStudents();
    } catch (error) { alert('Error creating student'); console.error(error); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage created students and assign groups.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18} />
          Create Student
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Group</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(student => (
              <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 text-gray-500">{student.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {student.groupId?.name || 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button onClick={() => deleteStudent(student._id)} className="text-rose-500 hover:text-rose-700">
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="4" className="text-center py-8 text-gray-400">No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Student Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required placeholder="Name" className="w-full border-gray-200 rounded-xl py-2 px-3" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
          <input type="email" required placeholder="Email" className="w-full border-gray-200 rounded-xl py-2 px-3" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} />
          <input type="password" required placeholder="Password" className="w-full border-gray-200 rounded-xl py-2 px-3" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             <input type="text" placeholder="Year" className="w-full border-gray-200 rounded-xl py-2 px-3" value={formData.year} onChange={e=>setFormData({...formData, year:e.target.value})} />
             <input type="text" placeholder="Branch" className="w-full border-gray-200 rounded-xl py-2 px-3" value={formData.branch} onChange={e=>setFormData({...formData, branch:e.target.value})} />
          </div>
          <select className="w-full border-gray-200 rounded-xl py-2 px-3" value={formData.groupId} onChange={e=>setFormData({...formData, groupId:e.target.value})}>
             <option value="">No Group</option>
             {groups.map(g => <option value={g._id} key={g._id}>{g.name}</option>)}
          </select>
          <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700">Create</button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
