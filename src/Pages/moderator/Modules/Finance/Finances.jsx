import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Loader from '../../../../Component/Loader/Loader';
import { fetchFinance, fetchOccupancyRate, fetchRevPAR, fetchCancellationRate, fetchCustomerRetentionRate, fetchGuestSatisfactionScore, fetchALOS } from "../../../../../Api/api";
import { useQuery } from "@tanstack/react-query";
import "./Finances.css";

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
  const [chartType, setChartType] = useState("revenue");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const userid = localStorage.getItem('userid');

  const {
    data: financeData,
    isLoading: financeLoading,
    error: financeError
  } = useQuery({
    queryKey: ['finance', userid], 
    queryFn: () => fetchFinance(userid),
    enabled: !!userid
  });

  const { 
    data: occupancyData,
    isLoading: occupancyLoading,
    error: occupancyError
  } = useQuery({
    queryKey: ['occupancy_rate', userid],
    queryFn: () => fetchOccupancyRate(userid),
    enabled: !!userid
  });

  const {
    data: revPARData,
    isLoading: revPARLoading,
    error: revPARError
  } = useQuery({
    queryKey: ['revpar', userid],
    queryFn: () => fetchRevPAR(userid),
    enabled: !!userid 
  });

  const { 
    data: cancellationRateData,
    isLoading: cancellationRateLoading,
    error: cancellationRateError
  } = useQuery({
    queryKey: ['cancellation_rate', userid],
    queryFn: () => fetchCancellationRate(userid),
    enabled: !!userid
  });

  const { 
    data: customerRetentionRateData,
    isLoading: customerRetentionRateLoading,
    error: customerRetentionRateError
  } = useQuery({
    queryKey: ['customerRetentionRate', userid],
    queryFn: () => fetchCustomerRetentionRate(userid),
    enabled: !!userid
  });

  const { 
    data: guestSatisfactionScoreData,
    isLoading: guestSatisfactionScoreLoading,
    error: guestSatisfactionScoreError
  } = useQuery({
    queryKey: ['guestSatisfactionScore', userid],
    queryFn: () => fetchGuestSatisfactionScore(userid),
    enabled: !!userid
  });

  const { 
    data: alosData,
    isLoading: alosLoading,
    error: alosError
  } = useQuery({
    queryKey: ['alos', userid],
    queryFn: () => fetchALOS(userid),
    enabled: !!userid
  });

  if (financeLoading) return <div className="loader-box"><Loader /></div>;
  if (financeError) return <div>Error: {financeError.message}</div>;

  const renderChart = () => {
    if (!filteredFinanceData?.monthlyData || filteredFinanceData.monthlyData.length === 0) {
      return <h1>No reservations made yet.</h1>;
    }

    if (chartType === "occupancy") {
      const data = filteredOccupancyData?.monthlyData;
    
      if (!data || data.length === 0) {
        return <div>No occupancy data available</div>;
      }
    
      const occupancyChartData = {
        labels: data.map((item) => item.month),
        datasets: [
          {
            label: "Occupancy Rate (%)",
            data: data.map((item) =>
              item.occupancy_rate !== null ? parseFloat(item.occupancy_rate.toFixed(2)) : 0
            ),
            fill: false,
            borderColor: "rgb(153, 102, 255)",
            tension: 0.3,
            pointBackgroundColor: "rgb(153, 102, 255)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      };
    
      const occupancyOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: `Monthly Occupancy Rate Trend - ${selectedYear}`,
          },
          tooltip: {
            callbacks: {
              label: (context) => `Occupancy Rate: ${context.parsed.y.toFixed(2)}%`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Occupancy Rate (%)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Month",
            },
          },
        },
      };
    
      return <Line data={occupancyChartData} options={occupancyOptions} />;
    }

    if (chartType === "revpar") {
      if (!filteredRevPARData?.monthlyData || filteredRevPARData.monthlyData.length === 0) {
        return <div>No RevPAR data</div>;
      }
    
      const months = filteredRevPARData.monthlyData.map((entry) => entry.month);
      const revparValues = filteredRevPARData.monthlyData.map((entry) =>
        parseFloat(entry.revpar)
      );
    
      const revparChartData = {
        labels: months,
        datasets: [
          {
            label: "RevPAR ($)",
            data: revparValues,
            fill: false,
            borderColor: "rgb(255, 159, 64)",
            tension: 0.3,
            pointBackgroundColor: "rgb(255, 159, 64)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      };
    
      const revparOptions = {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: `Monthly RevPAR - ${selectedYear}` },
          tooltip: {
            callbacks: {
              label: (context) =>
                `RevPAR: $${context.parsed.y?.toFixed(2) ?? 0}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "RevPAR ($)" },
          },
          x: {
            title: { display: true, text: "Month" },
          },
        },
      };
    
      return <Line data={revparChartData} options={revparOptions} />;
    }

    if (chartType === "cancellation") {
      if (!filteredCancellationRateData?.monthlyData || filteredCancellationRateData.monthlyData.length === 0) {
        return <div>No cancellation data available</div>;
      }
    
      const months = filteredCancellationRateData.monthlyData.map((item) => item.month); 
      const cancellationRates = filteredCancellationRateData.monthlyData.map((item) =>
        parseFloat(item.cancellation_rate)
      );
    
      const cancellationRateChartData = {
        labels: months, 
        datasets: [
          {
            label: "Cancellation Rate (%)",
            data: cancellationRates,
            fill: false,
            borderColor: "rgb(255, 0, 0)",
            tension: 0.3,
            pointBackgroundColor: "rgb(255, 0, 0)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      };
    
      const cancellationRateOptions = {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: `Monthly Cancellation Rate - ${selectedYear}` },
          tooltip: {
            callbacks: {
              label: (context) =>
                `Cancellation Rate: ${context.parsed.y?.toFixed(2)}%`, 
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100, 
            title: { display: true, text: "Cancellation Rate (%)" },
          },
          x: {
            title: { display: true, text: "Month" },
          },
        },
      };
    
      return <Line data={cancellationRateChartData} options={cancellationRateOptions} />;
    }

    if (chartType === "retention") {
      if (
        !filteredCustomerRetentionRateData?.monthlyData ||
        filteredCustomerRetentionRateData.monthlyData.length === 0
      ) {
        return <div>No Retention Rate data available</div>;
      }
    
      const retentionRateChartData = {
        labels: filteredCustomerRetentionRateData.monthlyData.map((item) => item.month),
        datasets: [
          {
            label: "Retention Rate (%)",
            data: filteredCustomerRetentionRateData.monthlyData.map((item) =>
              parseFloat(item.customer_retention_rate)
            ),
            fill: false,
            borderColor: "rgb(54, 162, 235)",
            tension: 0.3,
            pointBackgroundColor: "rgb(54, 162, 235)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      };
    
      const retentionRateOptions = {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: `Monthly Customer Retention Rate Trend - ${selectedYear}` },
          tooltip: {
            callbacks: {
              label: (context) =>
                `Retention Rate: ${context.parsed.y.toFixed(2)}%`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: "Retention Rate (%)" },
          },
          x: {
            title: { display: true, text: "Month" },
          },
        },
      };
    
      return <Line data={retentionRateChartData} options={retentionRateOptions} />;
    }

    if (chartType === "satisfaction") {
      if (
        !filteredGuestSatisfactionScoreData?.monthlyData ||
        filteredGuestSatisfactionScoreData.monthlyData.length === 0
      ) {
        return <div>No Guest Satisfaction Score data</div>;
      }
    
      const guestSatisfactionChartData = {
        labels: filteredGuestSatisfactionScoreData.monthlyData.map((item) => item.month),
        datasets: [
          {
            label: "Guest Satisfaction Score",
            data: filteredGuestSatisfactionScoreData.monthlyData.map((item) =>
              parseFloat(item.guest_satisfaction_score)
            ),
            fill: false,
            borderColor: "rgb(255, 99, 132)",
            tension: 0.3,
            pointBackgroundColor: "rgb(255, 99, 132)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      };
    
      const guestSatisfactionOptions = {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: `Monthly Guest Satisfaction Score - ${selectedYear}` },
          tooltip: {
            callbacks: {
              label: (context) => `Score: ${context.parsed.y.toFixed(2)}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            title: { display: true, text: "Average Score" },
          },
          x: {
            title: { display: true, text: "Month" },
          },
        },
      };
    
      return (
        <Line data={guestSatisfactionChartData} options={guestSatisfactionOptions} />
      );
    }

    if (chartType === "alos") {
      if (!filteredALOSData?.monthlyData || filteredALOSData.monthlyData.length === 0) {
        return <div>No Average Length of Stay data</div>;
      }
    
      const alosChartData = {
        labels: filteredALOSData.monthlyData.map((item) => item.month),
        datasets: [
          {
            label: "Average Length of Stay (Days)",
            data: filteredALOSData.monthlyData.map((item) => parseFloat(item.average_length_of_stay)),
            fill: false,
            borderColor: "rgb(255, 205, 86)",
            tension: 0.3,
            pointBackgroundColor: "rgb(255, 205, 86)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      };
    
      const alosChartOptions = {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: `Average Length of Stay (Monthly) - ${selectedYear}` },
          tooltip: {
            callbacks: {
              label: (context) => `ALOS: ${context.parsed.y.toFixed(2)} days`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Days" },
          },
          x: {
            title: { display: true, text: "Month" },
          },
        },
      };
    
      return <Line data={alosChartData} options={alosChartOptions} />;
    }

    const chartData = {
      labels: filteredFinanceData.monthlyData.map((item) => item.month),
      datasets: [
        {
          label:
            chartType === "revenue"
              ? "Monthly Revenue"
              : "Monthly Reservations",
          data: filteredFinanceData.monthlyData.map((item) =>
            chartType === "revenue"
              ? item.monthlyrevenue
              : item.monthlyreservations
          ),
          fill: false,
          borderColor: chartType === "revenue" ? "rgb(75, 192, 192)" : "rgb(30, 144, 255)",
          tension: 0.3,
          pointBackgroundColor: chartType === "revenue" ? "rgb(75, 192, 192)" : "rgb(30, 144, 255)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text:
            chartType === "revenue"
              ? `Monthly Revenue Trend - ${selectedYear}`
              : `Monthly Reservations Trend - ${selectedYear}`,
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              chartType === "revenue"
                ? `Revenue: $${context.parsed.y}`
                : `Reservations: ${context.parsed.y}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text:
              chartType === "revenue"
                ? "Revenue ($)"
                : "Number of Reservations",
          },
        },
        x: {
          title: {
            display: true,
            text: "Month",
          },
        },
      },
    };

    return <Line data={chartData} options={options} />;
  };

  const calculateGrowthRate = (currentValue, lastValue) => {
    if (!lastValue || lastValue === 0) return 0;
    return (((currentValue - lastValue) / lastValue) * 100).toFixed(1);
  };

  const getMonthlyStats = () => {
    if (!financeData?.monthlyData || financeData.monthlyData.length < 2) {
      return {
        revenue: { current: 0, growth: 0 },
        reservations: { current: 0, growth: 0 },
        averageRevenue: { current: 0, growth: 0 },
      };
    }

    // sorted by month
    const sortedData = [...financeData.monthlyData].sort((a, b) =>
      b.month.localeCompare(a.month)
    );

    // get the data from last two month
    const currentMonth = sortedData[0];
    const lastMonth = sortedData[1];

    return {
      revenue: {
        current: currentMonth.monthlyrevenue,
        growth: calculateGrowthRate(
          currentMonth.monthlyrevenue,
          lastMonth.monthlyrevenue
        ),
      },
      reservations: {
        current: currentMonth.monthlyreservations,
        growth: calculateGrowthRate(
          currentMonth.monthlyreservations,
          lastMonth.monthlyreservations
        ),
      },
      averageRevenue: {
        current: currentMonth.monthlyrevenue,
        growth: calculateGrowthRate(
          currentMonth.monthlyrevenue,
          lastMonth.monthlyrevenue
        ),
      },
    };
  };

  const getAvailableYears = () => {
    if (!financeData?.monthlyData) return [];
    const years = new Set(financeData.monthlyData.map(item => item.month.split('-')[0]));
    return Array.from(years).sort((a, b) => b - a); // Sort years in descending order
  };

  const filterDataByYear = (data) => {
    if (!data?.monthlyData) return data;
    return {
      ...data,
      monthlyData: data.monthlyData.filter(item => item.month.startsWith(selectedYear))
    };
  };

  // Filter all data by selected year
  const filteredFinanceData = filterDataByYear(financeData);
  const filteredOccupancyData = filterDataByYear(occupancyData);
  const filteredRevPARData = filterDataByYear(revPARData);
  const filteredCancellationRateData = filterDataByYear(cancellationRateData);
  const filteredCustomerRetentionRateData = filterDataByYear(customerRetentionRateData);
  const filteredGuestSatisfactionScoreData = filterDataByYear(guestSatisfactionScoreData);
  const filteredALOSData = filterDataByYear(alosData);

  return (
    <div className="container mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold mb-4">Financial Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Total Revenue</h2>
            <p className="text-2xl font-bold">
              $
              {(
                Array.isArray(filteredFinanceData?.monthlyData)
                  ? filteredFinanceData.monthlyData.reduce((sum, item) => sum + item.monthlyrevenue, 0)
                  : 0
              ).toFixed(2)}
            </p>
            <p
              className={`text-sm ${
                Number(getMonthlyStats().revenue.growth) > 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {Number(getMonthlyStats().revenue.growth) > 0 ? "+" : ""}
              {getMonthlyStats().revenue.growth}% from last month
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Total Reservations</h2>
            <p className="text-2xl font-bold">
              {Array.isArray(filteredFinanceData?.monthlyData)
                ? filteredFinanceData.monthlyData.reduce((sum, item) => sum + Number(item.monthlyreservations), 0)
                : 0}
            </p>
            {(() => {
              if (
                Array.isArray(filteredFinanceData?.monthlyData) &&
                filteredFinanceData.monthlyData.length >= 2
              ) {
                const sorted = [...filteredFinanceData.monthlyData].sort(
                  (a, b) => new Date(a.month) - new Date(b.month)
                );
          
                const current = Number(sorted[sorted.length - 1].monthlyreservations);
                const previous = Number(sorted[sorted.length - 2].monthlyreservations);
                const growth = previous === 0 ? 0 : (((current - previous) / previous) * 100).toFixed(1);
          
                return (
                  <p
                    className={`text-sm ${
                      growth >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {growth >= 0 ? "+" : ""}
                    {growth}% from last month
                  </p>
                );
              } else {
                return <p className="text-sm text-gray-400">Not enough data</p>;
              }
            })()}
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Average Monthly Revenue
            </h2>
            <p className="text-2xl font-bold">
              $
              {Array.isArray(filteredFinanceData?.monthlyData) && filteredFinanceData.monthlyData.length > 0
                ? Math.round(
                    filteredFinanceData.monthlyData.reduce((sum, item) => sum + item.monthlyrevenue, 0) /
                    filteredFinanceData.monthlyData.length
                  )
                : 0}
            </p>
            <p
              className={`text-sm ${
                Number(getMonthlyStats().averageRevenue.growth) > 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {Number(getMonthlyStats().averageRevenue.growth) > 0 ? "+" : ""}
              {getMonthlyStats().averageRevenue.growth}% from last month
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <div className="mb-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="chartSelector" className="text-sm font-medium text-gray-700">
                Select Chart:
              </label>
              <div className="relative">
                <select
                  id="chartSelector"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-auto min-w-[200px] hover:border-blue-400 transition"
                >
                  <option value="revenue">Revenue Chart</option>
                  <option value="reservations">Reservations Chart</option>
                  <option value="occupancy">Occupancy Rate Chart</option>
                  <option value="revpar">RevPAR Chart</option>
                  <option value="cancellation">Cancellation Rate Chart</option>
                  <option value="retention">Customer Retention Rate Chart</option>
                  <option value="satisfaction">Guest Satisfaction Score Chart</option>
                  <option value="alos">Average Length of Stay Chart</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="yearSelector" className="text-sm font-medium text-gray-700">
                Select Year:
              </label>
              <div className="relative">
                <select
                  id="yearSelector"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-auto min-w-[120px] hover:border-blue-400 transition"
                >
                  {getAvailableYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[500px] w-full">{renderChart()}</div>
        </div>
      </div>
    </div>
  );
}
