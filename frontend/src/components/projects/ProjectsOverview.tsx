import React from 'react';
import { useCrm } from '../../context/CrmContext';
import Badge from '../ui/Badge';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectsOverview = () => {
  const { projects, customers } = useCrm();

  const projectStats = {
    proposal: projects.filter(p => p.status === 'proposal').length,
    'in-progress': projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
  };

  const statuses = [
    { label: 'Proposal', value: projectStats.proposal, color: 'bg-blue-500' },
    { label: 'In Progress', value: projectStats['in-progress'], color: 'bg-yellow-500' },
    { label: 'Completed', value: projectStats.completed, color: 'bg-green-500' },
    { label: 'On Hold', value: projectStats['on-hold'], color: 'bg-red-500' },
  ];

  const topProjects = projects.slice(0, 3);

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown';
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

  const doughnutData = {
    labels: statuses.map(s => s.label),
    datasets: [
      {
        data: statuses.map(s => s.value),
        backgroundColor: [
          '#3b82f6', // blue
          '#f59e42', // yellow
          '#22c55e', // green
          '#ef4444', // red
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>Project Status Distribution</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>{projects.length} Total</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ width: '160px', height: '160px' }}>
            <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ background: '#e5e7eb', height: '16px', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
              {statuses.map((status, index) => (
                <div
                  key={index}
                  style={{ background: doughnutData.datasets[0].backgroundColor[index], height: '100%', width: `${(status.value / projects.length) * 100}%` }}
                ></div>
              ))}
            </div>
            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '14px' }}>
              {statuses.map((status, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ height: '12px', width: '12px', borderRadius: '50%', background: doughnutData.datasets[0].backgroundColor[index], marginRight: '8px' }}></div>
                  <div style={{ color: '#374151' }}>{status.label}: {status.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="text-sm font-medium text-gray-500 mb-3">Top Projects</div>
        {topProjects.map((project) => (
          <div key={project.id} className="flex justify-between items-center py-2 border-b">
            <div>
              <div className="font-medium text-sm">{project.name}</div>
              <div className="text-xs text-gray-500">{getCustomerName(project.customerId)}</div>
            </div>
            <div className="space-y-1 text-right">
              <Badge variant={getStatusVariant(project.status)}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsOverview;