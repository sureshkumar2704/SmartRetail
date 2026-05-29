import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const palette = ['#00D4AA', '#F59E0B', '#EF4444', '#60A5FA', '#A78BFA', '#34D399'];

export function RevenueLineChart({ labels, values, dashed = false }) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: values,
            borderColor: '#00D4AA',
            backgroundColor: 'rgba(0, 212, 170, 0.18)',
            tension: 0.35,
            fill: true,
            borderDash: dashed ? [8, 6] : undefined,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        },
      }}
    />
  );
}

export function CategoryDonutChart({ labels, values }) {
  return (
    <Doughnut
      data={{ labels, datasets: [{ data: values, backgroundColor: palette, borderWidth: 0 }] }}
      options={{ plugins: { legend: { labels: { color: '#E5E7EB' } } } }}
    />
  );
}

export function BarChartHorizontal({ labels, values, title }) {
  return (
    <Bar
      data={{ labels, datasets: [{ label: title ?? 'Value', data: values, backgroundColor: '#00D4AA' }] }}
      options={{
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        },
      }}
    />
  );
}

export function BarsChart({ labels, values }) {
  return <Bar data={{ labels, datasets: [{ label: 'Sales', data: values, backgroundColor: '#F59E0B' }] }} options={{ plugins: { legend: { display: false } } }} />;
}