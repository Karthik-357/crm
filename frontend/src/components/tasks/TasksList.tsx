import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';
import { CheckCircle2, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface TasksListProps {
  limit?: number;
}

const TasksList = ({ limit }: TasksListProps) => {
  const { tasks, updateTask, users, customers } = useCrm();
  const { isAuthenticated, user: currentUser } = useAuth();
  
  // Don't render if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="tasks-dashboard-list">
        <div className="text-center py-6 text-gray-500">Please log in to view tasks</div>
      </div>
    );
  }

  // Sort tasks by due date (most recent first) and filter out completed if limit is provided
  const sortedTasks = [...tasks]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .filter(task => limit ? task.status !== 'completed' : true)
    .slice(0, limit || undefined);

  const getPriorityIcon = (priority: string) => {
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

  const getStatusVariant = (status: string) => {
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

  const markAsCompleted = (task: any) => {
    if (!isAuthenticated || !currentUser) {
      return;
    }
    
    updateTask({
      ...task,
      status: 'completed'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUserName = (id: string) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unassigned';
  };

  const getCustomerName = (id?: string) => {
    if (!id) return '';
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : '';
  };

  return (
    <div className="tasks-dashboard-list">
      {sortedTasks.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          {tasks.length === 0 ? 'No tasks created yet. Create your first task to get started!' : 'No tasks match the current filter.'}
        </div>
      ) : (
        <>
          {sortedTasks.map((task) => {
            const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date(new Date().toDateString());
            return (
              <div
                key={task.id}
                className="task-dashboard-item"
                style={{ boxShadow: isOverdue ? '0 0 0 2px #ef4444 inset' : undefined }}
              >
                {/* Left: Status circle */}
                <div className="task-status-circle">
                  {task.status !== 'completed' ? (
                    <button
                      onClick={() => markAsCompleted(task)}
                      aria-label="Mark as completed"
                    />
                  ) : (
                    <div className="completed w-7 h-7 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Middle: Task details */}
                <div className="task-content">
                  <div className="task-title-row">
                    <span className="task-title">{task.title}</span>
                    <Badge variant={getStatusVariant(task.status)} className="task-badge">
                      {task.status === 'in-progress' ? 'In progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                    </Badge>
                  </div>
                  {task.description && (
                    <div className="task-desc">{task.description}</div>
                  )}
                  <div className="task-meta">
                    {task.customerId && (
                      <span>For: <span className="font-medium text-gray-700">{getCustomerName(task.customerId)}</span></span>
                    )}
                  </div>
                </div>

                {/* Right: Due date and icon */}
                <div className="task-due ml-4">
                  {isOverdue ? (
                    <AlertCircle className="w-5 h-5 overdue" />
                  ) : (
                    <Clock className="w-5 h-5 normal" />
                  )}
                  <span className={isOverdue ? 'overdue' : 'normal'}>{formatDate(task.dueDate)}</span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default TasksList;