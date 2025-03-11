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
            chartType === 'revenue' ? item.monthlyRevenue : item.monthlyReservations
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

  const calculateGrowthRate = (currentValue, lastValue) => {
    if (!lastValue || lastValue === 0) return 0;
    return ((currentValue - lastValue) / lastValue * 100).toFixed(1);
  };

  const getMonthlyStats = () => {
    if (!financeData?.monthlyData || financeData.monthlyData.length < 2) {
      return {
        revenue: { current: 0, growth: 0 },
        reservations: { current: 0, growth: 0 },
        averageRevenue: { current: 0, growth: 0 }
      };
    }

    // sorted by month
    const sortedData = [...financeData.monthlyData].sort((a, b) => b.month.localeCompare(a.month));
    
    // get the data from last two month
    const currentMonth = sortedData[0];
    const lastMonth = sortedData[1];

    return {
      revenue: {
        current: currentMonth.monthlyRevenue,
        growth: calculateGrowthRate(currentMonth.monthlyRevenue, lastMonth.monthlyRevenue)
      },
      reservations: {
        current: currentMonth.monthlyReservations,
        growth: calculateGrowthRate(currentMonth.monthlyReservations, lastMonth.monthlyReservations)
      },
      averageRevenue: {
        current: currentMonth.monthlyRevenue,
        growth: calculateGrowthRate(currentMonth.monthlyRevenue, lastMonth.monthlyRevenue)
      }
    };
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold mb-4">Financial Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Total Revenue</h2>
            <p className="text-2xl font-bold">
              ${financeData?.monthlyData.reduce((sum, item) => sum + item.monthlyRevenue, 0) || 0}
            </p>
            <p className={`text-sm ${Number(getMonthlyStats().revenue.growth) > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(getMonthlyStats().revenue.growth) > 0 ? '+' : ''}
              {getMonthlyStats().revenue.growth}% from last month
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Total Reservations</h2>
            <p className="text-2xl font-bold">
              {financeData?.monthlyData.reduce((sum, item) => sum + item.monthlyReservations, 0) || 0}
            </p>
            <p className={`text-sm ${Number(getMonthlyStats().reservations.growth) > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(getMonthlyStats().reservations.growth) > 0 ? '+' : ''}
              {getMonthlyStats().reservations.growth}% from last month
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Average Monthly Revenue</h2>
            <p className="text-2xl font-bold">
              ${financeData?.monthlyData.length > 0 
                ? Math.round(financeData.monthlyData.reduce((sum, item) => sum + item.monthlyRevenue, 0) / financeData.monthlyData.length)
                : 0}
            </p>
            <p className={`text-sm ${Number(getMonthlyStats().averageRevenue.growth) > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(getMonthlyStats().averageRevenue.growth) > 0 ? '+' : ''}
              {getMonthlyStats().averageRevenue.growth}% from last month
            </p>
          </div>
        </div>

        

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          {/* chart change button */}
          <div className="flex space-x-4">
            <button
              onClick={() => setChartType('revenue')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-0 focus:outline-none focus:ring-0 ${
                chartType === 'revenue'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Revenue Chart
            </button>
            <button
              onClick={() => setChartType('reservations')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-0 focus:outline-none focus:ring-0 ${
                chartType === 'reservations'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
    </div>
  );
}
