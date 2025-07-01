import React, { useState } from "react";
import { Plus, Calendar, DollarSign, Globe } from "lucide-react";

import { formatDate } from "../utils/dateUtils";

import { addDoc, collection, getFirestore } from "firebase/firestore";
import { toast } from "react-toastify";
import { getApp } from "firebase/app";

interface SalesEntryProps {
  onSalesAdded: () => void;
}

const SalesEntry: React.FC<SalesEntryProps> = () => {
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    cashAmount: "",
    onlineAmount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const firebaseApp = getApp();
  const db = getFirestore(firebaseApp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    console.log(firebaseApp, db);

    if (firebaseApp) {
      addDoc(collection(db, "sales"), {
        date: formData.date,
        cashAmount: parseFloat(formData.cashAmount) || 0,
        onlineAmount: parseFloat(formData.onlineAmount) || 0,
      })
        .then((data) => {
          console.log(data);

          setIsSubmitting(false);
          toast.success("Record added successfully", {
            hideProgressBar: true,
          });
          setFormData({
            date: formatDate(new Date()),
            cashAmount: "",
            onlineAmount: "",
          });
        })
        .catch((error) => {
          console.log(error);

          setIsSubmitting(false);
        });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const totalAmount =
    (parseFloat(formData.cashAmount) || 0) +
    (parseFloat(formData.onlineAmount) || 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Daily Sales</h2>
          <p className="text-gray-600">Record today's sales performance</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Calendar className="w-4 h-4" />
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* Cash Sales */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <DollarSign className="w-4 h-4" />
            Cash Sales (₹)
          </label>
          <input
            type="number"
            value={formData.cashAmount}
            onChange={(e) => handleInputChange("cashAmount", e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Online Sales */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Globe className="w-4 h-4" />
            Online Sales (₹)
          </label>
          <input
            type="number"
            value={formData.onlineAmount}
            onChange={(e) => handleInputChange("onlineAmount", e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Notes */}

        {/* Total Display */}
        {totalAmount > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total Sales:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isSubmitting || (!formData.cashAmount && !formData.onlineAmount)
          }
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
        >
          {isSubmitting ? "Saving..." : "Save Sales Record"}
        </button>
      </form>
    </div>
  );
};

export default SalesEntry;
