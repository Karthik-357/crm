import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  Cog8ToothIcon, // Add a settings icon
} from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Customers', href: '/customers', icon: UserGroupIcon },
    { name: 'Projects', href: '/projects', icon: FolderIcon },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Analytics', href: '/analytics', icon: HomeIcon }, // You can replace HomeIcon with a chart icon if available
    { name: 'Settings', href: '/settings', icon: Cog8ToothIcon },
  ];
  const adminNav = { name: 'Admin', href: '/admin', icon: Cog6ToothIcon };
  const AdminIcon = adminNav.icon;

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          <h1>CRM</h1>
        </div>
        <nav>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <hr style={{ margin: '1.5rem 0', border: 0, borderTop: '1px solid #e5e7eb' }} />
        {user && user.role === 'admin' && (
          <NavLink
            key={adminNav.name}
            to={adminNav.href}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <AdminIcon />
            {adminNav.name}
          </NavLink>
        )}
        {user && user.email && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <UserCircleIcon />
            Profile
          </NavLink>
        )}
      </div>
      <main className="main-content">
        {children ? children : <Outlet />}
      </main>
    </div>
  );
};

export default Layout; 