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
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Custom center text plugin for doughnut charts
const CenterTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart, args, opts) => {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) return;
    const dataset = data.datasets?.[0];
    if (!dataset) return;
    const total = (dataset.data || []).reduce((a, b) => a + (Number(b) || 0), 0);
    const { left, right, top, bottom } = chartArea;
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Inter, Arial, sans-serif';
    ctx.fillText(total.toString(), x, y - 8);
    ctx.font = '500 11px Inter, Arial, sans-serif';
    ctx.fillText('Total', x, y + 12);
    ctx.restore();
  }
};

// Register all Chart.js components once
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
  Filler,
  ChartDataLabels,
  CenterTextPlugin
);

export default ChartJS;
export { CenterTextPlugin };
