import React, { useState } from 'react';
import UsersList from './UsersList';
import AdminTasksView from './AdminTasksView';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your application users and tasks
        </p>
      </div>


      {/* Tab Content */}
      {activeTab === 'users' && <UsersList />}
      {activeTab === 'tasks' && <AdminTasksView />}
    </div>
  );
};

export default AdminPage; 