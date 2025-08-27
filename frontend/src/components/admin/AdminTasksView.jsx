import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import Badge from '../ui/Badge';
import { CheckCircle2, Clock, AlertCircle, CheckCircle, User } from 'lucide-react';

const AdminTasksView = () => {
  const { getTasksByUserId, users } = useCrm();
  const [allUserTasks, setAllUserTasks] = useState({});
  const [selectedUser, setSelectedUser] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (users.length > 0) {
      fetchAllUserTasks();
    }
  }, [users]);

  const fetchAllUserTasks = async () => {
    setLoading(true);
    try {
      const tasksByUser = {};
      
      // Fetch tasks for each user
      for (const user of users) {
        const userTasks = await getTasksByUserId(user.id);
        tasksByUser[user.id] = userTasks;
      }
      
      setAllUserTasks(tasksByUser);
    } catch (error) {
      console.error('Error fetching all user tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllTasks = () => {
    return Object.values(allUserTasks).flat();
  };

  const getTasksToShow = () => {
    if (selectedUser === 'all') {
      return getAllTasks();
    }
    return allUserTasks[selectedUser] || [];
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'todo':
        return 'default';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const tasksToShow = getTasksToShow();

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Users Tasks</h2>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Users</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        {tasksToShow.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedUser === 'all' ? 'No tasks found across all users.' : 'No tasks found for this user.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasksToShow.map((task) => {
              const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date(new Date().toDateString());
              return (
                <div
                  key={task.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                  style={{ boxShadow: isOverdue ? '0 0 0 2px #ef4444 inset' : undefined }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">{task.title}</span>
                        <Badge variant={getStatusVariant(task.status)}>
                          {task.status === 'in-progress' ? 'In progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                        </Badge>
                        {getPriorityIcon(task.priority)}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{getUserName(task.userId)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isOverdue ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTasksView;

