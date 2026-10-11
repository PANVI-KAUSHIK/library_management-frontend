import React, { useEffect, useState } from 'react';
import api from '../api';

function Members() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: '', studentClass: '', section: '', rollNo: '', contactInfo: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const fetchMembers = () => {
    setLoading(true);
    api.get('/members')
      .then(res => setMembers(res.data))
      .catch(() => setMessage({ text: 'Failed to load members', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const resetForm = () => {
    setForm({ name: '', studentClass: '', section: '', rollNo: '', contactInfo: '' });
    setEditingId(null);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (editingId) {
      api.put(`/members/${editingId}`, form)
        .then(() => {
          setMessage({ text: 'Member updated successfully', type: 'success' });
          fetchMembers();
          resetForm();
        })
        .catch(err => setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' }));
    } else {
      api.post('/members', form)
        .then(() => {
          setMessage({ text: 'Member added successfully', type: 'success' });
          fetchMembers();
          resetForm();
        })
        .catch(err => setMessage({ text: err.response?.data?.message || 'Add failed', type: 'error' }));
    }
  };

  const handleEdit = member => {
    setForm({
      name: member.name,
      studentClass: member.studentClass,
      section: member.section,
      rollNo: member.rollNo,
      contactInfo: member.contactInfo || ''
    });
    setEditingId(member.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      api.delete(`/members/${id}`)
        .then(() => {
          setMessage({ text: 'Member deleted successfully', type: 'success' });
          fetchMembers();
        })
        .catch(err => setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'error' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
          <p className="text-sm text-gray-500">Manage registered students, class details, and contact information</p>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600'
              : 'bg-red-50 text-red-700 border-l-4 border-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add / Edit Member Form */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {editingId ? 'Edit Member Information' : 'Register New Member'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Alice Johnson"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info / Email</label>
            <input
              type="text"
              name="contactInfo"
              placeholder="e.g. alice@school.edu"
              value={form.contactInfo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input
              type="text"
              name="studentClass"
              placeholder="e.g. 10th"
              value={form.studentClass}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <input
              type="text"
              name="section"
              placeholder="e.g. B"
              value={form.section}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll No</label>
            <input
              type="text"
              name="rollNo"
              placeholder="e.g. 42"
              value={form.rollNo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div className="md:col-span-3 flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="btn-primary"
            >
              {editingId ? 'Save Member' : 'Add Member'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Members Table */}
      <div className="card overflow-x-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Registered Members ({members.length})</h2>
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading member list...</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No members found. Register a student above.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-emerald-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-center font-semibold">Class</th>
                <th className="px-4 py-3 text-center font-semibold">Section</th>
                <th className="px-4 py-3 text-center font-semibold">Roll No</th>
                <th className="px-4 py-3 text-left font-semibold">Contact</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-500 font-mono">#{member.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{member.studentClass}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{member.section}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700">{member.rollNo}</td>
                  <td className="px-4 py-3 text-gray-600">{member.contactInfo || '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium cursor-pointer transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-medium cursor-pointer transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Members;
