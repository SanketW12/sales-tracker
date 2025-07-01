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
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Globe,
  Database,
} from "lucide-react";
// import { salesService } from '../services/salesService';
import { SalesRecord, ChartData, ViewType, PeriodType } from "../types/sales";
import {
  formatCurrency,
  getDateRange,
  getWeekRange,
  getMonthRange,
} from "../utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { FirebaseApp, getApp } from "firebase/app";

const Dashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [viewType, setViewType] = useState<ViewType>("total");
  const [periodType, setPeriodType] = useState<PeriodType>("daily");

  const [isInitializing, setIsInitializing] = useState(false);
  const firebaseApp = getApp();

  const { isLoading: isFetchingSalesData, data } = useQuery({
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
  });

  useEffect(() => {
    if (data) {
      setSalesData(data?.docs.map((doc) => doc.data()) as SalesRecord[]);
    }
  }, [data]);

  useEffect(() => {
    loadSalesData();
  }, [periodType]);

  useEffect(() => {
    processChartData();
  }, [salesData, periodType]);

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
          dateRange = getDateRange(7);
          break;
        case "weekly":
          dateRange = getWeekRange(4);
          break;
        case "monthly":
          dateRange = getMonthRange(6);
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
      // Group by individual days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      processedData = last7Days.map((date) => {
        const record = salesData.find((r) => r.date === date);
        return {
          date,
          cash: record?.cashAmount || 0,
          online: record?.onlineAmount || 0,
          total: (record?.cashAmount || 0) + (record?.onlineAmount || 0),
          label: new Date(date).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
          }),
        };
      });
    } else if (periodType === "weekly") {
      // Group by weeks
      const weeks: {
        [key: string]: { cash: number; online: number; weekStart: string };
      } = {};

      salesData.forEach((record) => {
        const recordDate = new Date(record.date);
        const weekStart = new Date(recordDate);
        weekStart.setDate(recordDate.getDate() - recordDate.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeks[weekKey]) {
          weeks[weekKey] = { cash: 0, online: 0, weekStart: weekKey };
        }

        weeks[weekKey].cash += record.cashAmount;
        weeks[weekKey].online += record.onlineAmount;
      });

      processedData = Object.values(weeks)
        .map((week) => ({
          date: week.weekStart,
          cash: week.cash,
          online: week.online,
          total: week.cash + week.online,
          label: `Week of ${new Date(week.weekStart).toLocaleDateString(
            "en-IN",
            { month: "short", day: "2-digit" }
          )}`,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } else {
      // Group by months
      const months: { [key: string]: { cash: number; online: number } } = {};

      salesData.forEach((record) => {
        const monthKey = record.date.substring(0, 7); // YYYY-MM

        if (!months[monthKey]) {
          months[monthKey] = { cash: 0, online: 0 };
        }

        months[monthKey].cash += record.cashAmount;
        months[monthKey].online += record.onlineAmount;
      });

      processedData = Object.entries(months)
        .map(([month, data]) => ({
          date: month,
          cash: data.cash,
          online: data.online,
          total: data.cash + data.online,
          label: new Date(month + "-01").toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          }),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
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

  const renderChart = () => {
    if (periodType === "daily") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
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
            />
            <Bar
              dataKey={viewType}
              fill={getChartColor()}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
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
            />
            <Line
              type="monotone"
              dataKey={viewType}
              stroke={getChartColor()}
              strokeWidth={3}
              dot={{ fill: getChartColor(), strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: getChartColor() }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
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
        <div className="flex gap-2">
          {[
            { key: "daily", label: "Last 7 Days", icon: Calendar },
            { key: "weekly", label: "Last 4 Weeks", icon: Calendar },
            { key: "monthly", label: "Last 6 Months", icon: Calendar },
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
      </div>

      {/* View Type Toggle */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales View</h3>
        <div className="flex gap-2">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewType === key
                  ? `bg-${color}-500 text-white shadow-lg`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
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
              {periodType === "daily"
                ? "Last 7 Days"
                : periodType === "weekly"
                ? "Last 4 Weeks"
                : "Last 6 Months"}
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
          Trend
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
          renderChart()
        )}
      </div>
    </div>
  );
};

export default Dashboard;
