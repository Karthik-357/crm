import React from 'react';
import { useCrm } from '../../context/CrmContext';

const ProjectsOverview = () => {
  const { projects } = useCrm();

  // Calculate project counts by status
  const planningCount = projects.filter(p => p.status === 'planning').length;
  const inProgressCount = projects.filter(p => p.status === 'in-progress').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const totalProjects = projects.length;

  return (
    <div className="projects-overview">
      <p>Total Projects: {totalProjects}</p>
      <ul>
        <li>Planning: {planningCount}</li>
        <li>In Progress: {inProgressCount}</li>
        <li>Completed: {completedCount}</li>
      </ul>
      {/* Add more project overview details here */}
    </div>
  );
};

export default ProjectsOverview; 