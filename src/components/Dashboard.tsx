/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Globe,
  Database,
  ChevronDown,
} from "lucide-react";
// import { salesService } from '../services/salesService';
import { SalesRecord, ChartData, ViewType, PeriodType } from "../types/sales";
import {
  formatCurrency,
  getDateRange,
  getMonthRange,
  getMonthDaysRange,
} from "../utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { FirebaseApp, getApp } from "firebase/app";

const Dashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [viewType, setViewType] = useState<ViewType>("total");
  const [periodType, setPeriodType] = useState<PeriodType>("daily");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [isInitializing, setIsInitializing] = useState(false);
  const firebaseApp = getApp();

  const { isLoading: isFetchingSalesData, data, refetch } = useQuery({
    queryKey: ["totalSalesData"],
    queryFn: async () => {
      const firestore = getFirestore(firebaseApp as FirebaseApp);
      const salesCollection = collection(firestore, "sales");
      return getDocs(salesCollection);
    },
    onSuccess(data) {
      console.log(
        data.docs.map((doc) => doc.data()),
        "Fetched sales data successfully"
      );
    },
    onError(err) {
      console.error("Error fetching sales data:", err);
    },
    // Refetch data every 30 seconds to catch new entries
    refetchInterval: 30000,
    // Refetch when window regains focus
    refetchOnWindowFocus: true,
  });

  // Expose refetch function globally so it can be called from SalesEntry
  useEffect(() => {
    (window as any).refetchDashboardData = refetch;
    
    return () => {
      delete (window as any).refetchDashboardData;
    };
  }, [refetch]);

  useEffect(() => {
    if (data) {
      setSalesData(data?.docs.map((doc) => doc.data()) as SalesRecord[]);
    }
  }, [data]);

  useEffect(() => {
    loadSalesData();
  }, [periodType, selectedMonth]);

  useEffect(() => {
    processChartData();
  }, [salesData, periodType, selectedMonth]);

  const initializeSampleData = async () => {
    setIsInitializing(true);
    try {
      // await salesService.initializeSampleData();
      await loadSalesData();
    } catch (error) {
      console.error("Error initializing sample data:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const loadSalesData = async () => {
    try {
      let dateRange;

      switch (periodType) {
        case "daily":
          dateRange = getDateRange(30); // Changed from 7 to 30 days
          break;
        case "weekly":
          dateRange = getMonthRange(12); // Changed to 12 months for monthly view
          break;
        case "monthly":
          dateRange = getMonthDaysRange(selectedMonth); // New: specific month data
          break;
      }

      // const records = await salesService.getSalesRecords(
      //   dateRange.startDate,
      //   dateRange.endDate
      // );
      // setSalesData(records);
    } catch (error) {
      console.error("Error loading sales data:", error);
    }
  };

  const processChartData = () => {
    if (salesData.length === 0) {
      setChartData([]);
      return;
    }

    let processedData: ChartData[] = [];

    if (periodType === "daily") {
      // Group by individual days for last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      processedData = last30Days.map((date) => {
        const record = salesData.find((r) => r.date === date);
        return {
          date,
          cash: record?.cashAmount || 0,
          online: record?.onlineAmount || 0,
          total: (record?.cashAmount || 0) + (record?.onlineAmount || 0),
          label: new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
        };
      });
    } else if (periodType === "weekly") {
      // Group by months for last 12 months
      const months: { [key: string]: { cash: number; online: number } } = {};

      // Generate last 12 months
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().substring(0, 7); // YYYY-MM format
      }).reverse();

      // Initialize months with zero values
      last12Months.forEach(month => {
        months[month] = { cash: 0, online: 0 };
      });

      // Aggregate sales data by month
      salesData.forEach((record) => {
        const monthKey = record.date.substring(0, 7); // YYYY-MM
        if (months[monthKey]) {
          months[monthKey].cash += record.cashAmount;
          months[monthKey].online += record.onlineAmount;
        }
      });

      processedData = last12Months.map((month) => ({
        date: month,
        cash: months[month].cash,
        online: months[month].online,
        total: months[month].cash + months[month].online,
        label: new Date(month + "-01").toLocaleDateString("en-IN", {
          month: "short",
        }),
      }));
    } else {
      // Group by days for selected month
      const year = parseInt(selectedMonth.split('-')[0]);
      const month = parseInt(selectedMonth.split('-')[1]) - 1; // JavaScript months are 0-indexed
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, month, i + 1);
        return date.toISOString().split("T")[0];
      });

      processedData = monthDays.map((date) => {
        const record = salesData.find((r) => r.date === date);
        return {
          date,
          cash: record?.cashAmount || 0,
          online: record?.onlineAmount || 0,
          total: (record?.cashAmount || 0) + (record?.onlineAmount || 0),
          label: new Date(date).getDate().toString(),
        };
      });
    }

    setChartData(processedData);
  };

  const getTotalSales = () => {
    return chartData.reduce((sum, item) => {
      switch (viewType) {
        case "cash":
          return sum + item.cash;
        case "online":
          return sum + item.online;
        default:
          return sum + item.total;
      }
    }, 0);
  };

  const getChartColor = () => {
    switch (viewType) {
      case "cash":
        return "#10B981";
      case "online":
        return "#3B82F6";
      default:
        return "#8B5CF6";
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Generate last 24 months for selection
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
    
    return options;
  };

  const getPeriodLabel = () => {
    switch (periodType) {
      case "daily":
        return "Last 30 Days";
      case "weekly":
        return "Last 12 Months";
      case "monthly":
        const monthDate = new Date(selectedMonth + "-01");
        return monthDate.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        });
      default:
        return "";
    }
  };

  const getButtonClasses = (isActive: boolean, color: string) => {
    if (isActive) {
      switch (color) {
        case "purple":
          return "bg-purple-500 text-white shadow-lg";
        case "green":
          return "bg-green-500 text-white shadow-lg";
        case "blue":
          return "bg-blue-500 text-white shadow-lg";
        default:
          return "bg-gray-500 text-white shadow-lg";
      }
    }
    return "bg-gray-100 text-gray-700 hover:bg-gray-200";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Sales Dashboard
            </h2>
            <p className="text-gray-600">Analyze your sales performance</p>
          </div>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={() => refetch()}
          disabled={isFetchingSalesData}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
        >
          <Database className={`w-4 h-4 ${isFetchingSalesData ? 'animate-spin' : ''}`} />
          {isFetchingSalesData ? "Refreshing..." : "Refresh Data"}
        </button>

        {/* Sample Data Button */}
        {chartData.length === 0 && (
          <button
            onClick={initializeSampleData}
            disabled={isInitializing}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            {isInitializing ? "Loading Sample Data..." : "Load Sample Data"}
          </button>
        )}
      </div>

      {/* Period Toggle */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Time Period
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "daily", label: "Last 30 Days", icon: Calendar },
            { key: "weekly", label: "Monthly View (12 Months)", icon: Calendar },
            { key: "monthly", label: "Select Month", icon: Calendar },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPeriodType(key as PeriodType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                periodType === key
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Month Picker */}
        {periodType === "monthly" && (
          <div className="mt-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month:
            </label>
            <div className="relative">
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="w-full md:w-64 bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              >
                <span>
                  {new Date(selectedMonth + "-01").toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMonthPicker ? 'rotate-180' : ''}`} />
              </button>
              
              {showMonthPicker && (
                <div className="absolute top-full left-0 right-0 md:right-auto md:w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {generateMonthOptions().map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setSelectedMonth(value);
                        setShowMonthPicker(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors duration-200 ${
                        selectedMonth === value ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Type Toggle */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales View</h3>
        <div className="flex flex-wrap gap-2">
          {[
            {
              key: "total",
              label: "Total Sales",
              icon: TrendingUp,
              color: "purple",
            },
            {
              key: "cash",
              label: "Cash Sales",
              icon: DollarSign,
              color: "green",
            },
            {
              key: "online",
              label: "Online Sales",
              icon: Globe,
              color: "blue",
            },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setViewType(key as ViewType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${getButtonClasses(viewType === key, color)}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 mb-1">
              {viewType === "cash"
                ? "Total Cash Sales"
                : viewType === "online"
                ? "Total Online Sales"
                : "Total Sales"}
            </p>
            <p className="text-3xl font-bold">
              {formatCurrency(getTotalSales())}
            </p>
          </div>
          <div className="text-right">
            <p className="text-purple-100 mb-1">
              {getPeriodLabel()}
            </p>
            <p className="text-lg font-semibold">{chartData.length} Records</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {viewType === "cash"
            ? "Cash Sales"
            : viewType === "online"
            ? "Online Sales"
            : "Total Sales"}{" "}
          Trend - {getPeriodLabel()}
        </h3>

        {isFetchingSalesData ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No sales data available for this period</p>
              <button
                onClick={initializeSampleData}
                disabled={isInitializing}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 mx-auto"
              >
                <Database className="w-4 h-4" />
                {isInitializing ? "Loading..." : "Load Sample Data"}
              </button>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="label" 
                stroke="#6b7280" 
                fontSize={12}
                angle={periodType === "daily" ? -45 : 0}
                textAnchor={periodType === "daily" ? "end" : "middle"}
                height={periodType === "daily" ? 80 : 60}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value),
                  viewType === "cash"
                    ? "Cash"
                    : viewType === "online"
                    ? "Online"
                    : "Total",
                ]}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar
                dataKey={viewType}
                fill={getChartColor()}
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;