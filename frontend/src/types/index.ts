export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'lead';
  industry: string;
  avatar?: string;
  lastContact: string;
  value: number;
}

export interface Project {
  id: string;
  customerId: string;
  name: string;
  status: 'proposal' | 'in-progress' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  value: number;
  progress: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
  assignedTo: string;
  customerId?: string;
  projectId?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Activity {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}