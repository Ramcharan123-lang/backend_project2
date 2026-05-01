import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Trash } from 'lucide-react';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [formData, setFormData] = useState({ name: '', members: [] });

  const loadGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStudents = async () => {
    try {
      const { data } = await api.get('/users');
      setStudents(data.filter(u => u.role === 'student'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadGroups();
    loadStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', formData);
      setIsModalOpen(false);
      setFormData({ name: '', members: [] });
      loadGroups();
    } catch (error) {
      alert('Error creating group');
      console.error(error);
    }
  };

  const handleMemberSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, members: selectedOptions });
  };

  const handleRemoveMember = async (groupId, memberId) => {
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      loadGroups();
    } catch (error) {
      alert('Error removing member');
      console.error(error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberToAdd || !selectedGroup) return;
    try {
      await api.post(`/groups/${selectedGroup._id}/members/${memberToAdd}`);
      setIsAddMemberModalOpen(false);
      setMemberToAdd('');
      setSelectedGroup(null);
      loadGroups();
    } catch (error) {
      alert('Error adding member');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create student groups and assign members.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18} />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">{group.name}</h3>
              <button onClick={() => { setSelectedGroup(group); setIsAddMemberModalOpen(true); }} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1 font-medium transition-colors">
                <Plus size={14} /> Add User
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-2 font-medium">MEMBERS ({group.members.length})</p>
            <ul className="space-y-2 mb-4">
              {group.members.map(member => (
                <li key={member._id} className="text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex justify-between items-center group">
                  <span>{member.name}</span>
                  <button onClick={() => handleRemoveMember(group._id, member._id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50">
                    <Trash size={14} />
                  </button>
                </li>
              ))}
              {group.members.length === 0 && <li className="text-sm text-gray-400">No members</li>}
            </ul>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Group">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-200 rounded-xl py-2 px-3 focus:ring-indigo-500" placeholder="e.g. Group A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Students</label>
            <p className="text-xs text-gray-500 mb-2">Hold Ctrl/Cmd to select multiple students</p>
            <select multiple value={formData.members} onChange={handleMemberSelect} className="w-full border-gray-200 rounded-xl py-2 px-3 focus:ring-indigo-500 h-32">
              {students.map(student => (
<option key={student._id} value={student._id}>{student.name} ({student.email})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition">
            Create Group
          </button>
        </form>
      </Modal>

      <Modal isOpen={isAddMemberModalOpen} onClose={() => { setIsAddMemberModalOpen(false); setMemberToAdd(''); setSelectedGroup(null); }} title="Add Member to Group">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
            <select required value={memberToAdd} onChange={e => setMemberToAdd(e.target.value)} className="w-full border-gray-200 rounded-xl py-2 px-3 focus:ring-indigo-500">
              <option value="">Select a student...</option>
              {students.filter(s => selectedGroup && !selectedGroup.members.find(m => m._id === s._id)).map(student => (
                <option key={student._id} value={student._id}>{student.name} ({student.email})</option>
              ))}
            </select>
            {students.filter(s => selectedGroup && !selectedGroup.members.find(m => m._id === s._id)).length === 0 && (
              <p className="text-xs text-red-500 mt-2">All students are already in this group.</p>
            )}
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition" disabled={students.filter(s => selectedGroup && !selectedGroup.members.find(m => m._id === s._id)).length === 0}>
            Add Member
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default GroupManagement;
