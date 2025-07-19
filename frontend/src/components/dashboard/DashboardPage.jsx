import React, { useEffect, useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import CustomersList from '../customers/CustomersList.tsx';
import TasksList from '../tasks/TasksList.tsx';
import ProjectsOverview from '../projects/ProjectsOverview';
import RecentActivities from '../activities/RecentActivities';
import Badge from '../ui/Badge';

const DashboardPage = () => {
  const { customers, projects, tasks } = useCrm();

  // State for real customer stats
  const [projectStats, setProjectStats] = useState({
    activeProjects: { thisMonth: 0, lastMonth: 0 },
    revenue: { thisMonth: 0, lastMonth: 0 }
  });

  useEffect(() => {
    fetch('/api/projects/stats')
      .then(res => res.json())
      .then(data => setProjectStats(data))
      .catch(() => setProjectStats({
        activeProjects: { thisMonth: 0, lastMonth: 0 },
        revenue: { thisMonth: 0, lastMonth: 0 }
      }));
  }, []);

  // Calculate metrics
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const totalCustomers = customers.length;
  const totalProjects = projects.length;
  const totalRevenue = projects.reduce((acc, project) => acc + (project.value || 0), 0);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length;

  // Customer stats calculation from local data
  const customersThisMonth = customers.filter(c => c.createdAt && new Date(c.createdAt) >= startOfThisMonth).length;
  const customersLastMonth = customers.filter(c => c.createdAt && new Date(c.createdAt) >= startOfLastMonth && new Date(c.createdAt) < startOfThisMonth).length;
  const customersBeforeThisMonth = customers.filter(c => c.createdAt && new Date(c.createdAt) < startOfThisMonth).length;
  let customerPercentChange = null;
  if (customersLastMonth === 0) {
    if (customersThisMonth > 0 && customersBeforeThisMonth === 0) {
      customerPercentChange = null; // 'New!'
    } else if (customersThisMonth > 0) {
      customerPercentChange = 100;
    } else {
      customerPercentChange = 0;
    }
  } else {
    customerPercentChange = ((customersThisMonth - customersLastMonth) / Math.abs(customersLastMonth)) * 100;
  }

  // Project increase calculation using startDate
  const projectsThisMonth = projects.filter(p => p.startDate && new Date(p.startDate) >= startOfThisMonth).length;
  const projectsLastMonth = projects.filter(p => p.startDate && new Date(p.startDate) >= startOfLastMonth && new Date(p.startDate) < startOfThisMonth).length;
  let projectPercentChange = null;
  if (projectsLastMonth === 0) {
    projectPercentChange = projectsThisMonth === 0 ? 0 : null; // null means 'New!'
  } else {
    projectPercentChange = ((projectsThisMonth - projectsLastMonth) / Math.abs(projectsLastMonth)) * 100;
  }

  // Revenue increase calculation using startDate
  const revenueThisMonth = projects
    .filter(p => p.startDate && new Date(p.startDate) >= startOfThisMonth)
    .reduce((acc, p) => acc + (p.value || 0), 0);
  const revenueLastMonth = projects
    .filter(p => p.startDate && new Date(p.startDate) >= startOfLastMonth && new Date(p.startDate) < startOfThisMonth)
    .reduce((acc, p) => acc + (p.value || 0), 0);
  let revenuePercentChange = null;
  if (revenueLastMonth === 0) {
    revenuePercentChange = revenueThisMonth === 0 ? 0 : null; // null means 'New!'
  } else {
    revenuePercentChange = ((revenueThisMonth - revenueLastMonth) / Math.abs(revenueLastMonth)) * 100;
  }

  // Custom SVG icons for stats
  const CustomerIcon = () => (
    <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const ProjectIcon = () => (
    <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
      <path d="M12 11v4" />
      <path d="M10 13h4" />
    </svg>
  );

  const TaskIcon = () => (
    <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );

  const RevenueIcon = () => (
    <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Crisp rupee symbol */}
      <path d="M6 6h12M6 12h12M9 6c6 0 6 6 0 6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Stats data with SVG icons
  const stats = [
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: <CustomerIcon />,
      color: 'stat-icon-blue',
      isCustomer: true,
    },
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: <ProjectIcon />,
      color: 'stat-icon-purple',
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      icon: <TaskIcon />,
      color: 'stat-icon-yellow',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <RevenueIcon />,
      color: 'stat-icon-green',
    },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-row">
        <div className="dashboard-header-main">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="dashboard-date-time">
            <span>{currentDate}</span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Main stats cards remain unchanged */}
      <div className="dashboard-stats-grid">
        {stats.map((stat, index) => {
          let analysisText = '';
          let analysisColor = '';
          let analysisIcon = '';
          if (stat.title === 'Total Customers') {
            if (customerPercentChange === null) {
              analysisText = 'New!';
              analysisColor = 'text-green-600';
              analysisIcon = '';
            } else if (customerPercentChange > 0) {
              analysisText = `+${customerPercentChange.toFixed(1)}% from last month`;
              analysisColor = 'text-green-600';
              analysisIcon = '▲';
            } else if (customerPercentChange < 0) {
              analysisText = `${customerPercentChange.toFixed(1)}% from last month`;
              analysisColor = 'text-red-600';
              analysisIcon = '▼';
            } else {
              analysisText = 'No change from last month';
              analysisColor = 'text-gray-500';
              analysisIcon = '●';
            }
          } else if (stat.title === 'Total Projects') {
            if (projectPercentChange === null) {
              analysisText = 'New!';
              analysisColor = 'text-green-600';
              analysisIcon = '';
            } else if (projectPercentChange > 0) {
              analysisText = `+${projectPercentChange.toFixed(1)}% from last month`;
              analysisColor = 'text-green-600';
              analysisIcon = '▲';
            } else if (projectPercentChange < 0) {
              analysisText = `${projectPercentChange.toFixed(1)}% from last month`;
              analysisColor = 'text-red-600';
              analysisIcon = '▼';
            } else {
              analysisText = 'No change from last month';
              analysisColor = 'text-gray-500';
              analysisIcon = '●';
            }
          } else if (stat.title === 'Total Revenue') {
            if (revenuePercentChange === null) {
              analysisText = 'New!';
              analysisColor = 'text-green-600';
              analysisIcon = '';
            } else if (revenuePercentChange > 0) {
              analysisText = `+${revenuePercentChange.toFixed(1)}% from last month`;
              analysisColor = 'text-green-600';
              analysisIcon = '▲';
            } else if (revenuePercentChange < 0) {
              analysisText = `${revenuePercentChange.toFixed(1)}% from last month`;
              analysisColor = 'text-red-600';
              analysisIcon = '▼';
            } else {
              analysisText = 'No change from last month';
              analysisColor = 'text-gray-500';
              analysisIcon = '●';
            }
          } else if (stat.title === 'Pending Tasks') {
            analysisText = '';
            analysisColor = 'text-gray-500';
            analysisIcon = '';
          }
          return (
            <div key={index} className="dashboard-stat-card">
              <div className="dashboard-stat-item">
                <div>
                  <p className="dashboard-stat-title">{stat.title}</p>
                  <p className="dashboard-stat-value">{stat.value}</p>
                  <p className={`dashboard-stat-analysis`} style={{ marginTop: 6, fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {analysisIcon && <span className={analysisColor} style={{ fontSize: '1em', marginRight: 3 }}>{analysisIcon}</span>}
                    <span className={analysisColor}>{analysisText}</span>
                  </p>
                </div>
                <div className={`dashboard-stat-icon-container ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content: 2 cards per row, 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: 0 }}>
        <div className="dashboard-card" style={{ height: '100%' }}>
          <div style={{ padding: '24px 24px 0 24px' }}>
            <h2 className="dashboard-card-title" style={{ fontSize: '1.3rem', marginBottom: 8 }}>Project Status Overview</h2>
          </div>
          <div style={{ padding: '0 24px 24px 24px' }}>
            {/* Project Status Distribution Bar */}
            {(() => {
              const projectStats = {
                proposal: projects.filter(p => p.status === 'proposal').length,
                'in-progress': projects.filter(p => p.status === 'in-progress').length,
                completed: projects.filter(p => p.status === 'completed').length,
                'on-hold': projects.filter(p => p.status === 'on-hold').length,
              };
              const statuses = [
                { label: 'Proposal', value: projectStats.proposal, color: '#3b82f6' },
                { label: 'In Progress', value: projectStats['in-progress'], color: '#f59e42' },
                { label: 'Completed', value: projectStats.completed, color: '#22c55e' },
                { label: 'On Hold', value: projectStats['on-hold'], color: '#ef4444' },
              ];
              const total = projects.length;
              const topProjects = [...projects]
                .sort((a, b) => (b.value || 0) - (a.value || 0))
                .slice(0, 3);
              const getCustomerName = (id) => {
                const customer = customers.find(c => c.id === id);
                return customer ? customer.name : 'Unknown';
              };
              const getStatusVariant = (status) => {
                switch (status) {
                  case 'proposal': return 'primary';
                  case 'in-progress': return 'warning';
                  case 'completed': return 'success';
                  case 'on-hold': return 'danger';
                  default: return 'default';
                }
              };
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontWeight: 500, color: '#6b7280' }}>Project Status Distribution</div>
                    <div style={{ fontWeight: 500, color: '#374151' }}>{total} Total</div>
                  </div>
                  <div style={{ background: '#e5e7eb', height: '18px', borderRadius: '9px', overflow: 'hidden', display: 'flex', marginBottom: 8 }}>
                    {statuses.map((status, idx) => (
                      <div
                        key={status.label}
                        style={{ background: status.color, height: '100%', width: total ? `${(status.value / total) * 100}%` : 0, transition: 'width 0.3s' }}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 16, fontSize: 14 }}>
                    {statuses.map((status, idx) => (
                      <div key={status.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: status.color, marginRight: 4 }}></span>
                        <span style={{ color: '#374151' }}>{status.label}: {status.value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Top Projects by Value */}
                  <div style={{ fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>Top Projects by Value</div>
                  <div>
                    {topProjects.map((project, idx) => (
                      <div key={project.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < topProjects.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 16 }}>{project.name}</div>
                          <div style={{ color: '#6b7280', fontSize: 13 }}>{getCustomerName(project.customerId)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ fontWeight: 600, fontSize: 16, color: '#b91c1c', minWidth: 90, textAlign: 'right' }}>
                            {project.value ? project.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : '-'}
                          </div>
                          <Badge variant={getStatusVariant(project.status)}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        <div className="dashboard-card" style={{ height: '100%' }}>
          <h3 className="dashboard-card-title">Recent Activities</h3>
          <RecentActivities limit={5} />
        </div>
        <div className="dashboard-card" style={{ height: '100%' }}>
          <h3 className="dashboard-card-title">Top Customers</h3>
          <CustomersList limit={5} />
        </div>
        <div className="dashboard-card" style={{ height: '100%' }}>
          <h3 className="dashboard-card-title">Upcoming Tasks</h3>
          <TasksList limit={5} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;