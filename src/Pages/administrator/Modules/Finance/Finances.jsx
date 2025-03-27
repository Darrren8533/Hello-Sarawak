import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchFinance } from '../../../../../Api/api';
import './Finances.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function FinancialDashboard() {
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('revenue');

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const data = await fetchFinance();
        if (!data || !data.monthlyData) {
          throw new Error('No finance data available');
        }
        setFinanceData(data);
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  const renderChart = () => {
    if (!financeData?.monthlyData) return null;

    const chartData = {
      labels: financeData.monthlyData.map(item => item.month),
      datasets: [
        {
          label: chartType === 'revenue' ? 'Monthly Revenue' : 'Monthly Reservations',
          data: financeData.monthlyData.map(item => 
            chartType === 'revenue' ? item.monthly_revenue : item.monthly_reservations
          ),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.3,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: chartType === 'revenue' ? 'Monthly Revenue Trend' : 'Monthly Reservations Trend'
        },
        tooltip: {
          callbacks: {
            label: (context) => chartType === 'revenue' 
              ? `Revenue: $${context.parsed.y}`
              : `Reservations: ${context.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: chartType === 'revenue' ? 'Revenue ($)' : 'Number of Reservations'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        }
      }
    };

    return <Line data={chartData} options={options} />;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Financial Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setChartType('revenue')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-0 focus:outline-none focus:ring-0 ${
              chartType === 'revenue' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Revenue Chart
          </button>
          <button
            onClick={() => setChartType('reservations')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-0 focus:outline-none focus:ring-0 ${
              chartType === 'reservations' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Reservations Chart
          </button>
        </div>
        <div className="h-[500px] w-full">
          {renderChart()}
        </div>
      </div>
    </div>
  );
}
