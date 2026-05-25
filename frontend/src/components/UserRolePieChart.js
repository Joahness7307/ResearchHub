import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// 💡 NEW IMPORT
import ChartDataLabels from 'chartjs-plugin-datalabels'; 

// Register Chart.js components and the new plugin
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels); // 💡 REGISTER PLUGIN

// Define a map for role display names and colors
const ROLE_CONFIG = {
    research_coordinator: { label: "Research Coordinator", color: '#fcd34d' }, 
    admin: { label: "Admin", color: '#f87171' },           
    research_adviser: { label: "Research Adviser", color: '#34d399' }, 
    student: { label: "Student", color: '#60a5fa' },       
    guest: { label: "Guest", color: '#a78bfa' },           
    // Add any other roles you might have
};

const UserRolePieChart = ({ users = [] }) => {
    // 1. Calculate the role counts
    const roleCounts = users.reduce((acc, user) => {
        const role = user.role || 'guest';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    // 2. Prepare data for Chart.js
    const roles = Object.keys(roleCounts).filter(role => roleCounts[role] > 0);
    const counts = roles.map(role => roleCounts[role]);
    const totalUsers = users.length;
    
    // Get labels and colors from the config map
    const labels = roles.map(role => ROLE_CONFIG[role] ? ROLE_CONFIG[role].label : role);
    const backgroundColors = roles.map(role => ROLE_CONFIG[role] ? ROLE_CONFIG[role].color : '#9ca3af'); 

    const data = {
        labels: labels,
        datasets: [
            {
                data: counts,
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
                formatter: (value, context) => {
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = (value * 100 / total).toFixed(1);
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
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        const value = context.parsed;
                        const percentage = ((value / totalUsers) * 100).toFixed(1) + '%';
                        return `${label}${value} (${percentage})`;
                    }
                }
            },
        },
    };

    if (totalUsers === 0) {
        return <p>No user data available for charting.</p>;
    }

    return (
        <div style={{ height: '300px', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <Pie data={data} options={options} />
        </div>
    );
};

export default UserRolePieChart;