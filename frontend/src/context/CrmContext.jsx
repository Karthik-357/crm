import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const CrmContext = createContext();

function mapId(obj) {
  if (obj && obj._id && !obj.id) {
    return { ...obj, id: obj._id };
  }
  return obj;
}

export function CrmProvider({ children }) {
  const { user: currentUser } = useContext(AuthContext) || {};
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
    fetchAll();
    // Real-time activities with socket.io
    const socket = io(SOCKET_URL);
    socket.on('new-activity', (activity) => {
      setActivities(prev => [activity, ...prev]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchAll = async () => {
    try {
      const [custRes, projRes, taskRes, actRes, eventRes] = await Promise.all([
        axios.get(`${API_BASE}/customers`),
        axios.get(`${API_BASE}/projects`),
        axios.get(`${API_BASE}/tasks`),
        axios.get(`${API_BASE}/activities`),
        axios.get(`${API_BASE}/events`),
      ]);
      setCustomers(custRes.data.map(mapId));
      setProjects(projRes.data.map(mapId));
      setTasks(taskRes.data.map(mapId));
      setActivities(actRes.data.map(mapId));
      setEvents(eventRes.data.map(mapId));
    } catch (err) {
      // Optionally handle error
    }
  };

  // CUSTOMER CRUD
  const addCustomer = async (customer) => {
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
    const res = await axios.put(`${API_BASE}/customers/${customer.id}`, customer, withAuth());
    setCustomers(prev => prev.map(c => (c.id === res.data._id ? mapId(res.data) : c)));
  };
  const deleteCustomer = async (id) => {
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
    const res = await axios.post(`${API_BASE}/projects`, project, withAuth());
    setProjects(prev => [...prev, mapId(res.data)]);
    const actor = currentUser?.name || currentUser?.email || 'A user';
    await addActivity({
      customerId: project.customerId,
      type: 'note',
      description: `${actor} created project: ${project.name}`,
      date: new Date().toISOString(),
    });
  };
  const updateProject = async (project) => {
    const res = await axios.put(`${API_BASE}/projects/${project.id}`, project, withAuth());
    setProjects(prev => prev.map(p => (String(p.id) === String(res.data._id) ? mapId(res.data) : p)));
    await fetchAll(); // Force refresh after update
  };
  const deleteProject = async (id) => {
    await axios.delete(`${API_BASE}/projects/${id}`, withAuth());
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    const actor = currentUser?.name || currentUser?.email || 'A user';
    await addActivity({
      customerId: null,
      type: 'note',
      description: `${actor} deleted a project`,
      date: new Date().toISOString(),
    });
  };

  // TASK CRUD
  const addTask = async (task) => {
    const res = await axios.post(`${API_BASE}/tasks`, task, withAuth());
    setTasks(prev => [...prev, mapId(res.data)]);
    const actor = currentUser?.name || currentUser?.email || 'A user';
    await addActivity({
      customerId: task.customerId,
      type: 'note',
      description: `${actor} added a new task: ${task.title}`,
      date: new Date().toISOString(),
    });
  };
  const updateTask = async (task) => {
    const res = await axios.put(`${API_BASE}/tasks/${task.id}`, task, withAuth());
    setTasks(prev => prev.map(t => (t.id === res.data._id ? mapId(res.data) : t)));
    const actor = currentUser?.name || currentUser?.email || 'A user';
    await addActivity({
      customerId: task.customerId,
      type: 'note',
      description: `${actor} updated task: ${task.title}`,
      date: new Date().toISOString(),
    });
  };
  const deleteTask = async (id) => {
    await axios.delete(`${API_BASE}/tasks/${id}`, withAuth());
    setTasks(prev => prev.filter(t => t.id !== id));
    const actor = currentUser?.name || currentUser?.email || 'A user';
    await addActivity({
      customerId: null,
      type: 'note',
      description: `${actor} deleted a task`,
      date: new Date().toISOString(),
    });
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
  };

  return (
    <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
  );
}

export function useCrm() {
  return useContext(CrmContext);
} 