import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components and plugin
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// Define status config with labels and colors (matching your CSS variables)
const STATUS_CONFIG = {
    pending: { label: "Pending", color: '#f59e0b' },     // warning color
    endorsed: { label: "Endorsed", color: '#10b981' },    // success color
    revision: { label: "Revision", color: '#ef4444' },    // danger color
    approved: { label: "Approved", color: '#3b82f6' },    // primary color
};

const ProjectStatusPieChart = ({ counts = {} }) => {
    // Get non-zero status counts
    const statuses = Object.keys(STATUS_CONFIG).filter(status => counts[status] > 0);
    const statusCounts = statuses.map(status => counts[status]);
    const totalProjects = statusCounts.reduce((sum, count) => sum + count, 0);
    
    // Get labels and colors from config
    const labels = statuses.map(status => STATUS_CONFIG[status].label);
    const backgroundColors = statuses.map(status => STATUS_CONFIG[status].color);
    
    const data = {
        labels,
        datasets: [
            {
                data: statusCounts,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: backgroundColors.map(color => color + 'b0'),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                }
            },
            datalabels: {
                formatter: (value) => {
                    const percentage = ((value / totalProjects) * 100).toFixed(1);
                    return percentage + '%';
                },
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 14,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const percentage = ((value / totalProjects) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
    };

    return (
        <div style={{ height: '300px', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <Pie data={data} options={options} />
        </div>
    );
};

export default ProjectStatusPieChart;