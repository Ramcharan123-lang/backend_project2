import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Upload, FileText, CheckCircle2, Trash2, Edit2, X, Check, XCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const SubmissionPage = () => {
  const location = useLocation();
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [editId, setEditId] = useState(null);

  const role = localStorage.getItem('role');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadSubmissions = async () => {
    try {
      const { data } = await api.get('/submissions');
      setSubmissions(data);
    } catch (e) { console.error(e); }
  };

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadSubmissions();
    if (role === 'student') {
      loadProjects();
    }
    if (location.state?.projectId) {
      setSelectedProjectId(location.state.projectId);
    }
  }, [role, location.state]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    let currentGroupId = user.groupId;
    try {
      const me = await api.get('/users');
      const latestUser = me.data.find(u => u._id === user._id);
      if (latestUser && latestUser.groupId) {
        currentGroupId = latestUser.groupId._id || latestUser.groupId;
      }
    } catch(err) { console.error(err); }

    if (!currentGroupId) return alert('You are not assigned to any group yet. Cannot submit.');

    const formData = new FormData();
    formData.append('fileUrl', file);
    
    if (!editId) {
       if (!selectedProjectId) return alert('Please select a project to submit for');
       formData.append('groupId', currentGroupId);
       formData.append('projectId', selectedProjectId); 
    }

    try {
      if (editId) {
        await api.put(`/submissions/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Submission updated successfully');
      } else {
        await api.post('/submissions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Upload successful');
      }
      setFile(null);
      setSelectedProjectId('');
      setEditId(null);
      loadSubmissions();
    } catch (error) {
      alert(editId ? 'Update failed.' : 'Upload failed.');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        await api.delete(`/submissions/${id}`);
        loadSubmissions();
      } catch (err) {
        console.error(err);
        alert('Failed to delete submission');
      }
    }
  };

  const handleEditClick = (sub) => {
    setEditId(sub._id);
    setSelectedProjectId(sub.projectId?._id || sub.projectId?.id || '');
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = async (id, status) => {
     try {
       await api.put(`/submissions/${id}`, { status });
       loadSubmissions();
     } catch (err) {
       console.error("Error updating status:", err);
       alert('Failed to evaluate submission.');
     }
  };

  const cancelEdit = () => {
    setEditId(null);
    setFile(null);
    setSelectedProjectId('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{role === 'admin' ? 'All Submissions' : 'Project Submission'}</h1>
        <p className="text-sm text-gray-500 mt-1">{role === 'admin' ? 'Evaluate and approve incoming project deliveries.' : 'Upload your final project files here.'}</p>
      </div>

      {role === 'student' && (
        <form onSubmit={handleUpload} className={`p-8 rounded-2xl border shadow-sm text-center transition-colors ${editId ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          {editId && (
            <div className="mb-4 flex items-center justify-between bg-amber-100 text-amber-800 px-4 py-2 rounded-lg">
               <span className="font-semibold text-sm">Editing Existing Submission ID: {editId.substring(0, 8)}...</span>
               <button type="button" onClick={cancelEdit} className="p-1 hover:bg-amber-200 rounded-full transition-colors"><X size={16} /></button>
            </div>
          )}
          
          {!editId && (
            <div className="mb-6 flex justify-center">
               <select required className="max-w-xs w-full border-gray-200 rounded-xl py-2 px-3 text-sm focus:ring-indigo-500" value={selectedProjectId} onChange={e=>setSelectedProjectId(e.target.value)}>
                 <option value="">Select Target Project...</option>
                 {projects.map(p => <option value={p._id} key={p._id}>{p.title}</option>)}
               </select>
            </div>
          )}

          <div className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${editId ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-100/50' : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'}`}>
            <input type="file" accept=".pdf,.zip,.ppt,.pptx" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {file ? (
              <>
                <CheckCircle2 size={48} className={`${editId ? 'text-amber-500' : 'text-emerald-500'} mb-3`} />
                <p className="font-medium text-gray-700">{file.name}</p>
                <p className="text-sm text-gray-400 mt-1">Click to change file</p>
              </>
            ) : (
              <>
                <Upload size={48} className={`${editId ? 'text-amber-400' : 'text-indigo-400'} mb-3`} />
                <p className="font-medium text-gray-700">Drop your file (.pdf, .zip, .ppt) here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse from your device</p>
              </>
            )}
          </div>
          <button type="submit" disabled={!file || (!selectedProjectId && !editId)} className={`mt-6 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50 shadow-md ${editId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {editId ? 'Update Submission' : 'Submit Project'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Submission Evaluation History</h2>
        <div className="space-y-3">
          {submissions.map(sub => (
            <div key={sub._id} className="flex flex-col md:flex-row items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <a href={`http://127.0.0.1:5000${sub.fileUrl}`} target="_blank" rel="noreferrer" className="font-semibold text-gray-800 hover:text-indigo-600 hover:underline">
                    {sub.fileUrl ? sub.fileUrl.split('/').pop() : 'Submission Document'}
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">Submitted at: {new Date(sub.submittedAt).toLocaleString()}</p>
                  <p className="text-xs text-indigo-500 mt-0.5 font-medium">{sub.projectId?.title || 'Unknown Project'} - {sub.groupId?.name || 'Unknown Group'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                {role === 'student' && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditClick(sub)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit File">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(sub._id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete Submission">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                       sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                       sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 
                       'bg-gray-100 text-gray-600'
                    }`}>
                      {sub.status || 'pending'}
                    </span>

                    {sub.grade && (
                       <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                         Grade: {sub.grade}
                       </span>
                    )}
                  </div>

                  {role === 'admin' && (
                    <div className="flex items-center gap-2">
                       {/* Approve Button */}
                       <button onClick={() => handleUpdateStatus(sub._id, 'approved')} className={`p-1.5 rounded-lg border transition-colors ${sub.status === 'approved' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-emerald-500 hover:bg-emerald-50 border-gray-200'}`} title="Approve Submission">
                          <Check size={14} strokeWidth={3} />
                       </button>
                       {/* Reject Button */}
                       <button onClick={() => handleUpdateStatus(sub._id, 'rejected')} className={`p-1.5 rounded-lg border transition-colors ${sub.status === 'rejected' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-rose-500 hover:bg-rose-50 border-gray-200'}`} title="Reject Submission">
                          <X size={14} strokeWidth={3} />
                       </button>

                       <input type="text" defaultValue={sub.grade || ''} placeholder="Grade..." className="w-20 lg:ml-2 text-xs border border-gray-200 rounded px-2 py-1 focus:ring-indigo-500 outline-none" 
                         onKeyDown={async (e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             try {
                               await api.put(`/submissions/${sub._id}`, { grade: e.target.value });
                               loadSubmissions();
                               alert('Grade saved!');
                             } catch(err) { console.error(err); alert('Failed to save grade'); }
                           }
                         }}
                       />
                       <button onClick={() => handleDelete(sub._id)} className="p-1 ml-1 text-gray-400 hover:text-rose-600" title="Delete Evaluation Node"><Trash2 size={14}/></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {submissions.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No submissions evaluated.</p>}
        </div>
      </div>
    </div>
  );
};

export default SubmissionPage;
