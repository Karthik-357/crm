import React from 'react';
import CustomersList from '../customers/CustomersList';

const CustomersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your customers and their information
        </p>
      </div>
      <CustomersList />
    </div>
  );
};

export default CustomersPage;