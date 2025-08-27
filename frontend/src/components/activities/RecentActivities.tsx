import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { PhoneCall, Mail, CalendarClock, MessageSquare } from 'lucide-react';

interface RecentActivitiesProps {
  limit?: number;
  customerId?: string;
}

const RecentActivities = ({ limit, customerId }: RecentActivitiesProps) => {
  const { activities, customers, getActivitiesByCustomerId } = useCrm();
  
  const filteredActivities = customerId
    ? getActivitiesByCustomerId(customerId)
    : activities;
  
  const sortedActivities = [...filteredActivities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit || undefined);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="w-4 h-4 text-blue-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-500" />;
      case 'meeting':
        return <CalendarClock className="w-4 h-4 text-green-500" />;
      case 'note':
        return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4" style={{ minHeight: '300px', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
  
      <div>
        {sortedActivities.map((activity, idx) => (
          <React.Fragment key={activity.id || idx}>
            <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '15px', color: '#222', fontWeight: 400, marginBottom: '8px' }}>
              {activity.description}
            </div>
            {idx !== sortedActivities.length - 1 && (
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '8px', marginTop: '-2px', opacity: 0.6 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;