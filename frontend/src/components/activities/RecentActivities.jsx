import React from 'react';
import { useCrm } from '../../context/CrmContext'; // Use context for activities

const RecentActivities = ({ limit }) => {
  const { activities } = useCrm();
  const recentActivities = activities ? activities.slice(0, limit) : [];

  return (
    <div className="recent-activities">
      {recentActivities.length > 0 ? (
        <ul>
          {recentActivities.map(activity => (
            <li key={activity.id} className="activity-item">
              {activity.text || activity.description || 'Activity'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent activities.</p>
      )}
    </div>
  );
};

export default RecentActivities; 