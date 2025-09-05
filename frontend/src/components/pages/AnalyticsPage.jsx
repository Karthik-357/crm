
import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './AnalyticsPage.css';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { useCrm } from '../../context/CrmContext';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Create a clean chart instance without any problematic plugins
const cleanChartJS = ChartJS.createChart;
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Completely disable data labels plugin
ChartJS.defaults.plugins.datalabels = {
  display: false
};

// Disable any center text plugins
ChartJS.defaults.plugins.centerText = {
  display: false
};

const AnalyticsPage = () => {
  const { customers, projects, tasks, activities, events } = useCrm();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const loading = !customers.length && !projects.length && !tasks.length;
  const error = false; // You can add error handling from context if needed

  // Compute status breakdowns
  const customerStatusCounts = useMemo(() => {
    const statusMap = { Active: 0, Inactive: 0, Prospect: 0 };
    customers.forEach(c => {
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    });
    return statusMap;
  }, [customers]);

  const projectStatusCounts = useMemo(() => {
    const statusMap = { 'in-progress': 0, completed: 0, 'on-hold': 0, proposal: 0 };
    projects.forEach(p => {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    });
    // Prettify labels
    return {
      'in-progress': statusMap['in-progress'] || 0,
      completed: statusMap.completed || 0,
      'on-hold': statusMap['on-hold'] || 0,
      proposal: statusMap.proposal || 0,
    };
  }, [projects]);

  const taskStatusCounts = useMemo(() => {
    const statusMap = { 'todo': 0, 'in-progress': 0, 'completed': 0 };
    tasks.forEach(t => {
      statusMap[t.status] = (statusMap[t.status] || 0) + 1;
    });
    return statusMap;
  }, [tasks]);

  // Revenue trend by month for selected year
  const revenueByMonth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenue = Array(12).fill(0);
    
    // Calculate revenue from project values based on start date
    projects.forEach(project => {
      if (project.startDate && project.value) {
        const d = new Date(project.startDate);
        if (d.getFullYear() === selectedYear) {
          revenue[d.getMonth()] += project.value || 0;
        }
      }
    });
    

    
    return { months, revenue };
  }, [projects, selectedYear]);

  // Customers added per month for selected year
  const customersByMonth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = Array(12).fill(0);
    customers.forEach(c => {
      const date = c.createdAt ? new Date(c.createdAt) : null;
      if (date && date.getFullYear() === selectedYear) {
        counts[date.getMonth()] += 1;
      }
    });
    return { months, counts };
  }, [customers, selectedYear]);

  // Tasks by month segmented by status (last 6 months)
  const tasksByRecentMonths = useMemo(() => {
    const now = new Date();
    const labels = [];
    const statuses = ['todo', 'in-progress', 'completed'];
    const datasets = statuses.map(s => ({ key: s, data: Array(6).fill(0) }));
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      labels.push(label);
      const month = d.getMonth();
      const year = d.getFullYear();
      tasks.forEach(t => {
        const date = t.createdAt ? new Date(t.createdAt) : (t.dueDate ? new Date(t.dueDate) : null);
        if (!date) return;
        if (date.getMonth() === month && date.getFullYear() === year) {
          const idx = statuses.indexOf(t.status);
          if (idx >= 0) datasets[idx].data[labels.length - 1] += 1;
        }
      });
    }
    return { labels, datasets };
  }, [tasks]);

  // Chart data
  // Refined color palettes for premium look
  const refinedColors = [
    '#2563eb', // blue
    '#f59e42', // orange
    '#10b981', // green
    '#a78bfa', // purple
    '#f43f5e', // red
    '#fbbf24', // yellow
    '#14b8a6', // teal
    '#6366f1', // indigo
    '#f472b6', // pink
    '#34d399', // emerald
  ];

  // Only show non-zero statuses in legend and chart
  const filterNonZero = (counts) => Object.entries(counts).filter(([_, v]) => v > 0);

  const customerStatusEntries = filterNonZero(customerStatusCounts);
  const projectStatusEntries = filterNonZero(projectStatusCounts);
  const taskStatusEntries = filterNonZero(taskStatusCounts);

  const buildDoughnutData = (entries, paletteStart = 0, label = '') => {
    const labels = entries.map(([k]) => k);
    const values = entries.map(([_, v]) => v);
    const maxVal = Math.max(0, ...values);
    const offsets = values.map(v => (v === maxVal && values.length > 1 ? 10 : 0));
    return {
      labels,
      datasets: [
        {
          label,
          data: values,
          backgroundColor: refinedColors.slice(paletteStart, paletteStart + labels.length),
          borderWidth: 2,
          borderColor: '#e6eaf5',
          hoverOffset: 14,
          spacing: 3,
          borderRadius: 10,
          offset: offsets,
          cutout: '58%',
        },
      ],
    };
  };

  const customerStatusData = buildDoughnutData(customerStatusEntries, 0, 'Customers');
  const projectStatusData = buildDoughnutData(projectStatusEntries, 2, 'Projects');
  const taskStatusData = buildDoughnutData(taskStatusEntries, 4, 'Tasks');

  // Pie chart options for premium look
  const pieOptions = {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 16,
          padding: 16,
          font: { size: 15, family: 'Inter, Arial, sans-serif', weight: 'bold' },
          color: '#222',
          usePointStyle: true,
        },
      },
      datalabels: {
        color: '#111827',
        font: { weight: '600', size: 12 },
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = total ? Math.round((value / total) * 100) : 0;
          return pct >= 8 ? `${pct}%` : '';
        },
        align: 'center',
        anchor: 'center',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const data = context.dataset.data;
            const total = data.reduce((a, b) => a + b, 0);
            const pct = total ? Math.round((value / total) * 100) : 0;
            return `${context.label}: ${value} (${pct}%)`;
          }
        }
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 900,
      easing: 'easeOutQuart',
    },
    layout: {
      padding: 18,
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const revenueTrendData = {
    labels: revenueByMonth.months,
    datasets: [
      {
        label: 'Revenue',
        data: revenueByMonth.revenue,
        backgroundColor: 'rgba(54,162,235,0.1)',
        borderColor: '#36A2EB',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#36A2EB',
        tension: 0.2
      }
    ],
  };

  const customerGrowthData = {
    labels: customersByMonth.months,
    datasets: [
      {
        label: 'New Customers',
        data: customersByMonth.counts,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.25)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const tasksByMonthData = {
    labels: tasksByRecentMonths.labels,
    datasets: tasksByRecentMonths.datasets.map((ds, i) => ({
      label: ds.key,
      data: ds.data,
      backgroundColor: refinedColors[i],
      borderWidth: 1,
    })),
  };

  // Summary stats
  const totalCustomers = customers.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const totalRevenue = revenueByMonth.revenue.reduce((a, b) => a + b, 0);

  // Extra insights
  const avgProjectValue = totalProjects ? Math.round(projects.reduce((a, p) => a + (p.value || 0), 0) / totalProjects) : 0;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = totalTasks ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  const highestRevenueIdx = revenueByMonth.revenue.reduce((bestIdx, val, idx, arr) => (val > (arr[bestIdx] || 0) ? idx : bestIdx), 0);
  const highestRevenueMonth = revenueByMonth.months[highestRevenueIdx];

  // Top customers by project value
  const topCustomers = useMemo(() => {
    const idToTotal = new Map();
    projects.forEach(p => {
      if (!p.customerId) return;
      idToTotal.set(p.customerId, (idToTotal.get(p.customerId) || 0) + (p.value || 0));
    });
    const enriched = customers.map(c => ({ id: c.id, name: c.name, total: idToTotal.get(c.id) || 0 }));
    return enriched.sort((a, b) => b.total - a.total).slice(0, 5);
  }, [projects, customers]);

  // Export chart as image
  const exportChart = (chartId) => {
    const chartCanvas = document.getElementById(chartId);
    if (chartCanvas) {
      const url = chartCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartId}.png`;
      link.click();
    }
  };


  // Export entire analytics section as PDF
  const exportAnalyticsPDF = async () => {
    try {
      const exportBtn = document.querySelector('.main-export');
      if (exportBtn) exportBtn.style.display = 'none';
      
      const analyticsSection = document.querySelector('.analytics-page');
      if (!analyticsSection) {
        console.error('Analytics section not found');
        return;
      }
      
      const canvas = await html2canvas(analyticsSection);
      if (exportBtn) exportBtn.style.display = '';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Fit image to page
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
      const imgWidth = imgProps.width * ratio;
      const imgHeight = imgProps.height * ratio;
      
      pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 20, imgWidth, imgHeight);
      const monthName = new Date().toLocaleString('default', { month: 'long' });
      pdf.save(`CRM_Analytics_${monthName}_${new Date().getFullYear()}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <div className="analytics-page">
      <h2>Analytics</h2>
      <button className="export-btn main-export" aria-label="Export All Analytics as PDF" onClick={exportAnalyticsPDF} style={{marginBottom: '1.5rem'}}>
        Export All as PDF
      </button>
      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : error ? (
        <div className="error">Error loading analytics data.</div>
      ) : (
        <>
          {/* Minimal doughnut styling shared across status charts */}
          {(() => {
            pieOptions.plugins.datalabels = { display: false };
            pieOptions.cutout = '70%';
            return null;
          })()}
          <div className="summary-stats" aria-label="Summary statistics">
            <div className="stat" tabIndex={0}>Total Customers: <strong>{totalCustomers}</strong></div>
            <div className="stat" tabIndex={0}>Total Projects: <strong>{totalProjects}</strong></div>
            <div className="stat" tabIndex={0}>Total Tasks: <strong>{totalTasks}</strong></div>
            <div className="stat" tabIndex={0}>Total Revenue: <strong>₹{totalRevenue.toLocaleString('en-IN')}</strong></div>
          </div>
          <div className="insights-grid" aria-label="Key insights">
            <div className="insight-card">
              <div className="insight-title">Avg Project Value</div>
              <div className="insight-value">₹{avgProjectValue.toLocaleString('en-IN')}</div>
            </div>
            <div className="insight-card">
              <div className="insight-title">Task Completion</div>
              <div className="insight-value">{taskCompletionRate}%</div>
            </div>
            <div className="insight-card">
              <div className="insight-title">Highest Revenue Month</div>
              <div className="insight-value">{highestRevenueMonth}</div>
            </div>
          </div>
          <div className="charts-container">
            <div className="chart-block premium-chart">
              <h3>Customer Status</h3>
              <div className="pie-wrapper">
                <Doughnut
                  data={{
                    labels: customerStatusEntries.map(([k]) => k),
                    datasets: [{
                      label: 'Customers',
                      data: customerStatusEntries.map(([_, v]) => v),
                      backgroundColor: refinedColors.slice(0, customerStatusEntries.length),
                      borderColor: '#ffffff',
                      borderWidth: 2,
                      spacing: 2,
                      borderRadius: 6,
                    }]
                  }}
                  options={pieOptions}
                  id="customerStatusChart"
                />
              </div>
            </div>
            <div className="chart-block premium-chart">
              <h3>Project Status</h3>
              <div className="pie-wrapper">
                <Doughnut
                  data={{
                    labels: projectStatusEntries.map(([k]) => k.replace('-', ' ')),
                    datasets: [{
                      label: 'Projects',
                      data: projectStatusEntries.map(([_, v]) => v),
                      backgroundColor: refinedColors.slice(2, 2 + projectStatusEntries.length),
                      borderColor: '#ffffff',
                      borderWidth: 2,
                      spacing: 2,
                      borderRadius: 6,
                    }]
                  }}
                  options={pieOptions}
                  id="projectStatusChart"
                />
              </div>
            </div>
            <div className="chart-block premium-chart">
              <h3>Task Status</h3>
              <div className="pie-wrapper">
                <Doughnut
                  data={{
                    labels: taskStatusEntries.map(([k]) => k.replace('-', ' ')),
                    datasets: [{
                      label: 'Tasks',
                      data: taskStatusEntries.map(([_, v]) => v),
                      backgroundColor: refinedColors.slice(4, 4 + taskStatusEntries.length),
                      borderColor: '#ffffff',
                      borderWidth: 2,
                      spacing: 2,
                      borderRadius: 6,
                    }]
                  }}
                  options={pieOptions}
                  id="taskStatusChart"
                />
              </div>
            </div>
            <div className="chart-block">
              <h3>Revenue Trend</h3>
              <div className="filter-row">
                <label htmlFor="year-select">Year:</label>
                <select id="year-select" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                  {(() => {
                    const projectYears = Array.from(new Set(projects.filter(p => p.startDate).map(p => new Date(p.startDate).getFullYear())));
                    if (projectYears.length === 0) {
                      return [new Date().getFullYear()].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ));
                    }
                    return projectYears.sort((a, b) => b - a).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ));
                  })()}
                </select>
              </div>
              <Line 
                data={revenueTrendData} 
                id="revenueTrendChart" 
                options={{ 
                  responsive: true,
                  plugins: { 
                    legend: { position: 'top' }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
            <div className="chart-block">
              <h3>Customer Growth</h3>
              <Line data={customerGrowthData} id="customerGrowthChart" options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>
            <div className="chart-block">
              <h3>Tasks by Month</h3>
              <Bar
                data={tasksByMonthData}
                id="tasksByMonthChart"
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top' } },
                  scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                }}
              />
            </div>
            <div className="chart-block">
              <h3>Top Customers by Revenue</h3>
              <div className="top-customers">
                {topCustomers.length === 0 ? (
                  <div className="empty-note">No revenue data yet.</div>
                ) : (
                  topCustomers.map((c, idx) => (
                    <div key={c.id || idx} className="top-customer-row">
                      <div className="top-customer-rank">#{idx + 1}</div>
                      <div className="top-customer-name">{c.name || 'Unnamed'}</div>
                      <div className="top-customer-value">₹{(c.total || 0).toLocaleString('en-IN')}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
