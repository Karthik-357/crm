import React from 'react';
import { useCrm } from '../../context/CrmContext';

const TasksList = ({ limit }) => {
  const { tasks } = useCrm();

  // Filter and sort tasks (e.g., by due date) if needed, then limit
  const upcomingTasks = tasks
    .filter(task => task.status === 'todo' || task.status === 'in-progress')
    // .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)) // Optional: sort by due date
    .slice(0, limit);

  return (
    <div className="tasks-list-dashboard">
      {upcomingTasks.length > 0 ? (
        <ul>
          {upcomingTasks.map(task => (
            <li key={task.id} className="task-item-dashboard">
              <div className="task-title-dashboard">{task.title}</div>
              {/* Optional: Display due date */}
              {/* <div className="task-due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</div> */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming tasks.</p>
      )}
    </div>
  );
};

export default TasksList; 