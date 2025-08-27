import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';

const TasksPage = () => {
  const { tasks, addTask, updateTask, customers } = useCrm();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', assignedTo: '', status: 'todo', priority: 'medium', customerId: '' });
    const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showArchived, setShowArchived] = useState(false);

  // Don't render if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="tasks-page">
        <div className="text-center py-8">
          <p className="text-gray-500">Please log in to view your tasks.</p>
        </div>
      </div>
    );
  }

  const isOverdue = (task) => {
    return task.status !== 'completed' && new Date(task.dueDate) < new Date(new Date().toDateString());
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'todo' || task.status === 'in-progress';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') return isOverdue(task);
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === 'priority') {
      const order = { high: 1, medium: 2, low: 3 };
      return (order[a.priority] || 4) - (order[b.priority] || 4);
    }
    return 0;
  });

  const now = new Date();
  const displayTasks = sortedTasks.filter(task => {
    if (showArchived) return true;
    if (task.status !== 'completed') return true;
    const completedDate = new Date(task.dueDate);
    return (now - completedDate) / (1000 * 60 * 60 * 24) <= 7;
  });

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !currentUser) {
      alert('Please log in to add tasks.');
      return;
    }
    
    if (newTask.title.trim() && newTask.dueDate) {
      try {
        await addTask({
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          dueDate: newTask.dueDate,
          priority: newTask.priority,
          customerId: newTask.customerId,
        });
        setNewTask({ title: '', description: '', dueDate: '', assignedTo: '', status: 'todo', priority: 'medium', customerId: '' });
        setShowAddTask(false);
      } catch (err) {
        console.error('Task creation error:', err);
        const errorMessage = err?.response?.data?.error || err.message || 'Unknown error occurred';
        alert(`Failed to add task: ${errorMessage}`);
      }
    } else {
      alert('Please fill in all required fields (title, due date).');
    }
  };

  const toggleTaskStatus = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      let newStatus = task.status === 'completed' ? 'todo' : 'completed';
      updateTask({ ...task, status: newStatus });
    }
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header-row">
        <h1 className="tasks-title">My Tasks</h1>
        <button className="button button-primary tasks-add-btn" onClick={() => setShowAddTask(true)}>
          Add Task
        </button>
      </div>
      
      {/* Info message about user-specific tasks */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <p className="text-blue-800 text-sm">
          💡 You're viewing your personal tasks. Each user has their own separate task list.
        </p>
      </div>
      
      {/* Filtering Tabs */}
      <div className="tasks-filter-tabs">
        {['all', 'pending', 'completed', 'overdue'].map(tab => (
          <button
            key={tab}
            className={`tasks-filter-tab${filter === tab ? ' active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <select className="tasks-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
        <label style={{marginLeft: '16px', display: 'flex', alignItems: 'center', fontSize: '0.98em'}}>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)}
            style={{marginRight: '6px'}}
          />
          Show archived tasks
        </label>
      </div>

      {showAddTask && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container custom-modal-narrow">
            <button className="custom-modal-close-x" onClick={() => setShowAddTask(false)} aria-label="Close modal">×</button>
            <div className="custom-modal-title">Add New Task</div>
            <form className="custom-modal-form" onSubmit={handleAddTask}>
              <div className="custom-modal-fields redesigned-modal-grid">
                <div className="custom-modal-field">
                  <label htmlFor="title">Title</label>
                  <input type="text" id="title" name="title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                </div>
                <div className="custom-modal-field">
                  <label htmlFor="dueDate">Due Date</label>
                  <input type="date" id="dueDate" name="dueDate" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} required />
                </div>
                <div className="custom-modal-field">
                  <label htmlFor="customerId">Customer</label>
                  <select id="customerId" name="customerId" value={newTask.customerId} onChange={e => setNewTask({ ...newTask, customerId: e.target.value })}>
                    <option value="">Select a customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.email || c.id}</option>
                    ))}
                  </select>
                </div>
                <div className="custom-modal-field">
                  <label htmlFor="priority">Priority</label>
                  <select id="priority" name="priority" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="custom-modal-field">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="custom-modal-field" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="description">Description</label>
                  <textarea id="description" name="description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows={2} />
                </div>
              </div>
              <div className="custom-modal-actions">
                <button type="button" className="custom-modal-btn cancel" onClick={() => setShowAddTask(false)}>Cancel</button>
                <button type="submit" className="custom-modal-btn primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card tasks-card">
        <div className="tasks-list-header">
          <h2 className="tasks-list-title">Task List</h2>
        </div>
        <div className="tasks-list">
          {displayTasks.length === 0 ? (
            <div className="tasks-empty">No tasks found.</div>
          ) : (
            displayTasks.map((task) => (
              <div key={task.id} className={`task-item-redesigned${isOverdue(task) ? ' overdue-task' : ''}`}>
                <div className="task-item-main">
                  <div className="task-item-title-row">
                    <span className="task-item-title">{task.title}</span>
                    <span className={`task-badge status-badge status-${task.status}`}>{task.status.replace('-', ' ')}</span>
                    <span className={`task-badge priority-badge priority-${task.priority}`}>{task.priority}</span>
                    {isOverdue(task) && <span className="overdue-badge">Overdue</span>}
                  </div>
                  <div className="task-item-desc">{task.description}</div>
                  <div className="task-item-meta">
                    <span className="task-item-due">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="task-item-actions">
                  <button
                    className="custom-modal-btn primary task-complete-btn"
                    onClick={() => toggleTaskStatus(task.id)}
                  >
                    {task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage; 