import React, { useState } from "react";
import { BarChart3, Plus } from "lucide-react";
import SalesEntry from "./components/SalesEntry";
import Dashboard from "./components/Dashboard";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";

type TabType = "entry" | "dashboard";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("entry");
  const [refreshDashboard, setRefreshDashboard] = useState(0);

  const handleSalesAdded = () => {
    setRefreshDashboard((prev) => prev + 1);
    setTimeout(() => setActiveTab("dashboard"), 1000);
  };

  const tabs = [
    {
      key: "entry" as TabType,
      label: "Add Sales",
      icon: Plus,
      color: "blue",
    },
    {
      key: "dashboard" as TabType,
      label: "Dashboard",
      icon: BarChart3,
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineIndicator />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sales Tracker
                </h1>
                <p className="text-sm text-gray-600">
                  Track your daily sales performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === key
                    ? `border-${color}-500 text-${color}-600`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "entry" ? (
          <div className="max-w-2xl mx-auto">
            <SalesEntry onSalesAdded={handleSalesAdded} />
          </div>
        ) : (
          <div key={refreshDashboard}>
            <Dashboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>
              © 2025 Sales Tracker. Built for shop owners to track daily sales
              efficiently.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;