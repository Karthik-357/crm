import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { handleAuthError } from '../utils/authUtils';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CrmContext = createContext();

function mapId(obj) {
  if (obj && obj._id && !obj.id) {
    return { ...obj, id: obj._id };
  }
  return obj;
}

export function CrmProvider({ children }) {
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users] = useState([]); // You can fetch users if needed
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      emailNotifications: true,
      pushNotifications: false,
    };
  });

  // Add axios interceptor to handle 401 errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle authentication errors
        if (handleAuthError(error, logout)) {
          return Promise.reject(error);
        }
        
        // Handle server errors with retry
        if (error.response?.status >= 500) {
          console.log('Server error detected:', error.response.status);
          if (error.config && !error.config._retry) {
            error.config._retry = true;
            // Retry once for server errors
            return axios.request(error.config);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Apply dark mode class to body and root div, and persist to localStorage
  useEffect(() => {
    const rootDiv = document.getElementById('root');
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
      if (rootDiv) rootDiv.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      if (rootDiv) rootDiv.classList.remove('dark-mode');
    }
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // Fetch settings from backend after login
  useEffect(() => {
    const fetchSettings = async () => {
      if (currentUser && currentUser.id) {
        try {
          const res = await axios.get(`${API_BASE}/users/${currentUser.id}/settings`, withAuth());
          setSettings(res.data);
        } catch (err) {
          // fallback to localStorage if backend fails
        }
      }
    };
    fetchSettings();
    // eslint-disable-next-line
  }, [currentUser && currentUser.id]);

  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.id) {
      fetchAll();
    }
  }, [isAuthenticated, currentUser]);

  const fetchAll = async () => {
    try {
      const [custRes, projRes, actRes, eventRes] = await Promise.all([
        axios.get(`${API_BASE}/customers`),
        axios.get(`${API_BASE}/projects`),
        axios.get(`${API_BASE}/activities`),
        axios.get(`${API_BASE}/events`),
      ]);
      setCustomers(custRes.data.map(mapId));
      setProjects(projRes.data.map(mapId));
      setActivities(actRes.data.map(mapId));
      setEvents(eventRes.data.map(mapId));
      
      // Fetch tasks only if user is authenticated
      if (currentUser && currentUser.id && isAuthenticated) {
        try {
          const taskRes = await axios.get(`${API_BASE}/tasks`, withAuth());
          setTasks(taskRes.data.map(mapId));
        } catch (err) {
          console.error('Error fetching tasks:', err);
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
    } catch (err) {
      // Optionally handle error
      console.error('Error fetching data:', err);
    }
  };

  // CUSTOMER CRUD
  const addCustomer = async (customer) => {
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated');
    }
    
    const res = await axios.post(`${API_BASE}/customers`, customer, withAuth());
    setCustomers(prev => [...prev, mapId(res.data)]);
    await addActivity({
      customerId: mapId(res.data).id,
      type: 'note',
      description: `A new customer has been added`,
      date: new Date().toISOString(),
    });
  };
  const updateCustomer = async (customer) => {
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated');
    }
    
    const res = await axios.put(`${API_BASE}/customers/${customer.id}`, customer, withAuth());
    setCustomers(prev => prev.map(c => (c.id === res.data._id ? mapId(res.data) : c)));
  };
  const deleteCustomer = async (id) => {
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated');
    }
    
    await axios.delete(`${API_BASE}/customers/${id}`, withAuth());
    setCustomers(prev => prev.filter(c => c.id !== id));
    setProjects(prev => prev.filter(p => p.customerId !== id));
    setTasks(prev => prev.filter(t => t.customerId !== id));
    setActivities(prev => prev.filter(a => a.customerId !== id));
    await addActivity({
      customerId: id,
      type: 'note',
      description: `A customer has been deleted`,
      date: new Date().toISOString(),
    });
  };

  // PROJECT CRUD
  const addProject = async (project) => {
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      const res = await axios.post(`${API_BASE}/projects`, project, withAuth());
      setProjects(prev => [...prev, mapId(res.data)]);
      const actor = currentUser.name || currentUser.email || 'A user';
      await addActivity({
        customerId: project.customerId,
        type: 'note',
        description: `${actor} created project: ${project.name}`,
        date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in addProject:', error);
      throw error;
    }
  };
  const updateProject = async (project) => {
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated');
    }
    
    const res = await axios.put(`${API_BASE}/projects/${project.id}`, project, withAuth());
    setProjects(prev => prev.map(p => (String(p.id) === String(res.data._id) ? mapId(res.data) : p)));
    await fetchAll(); // Force refresh after update
  };
  const deleteProject = async (id) => {
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated');
    }
    
    // Find project to capture its customerId for activity
    const projectToDelete = projects.find(p => p.id === id);
    await axios.delete(`${API_BASE}/projects/${id}`, withAuth());
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    const actor = currentUser.name || currentUser.email || 'A user';
    if (projectToDelete && projectToDelete.customerId) {
      await addActivity({
        customerId: projectToDelete.customerId,
        type: 'note',
        description: `${actor} deleted a project`,
        date: new Date().toISOString(),
      });
    }
  };

  // TASK CRUD
  const addTask = async (task) => {
    console.log('addTask called with:', task);
    console.log('currentUser:', currentUser);
    console.log('isAuthenticated:', isAuthenticated);
    
    if (!currentUser || !currentUser.id) {
      console.error('User not authenticated, currentUser:', currentUser);
      throw new Error('User not authenticated');
    }
    
    try {
      const authHeaders = withAuth();
      console.log('Auth headers:', authHeaders);
      
      const res = await axios.post(`${API_BASE}/tasks`, task, authHeaders);
      console.log('Task created successfully:', res.data);
      
      setTasks(prev => [...prev, mapId(res.data)]);
      const actor = currentUser.name || currentUser.email || 'A user';
      await addActivity({
        customerId: task.customerId,
        type: 'note',
        description: `${actor} added a new task: ${task.title}`,
        date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in addTask:', error);
      throw error;
    }
  };
  const updateTask = async (task) => {
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated');
    }
    
    const res = await axios.put(`${API_BASE}/tasks/${task.id}`, task, withAuth());
    setTasks(prev => prev.map(t => (t.id === res.data._id ? mapId(res.data) : t)));
    const actor = currentUser.name || currentUser.email || 'A user';
    await addActivity({
      customerId: task.customerId,
      type: 'note',
      description: `${actor} updated task: ${task.title}`,
      date: new Date().toISOString(),
    });
  };
  const deleteTask = async (id) => {
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated');
    }
    
    // Find task to capture its customerId for activity
    const taskToDelete = tasks.find(t => t.id === id);
    await axios.delete(`${API_BASE}/tasks/${id}`, withAuth());
    setTasks(prev => prev.filter(t => t.id !== id));
    const actor = currentUser.name || currentUser.email || 'A user';
    if (taskToDelete && taskToDelete.customerId) {
      await addActivity({
        customerId: taskToDelete.customerId,
        type: 'note',
        description: `${actor} deleted a task`,
        date: new Date().toISOString(),
      });
    }
  };

  // ACTIVITY CRUD
  const addActivity = async (activity) => {
    const res = await axios.post(`${API_BASE}/activities`, activity, withAuth());
    setActivities(prev => [...prev, mapId(res.data)]);
  };

  // CALENDAR EVENTS CRUD
  const addEvent = async (event) => {
    const res = await axios.post(`${API_BASE}/events`, event, withAuth());
    setEvents(prev => [...prev, mapId(res.data)]);
  };
  const deleteEvent = async (id) => {
    await axios.delete(`${API_BASE}/events/${id}`, withAuth());
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Filter functions
  const getCustomerById = (id) => customers.find(c => c.id === id);
  const getProjectsByCustomerId = (customerId) => projects.filter(p => p.customerId === customerId);
  const getTasksByCustomerId = (customerId) => tasks.filter(t => t.customerId === customerId);
  const getActivitiesByCustomerId = (customerId) => activities.filter(a => a.customerId === customerId);

  // Admin function to get tasks for a specific user
  const getTasksByUserId = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/user/${userId}`, withAuth());
      return res.data.map(mapId);
    } catch (err) {
      console.error('Error fetching tasks for user:', err);
      return [];
    }
  };

  // Helper for auth header
  function withAuth() {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  // SETTINGS
  const updateSettings = async (updates) => {
    if (currentUser && currentUser.id) {
      try {
        const res = await axios.put(`${API_BASE}/users/${currentUser.id}/settings`, { ...settings, ...updates }, withAuth());
        setSettings(res.data);
        localStorage.setItem('settings', JSON.stringify(res.data));
      } catch (err) {
        // fallback to localStorage if backend fails
        setSettings(prev => ({ ...prev, ...updates }));
        localStorage.setItem('settings', JSON.stringify({ ...settings, ...updates }));
      }
    } else {
      setSettings(prev => ({ ...prev, ...updates }));
      localStorage.setItem('settings', JSON.stringify({ ...settings, ...updates }));
    }
  };

  // Single setting update helper for compatibility
  const updateSetting = (key, value) => {
    updateSettings({ [key]: value });
  };

  const value = {
    customers,
    projects,
    tasks,
    activities,
    users,
    currentUser,
    events,
    addEvent,
    deleteEvent,
    settings,
    updateSettings,
    updateSetting,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addActivity,
    getCustomerById,
    getProjectsByCustomerId,
    getTasksByCustomerId,
    getActivitiesByCustomerId,
    getTasksByUserId, // Add the new function to the context value
  };

  return (
    <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
  );
}

export function useCrm() {
  return useContext(CrmContext);
} 