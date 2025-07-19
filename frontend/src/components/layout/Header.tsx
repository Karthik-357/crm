import React, { useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

interface HeaderProps {
  onMenuButtonClick: () => void;
}

const Header = ({ onMenuButtonClick }: HeaderProps) => {
  const { currentUser } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuButtonClick}
            className="p-1 mr-4 text-gray-500 rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="relative w-64 md:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-100 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            >
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full object-cover border-2 border-transparent hover:border-blue-500"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
              )}
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 origin-top-right ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
                <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <a href="#logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;