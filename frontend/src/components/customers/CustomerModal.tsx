import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { X } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

const CustomerModal = ({ isOpen, onClose, customer }: CustomerModalProps) => {
  const { addCustomer, updateCustomer } = useCrm();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    status: 'lead',
    lastContact: new Date().toISOString(),
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        industry: customer.industry,
        status: customer.status,
        lastContact: customer.lastContact,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        industry: '',
        status: 'lead',
        lastContact: new Date().toISOString(),
      });
    }
  }, [customer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer) {
      updateCustomer({
        ...customer,
        ...formData,
      });
    } else {
      addCustomer({
        ...formData
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="custom-modal-overlay" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="custom-modal-container custom-modal-narrow" style={{ maxWidth: 540, width: '100%', padding: '2.5rem 2.2rem 2rem 2.2rem', borderRadius: 18 }}>
        <button className="custom-modal-close-x" onClick={onClose} aria-label="Close modal"><X size={24} /></button>
        <div style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
          <div className="custom-modal-title" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 2 }}>{customer ? 'Edit Customer' : 'Add New Customer'}</div>
          <div style={{ color: '#6b7280', fontSize: '1.05rem', marginBottom: '1.2rem' }}>Enter customer details below</div>
        </div>
        <form className="custom-modal-form" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="custom-modal-fields redesigned-modal-grid">
            <div className="custom-modal-field">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="custom-modal-field">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="custom-modal-field">
              <label htmlFor="phone">Phone</label>
              <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="custom-modal-field">
              <label htmlFor="company">Company</label>
              <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} required />
            </div>
            <div className="custom-modal-field">
              <label htmlFor="industry">Industry</label>
              <input type="text" id="industry" name="industry" value={formData.industry} onChange={handleChange} required />
            </div>
            <div className="custom-modal-field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="custom-modal-divider" style={{ margin: '1.2rem 0 1.1rem 0' }} />
          <div className="custom-modal-actions">
            <button type="button" className="custom-modal-btn cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="custom-modal-btn primary">{customer ? 'Update' : 'Add'} Customer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;