import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Plus, Briefcase, Pencil, Trash2, X } from 'lucide-react';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const { projects, customers, addProject, updateProject, deleteProject } = useCrm();
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    customerId: '',
    status: 'proposal',
    startDate: '',
    value: '',
    progress: '',
  });
  const [showEditProject, setShowEditProject] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim() && newProject.customerId.trim()) {
      const valueNum = Number(newProject.value) || 0;
      let progressNum = Number(newProject.progress);
      if (isNaN(progressNum)) progressNum = 0;
      progressNum = Math.max(0, Math.min(100, progressNum));
      await addProject({
        ...newProject,
        value: valueNum,
        progress: progressNum,
      });
      setNewProject({ name: '', customerId: '', status: 'proposal', startDate: '', value: '', progress: '' });
      setShowAddProject(false);
    }
  };

  const handleEditClick = (project: any) => {
    setCurrentProject({
      ...project,
      value: project.value !== undefined && project.value !== null ? String(project.value) : '',
      progress: project.progress !== undefined && project.progress !== null ? String(project.progress) : '',
    });
    setShowEditProject(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProject.name.trim() && currentProject.customerId.trim()) {
      const valueNum = Number(currentProject.value) || 0;
      let progressNum = Number(currentProject.progress);
      if (isNaN(progressNum)) progressNum = 0;
      progressNum = Math.max(0, Math.min(100, progressNum));
      await updateProject({
        ...currentProject,
        value: valueNum,
        progress: progressNum,
      });
      setCurrentProject(null);
      setShowEditProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      setShowDeleteModal(false);
      setProjectToDelete(null);
      await deleteProject(projectToDelete);
    }
  };

  const cancelDeleteProject = () => {
    setProjectToDelete(null);
    setShowDeleteModal(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'proposal':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'on-hold':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="projects-page">
      <div className="projects-header-row">
        <div>
          <h1 className="projects-title">Projects</h1>
          <p className="projects-subtitle">Manage your ongoing and upcoming projects</p>
        </div>
        <Button variant="primary" icon={<Plus />} onClick={() => setShowAddProject(true)} className="project-add-btn">
          New Project
        </Button>
      </div>
      {showAddProject && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container custom-modal-narrow">
            <button className="custom-modal-close-x" onClick={() => setShowAddProject(false)}><X size={22} /></button>
            <div className="custom-modal-title" style={{ marginBottom: '0.7rem' }}>Add New Project</div>
            <form className="custom-modal-form" onSubmit={handleAddProject} style={{ width: '100%' }}>
              <div className="custom-modal-fields">
                <div className="custom-modal-field">
                  <label>Project Name</label>
                  <input type="text" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} required />
                </div>
                <div className="custom-modal-field">
                  <label>Customer</label>
                  <select value={newProject.customerId} onChange={e => setNewProject({ ...newProject, customerId: e.target.value })} required>
                    <option value="">Select Customer</option>
                    {customers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="custom-modal-divider" />
                <div className="custom-modal-field">
                  <label>Status</label>
                  <select value={newProject.status} onChange={e => setNewProject({ ...newProject, status: e.target.value })} required>
                    <option value="proposal">Proposal</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
                <div className="custom-modal-field">
                  <label>Start Date</label>
                  <input type="date" value={newProject.startDate} onChange={e => setNewProject({ ...newProject, startDate: e.target.value })} />
                </div>
                <div className="custom-modal-divider" />
                <div className="custom-modal-field">
                  <label>Value ($)</label>
                  <input type="number" placeholder="Value" value={newProject.value} onChange={e => setNewProject({ ...newProject, value: e.target.value })} />
                </div>
                <div className="custom-modal-field">
                  <label>Progress (%)</label>
                  <input type="number" placeholder="Progress (%)" min="0" max="100" value={newProject.progress} onChange={e => setNewProject({ ...newProject, progress: e.target.value })} />
                </div>
              </div>
              <div className="custom-modal-actions">
                <button type="button" className="custom-modal-btn cancel" onClick={() => setShowAddProject(false)}>Cancel</button>
                <button type="submit" className="custom-modal-btn primary">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-card-header">
              <div className="project-card-header-main">
                <div className="project-name">{project.name}</div>
                <div className="project-client">Client: {getCustomerName(project.customerId)}</div>
              </div>
              <div className="project-card-header-actions">
                <span className={`project-status-badge status-${project.status.replace(/ /g, '-').toLowerCase()}`}>{project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}</span>
                <button className="project-edit-btn" title="Edit Project" onClick={() => handleEditClick(project)}>
                  <Pencil size={18} />
                </button>
                <button className="project-delete-btn" title="Delete Project" onClick={() => handleDeleteProject(project.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="project-card-details">
              <div className="project-detail-row"><span>Start Date:</span><span className="project-detail-value">{formatDate(project.startDate)}</span></div>
              <div className="project-detail-row"><span>End Date:</span><span className="project-detail-value">{project.endDate ? formatDate(project.endDate) : 'In Progress'}</span></div>
              <div className="project-detail-row"><span>Value:</span><span className="project-detail-value">${Number(project.value || 0).toLocaleString()}</span></div>
              <div className="project-detail-row"><span>Progress:</span><span className="project-detail-value">{Math.max(0, Math.min(100, Number(project.progress || 0)))}%</span></div>
              <div className="project-progress-bar-bg">
                <div className="project-progress-bar" style={{ width: `${Math.max(0, Math.min(100, Number(project.progress || 0)))}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showEditProject && currentProject && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container custom-modal-narrow">
            <button className="custom-modal-close-x" onClick={() => setShowEditProject(false)}><X size={22} /></button>
            <div className="custom-modal-title" style={{ marginBottom: '0.7rem' }}>Edit Project</div>
            <form className="custom-modal-form" onSubmit={handleUpdateProject} style={{ width: '100%' }}>
              <div className="custom-modal-fields">
                <div className="custom-modal-field">
                  <label>Project Name</label>
                  <input type="text" value={currentProject.name} onChange={e => setCurrentProject({ ...currentProject, name: e.target.value })} required />
                </div>
                <div className="custom-modal-field">
                  <label>Customer</label>
                  <select value={currentProject.customerId} onChange={e => setCurrentProject({ ...currentProject, customerId: e.target.value })} required>
                    <option value="">Select Customer</option>
                    {customers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="custom-modal-divider" />
                <div className="custom-modal-field">
                  <label>Status</label>
                  <select value={currentProject.status} onChange={e => setCurrentProject({ ...currentProject, status: e.target.value })} required>
                    <option value="proposal">Proposal</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
                <div className="custom-modal-field">
                  <label>Start Date</label>
                  <input type="date" value={currentProject.startDate} onChange={e => setCurrentProject({ ...currentProject, startDate: e.target.value })} />
                </div>
                <div className="custom-modal-divider" />
                <div className="custom-modal-field">
                  <label>Value ($)</label>
                  <input type="number" placeholder="Value" value={currentProject.value} onChange={e => setCurrentProject({ ...currentProject, value: e.target.value })} />
                </div>
                <div className="custom-modal-field">
                  <label>Progress (%)</label>
                  <input type="number" placeholder="Progress (%)" min="0" max="100" value={currentProject.progress} onChange={e => setCurrentProject({ ...currentProject, progress: e.target.value })} />
                </div>
              </div>
              <div className="custom-modal-actions">
                <button type="button" className="custom-modal-btn cancel" onClick={() => setShowEditProject(false)}>Cancel</button>
                <button type="submit" className="custom-modal-btn primary">Update Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container">
            <div className="custom-modal-icon">
              <Trash2 size={40} color="#ef4444" />
            </div>
            <h2 className="custom-modal-title">Delete Project</h2>
            <div className="custom-modal-message">Are you sure you want to delete this project? This action cannot be undone.</div>
            <div className="custom-modal-actions">
              <button type="button" className="custom-modal-btn cancel" onClick={cancelDeleteProject}>Cancel</button>
              <button type="button" className="custom-modal-btn delete" onClick={confirmDeleteProject}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;