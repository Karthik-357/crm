import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import './UsersList.css';

const API_BASE = 'http://localhost:5000/api';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalError, setModalError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (success) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setSuccess('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, withAuth());
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch users');
    }
  };

  function withAuth() {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setForm({ name: user.name || '', email: user.email, password: '', role: user.role || 'user' });
    setIsModalOpen(true);
    setModalError('');
  };

  const handleAddOrEditUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setSuccess('');
    if (!form.name.trim() || !form.email.trim() || (!editUser && !form.password.trim())) {
      setModalError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      if (editUser) {
        const updateData = { name: form.name, email: form.email, role: form.role };
        if (form.password.trim()) updateData.password = form.password;
        await axios.put(`${API_BASE}/users/${editUser._id}`, updateData, withAuth());
        setSuccess('User updated successfully');
      } else {
        await axios.post(`${API_BASE}/users`, form, withAuth());
        setSuccess('User added successfully');
      }
      setForm({ name: '', email: '', password: '', role: 'user' });
      setIsModalOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.error || err.message || (editUser ? 'Failed to update user' : 'Failed to add user'));
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/users/${id}`, withAuth());
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete user');
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Toast notification */}
      {showToast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: '#22c55e', color: '#fff', padding: '1rem 1.5rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontWeight: 500 }}>
          {success}
        </div>
      )}
      <div className="users-header-row">
        <button className="add-user-btn" onClick={() => { setIsModalOpen(true); setEditUser(null); setForm({ name: '', email: '', password: '', role: 'user' }); }}>
          <span className="plus-icon">+</span> Add User
        </button>
      </div>
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name || '-'}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                <td className="user-actions">
                  <button className="action-icon-btn edit-btn" onClick={() => openEditModal(user)} title="Edit">Edit</button>
                  <button className="action-icon-btn delete-btn" onClick={() => handleDeleteUser(user._id)} title="Delete">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
        {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
      </div>
      {/* Modal for adding/editing user */}
      {isModalOpen && (
        <div className="user-modal-overlay">
          <div className="user-modal-container">
            <div className="user-modal-header">
              <h2 className="user-modal-title">{editUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="user-modal-close" onClick={() => { setIsModalOpen(false); setModalError(''); setEditUser(null); }}>&times;</button>
            </div>
            {modalError && <div className="text-red-600 mb-3 text-center">{modalError}</div>}
            <form onSubmit={handleAddOrEditUser} className="user-modal-form">
              <div className="user-modal-field">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="user-modal-field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="role" style={{ fontWeight: 500, color: '#374151', marginBottom: 6, display: 'block' }}>
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="input"
                  style={{ fontSize: '1rem', padding: '0.75rem', marginBottom: 0 }}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="user-modal-field">
                <label htmlFor="password">Password{editUser ? ' (leave blank to keep unchanged)' : ''}</label>
                <input type="password" id="password" name="password" value={form.password} onChange={handleChange} { ...(!editUser && { required: true }) } />
              </div>
              <div className="user-modal-actions">
                <button type="button" className="add-user-btn" style={{ background: '#fff', color: '#2563eb', border: '1px solid #2563eb' }} onClick={() => { setIsModalOpen(false); setModalError(''); setEditUser(null); }}>
                  Cancel
                </button>
                <button type="submit" className="add-user-btn" disabled={loading}>
                  {loading ? (editUser ? 'Saving...' : 'Adding...') : (editUser ? 'Save' : 'Add User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList; 