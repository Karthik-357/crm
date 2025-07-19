import React from 'react';
import { BarChart3, Users, Briefcase, CheckSquare, Calendar, User, Settings as SettingsIcon } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const { user } = useAuth() as any;
  const [activeItem, setActiveItem] = React.useState('dashboard');

  const navigation = [
    { name: 'Dashboard', icon: BarChart3, id: 'dashboard' },
    { name: 'Customers', icon: Users, id: 'customers' },
    { name: 'Projects', icon: Briefcase, id: 'projects' },
    { name: 'Tasks', icon: CheckSquare, id: 'tasks' },
    { name: 'Calendar', icon: Calendar, id: 'calendar' },
    { name: 'Settings', icon: SettingsIcon, id: 'settings' },
  ];

  return (
    <aside
      className="flex flex-col w-64 h-screen bg-white border-r border-gray-200 overflow-y-auto"
    >
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8H4V20H16V18M18 6H8V16H18V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="ml-2.5 text-lg font-semibold text-gray-900">CRM</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id === 'dashboard' ? '' : item.id}`}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors duration-200 ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-gray-900" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="px-2 py-4 space-y-1 border-t">
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors duration-200 ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Briefcase className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-900" />
              Admin
            </NavLink>
          )}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors duration-200 ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <User className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-900" />
            Profile
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;