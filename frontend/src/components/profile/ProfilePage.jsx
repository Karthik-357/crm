import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  if (!user || !user.email) {
    return <div className="card" style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>Not logged in.</div>;
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
      <img
        src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email) + '&background=random'}
        alt="Profile"
        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee', marginBottom: 16 }}
      />
      <h2 style={{ marginBottom: 8 }}>{user.email}</h2>
      <div style={{ fontSize: 18, color: '#666', marginBottom: 16 }}>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</div>
      <button className="button" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
    </div>
  );
};

export default ProfilePage; 