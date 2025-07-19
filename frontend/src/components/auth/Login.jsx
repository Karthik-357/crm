import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="card"
        style={{
          minWidth: 350,
          maxWidth: 400,
          width: '100%',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          padding: '2.5rem 2rem',
          background: 'white',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#6366f1',
              borderRadius: '50%',
              width: 56,
              height: 56,
              marginBottom: 12,
            }}
          >
            <span style={{ color: 'white', fontWeight: 700, fontSize: 28 }}>C</span>
          </div>
          <h1 style={{ fontWeight: 700, fontSize: '1.7rem', color: '#1e293b', letterSpacing: '-1px' }}>
            CRM Login
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email-address" style={{ fontWeight: 500, color: '#374151', marginBottom: 6, display: 'block' }}>
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              style={{ fontSize: '1rem', padding: '0.75rem', marginBottom: 0 }}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ fontWeight: 500, color: '#374151', marginBottom: 6, display: 'block' }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              style={{ fontSize: '1rem', padding: '0.75rem', marginBottom: 0 }}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center" style={{ marginBottom: '1rem' }}>{error}</div>
          )}
          <button
            type="submit"
            className="button button-primary"
            style={{
              width: '100%',
              marginTop: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: '#6366f1',
              border: 'none',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#4f46e5')}
            onMouseOut={e => (e.currentTarget.style.background = '#6366f1')}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 