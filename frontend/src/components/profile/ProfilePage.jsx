import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from '../auth/ForgotPasswordModal';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const [showResetModal, setShowResetModal] = useState(false);

  if (!user || !user.email) {
    return <div className="card" style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>Not logged in.</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
      <div className="card" style={{ textAlign: 'center' }}>
      <img
        src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email) + '&background=random'}
        alt="Profile"
          style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee', marginBottom: 12 }}
        />
        <h2 style={{ marginBottom: 4 }}>{user.name || user.email.split('@')[0]}</h2>
        <div style={{ color: '#6b7280', marginBottom: 12 }}>{user.email}</div>
        {user.role && (
          <span style={{ background: '#eef2ff', color: '#3730a3', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button className="button" onClick={() => setShowResetModal(true)}>Change Password</button>
          <button className="button button-primary" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Profile</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Full Name</div>
            <div style={{ fontWeight: 600 }}>{user.name || '—'}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Email</div>
            <div style={{ fontWeight: 600 }}>{user.email}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Role</div>
            <div style={{ fontWeight: 600 }}>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>User ID</div>
            <div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{user._id || '—'}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ marginBottom: 8 }}>About</h3>
          <p style={{ color: '#6b7280' }}>
            This is your account profile. Future enhancements could let you update your name and avatar here. For now, you can
            reset your password and view basic account details.
          </p>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSuccess={() => setShowResetModal(false)}
        defaultEmail={user.email}
      />
    </div>
  );
};

export default ProfilePage; 