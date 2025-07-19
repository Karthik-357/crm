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
    <div className="space-y-4">
      {sortedActivities.length === 0 ? (
        <div className="text-center py-6 text-gray-500">No recent activities</div>
      ) : (
        <div className="space-y-0">
          {sortedActivities.map((activity) => (
            <div key={activity.id} className="relative pl-6 pb-5 border-l border-gray-200 group">
              <div className="absolute top-0 left-0 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center z-10">
                {getActivityIcon(activity.type)}
              </div>
              <div className="ml-2 -mt-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </span>
                    {!customerId && (
                      <span className="ml-1.5 text-xs text-gray-500">
                        with {getCustomerName(activity.customerId)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(activity.date)} at {formatTime(activity.date)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;