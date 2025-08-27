import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Edit, Trash2, Plus } from 'lucide-react';
import CustomerModal from './CustomerModal';
import './CustomersList.css';

interface CustomersListProps {
  limit?: number;
}

const CustomersList = ({ limit }: CustomersListProps) => {
  const { customers, deleteCustomer, projects } = useCrm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);

  // Helper to sum project values for a customer
  const getCustomerValue = (customerId: string) => {
    return projects
      .filter((project: any) => project.customerId === customerId)
      .reduce((sum: number, project: any) => sum + (project.value || 0), 0);
  };

  const sortedCustomers = [...customers].sort((a, b) => getCustomerValue(b.id) - getCustomerValue(a.id));
  const displayCustomers = limit ? sortedCustomers.slice(0, limit) : sortedCustomers;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'lead':
        return 'primary';
      default:
        return 'default';
    }
  };

  const handleEdit = (customer: any) => {
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentCustomer(null);
    setIsModalOpen(true);
  };

  const getCustomerProjectsCount = (customerId: string) => projects.filter((project: any) => String(project.customerId) === String(customerId)).length;

  return (
    <div>
      {!limit && (
        <div className="customers-header-row">
          <button className="add-customer-btn" onClick={handleAdd}>
            <span className="plus-icon">+</span> Add Customer
          </button>
        </div>
      )}

      <div className="customers-table-wrapper">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Industry</th>
              <th>Status</th>
              <th>Projects</th>
              <th>Value</th>
              {!limit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {displayCustomers.map((customer) => (
              <tr key={customer.id} className="customer-row compact">
                <td>
                  <div className="customer-info-row">
                    {customer.avatar ? (
                      <img className="customer-avatar compact" src={customer.avatar} alt="" />
                    ) : (
                      <div className="customer-avatar-placeholder">
                        <span>{customer.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="customer-info-text">
                      <div className="customer-name">{customer.name}</div>
                      <div className="customer-email">{customer.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="customer-industry">{customer.industry}</div>
                </td>
                <td>
                  <span className={`customer-status-badge status-${(customer.status || 'default').toLowerCase()} compact`}>
                    {customer.status ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1) : 'Unknown'}
                  </span>
                </td>
                <td>
                  <span className="customer-projects-count">{getCustomerProjectsCount(customer.id)}</span>
                </td>
                <td>
                  <span className="customer-value compact">₹{getCustomerValue(customer.id).toLocaleString('en-IN')}</span>
                </td>
                {!limit && (
                  <td className="customer-actions">
                    <button className="action-icon-btn edit-btn" onClick={() => handleEdit(customer)} title="Edit">
                      <svg className="icon" viewBox="0 0 24 24" width="18" height="18"><path d="M4 21h4.586a1 1 0 0 0 .707-.293l10.414-10.414a2 2 0 0 0 0-2.828l-2.172-2.172a2 2 0 0 0-2.828 0L4.293 15.707A1 1 0 0 0 4 16.414V21z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button className="action-icon-btn delete-btn" onClick={() => deleteCustomer(customer.id)} title="Delete">
                      <svg className="icon" viewBox="0 0 24 24" width="18" height="18"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6m-6 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={currentCustomer}
      />
    </div>
  );
};

export default CustomersList;