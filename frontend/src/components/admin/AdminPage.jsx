import React from 'react';
import UsersList from './UsersList';

const AdminPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your application credentials and users
        </p>
      </div>
      <UsersList />
    </div>
  );
};

export default AdminPage; 