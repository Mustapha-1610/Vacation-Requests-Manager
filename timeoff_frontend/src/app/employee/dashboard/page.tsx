"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee";
}

interface TimeOffRequest {
  id: number;
  user_name: string;
  user_email: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  created_at: string;
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Form state - using Date objects for better date handling
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser: User = JSON.parse(userData);
    if (parsedUser.role !== "employee") {
      router.push("/admin/dashboard");
      return;
    }

    setUser(parsedUser);
    fetchRequests();
  }, [router]);

  const fetchRequests = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://vacation-requests-manager.onrender.com/my_requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: TimeOffRequest[] = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleSubmitRequest = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://vacation-requests-manager.onrender.com/time_off_requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: formatDateForAPI(startDate),
            end_date: formatDateForAPI(endDate),
            reason: reason,
          }),
        }
      );

      if (response.ok) {
        setShowRequestForm(false);
        setStartDate(null);
        setEndDate(null);
        setReason("");
        fetchRequests();
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    // Reset end date if it's before the new start date
    if (date && endDate && endDate < date) {
      setEndDate(null);
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "approved":
        return "✓";
      case "rejected":
        return "✗";
      default:
        return "⏳";
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="text-gray-900 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Custom DatePicker Styles */}
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          background-color: #f9fafb;
          transition: all 0.2s;
          font-size: 14px;
        }
        .react-datepicker__input-container input:focus {
          outline: none;
          border-color: transparent;
          background-color: white;
          box-shadow: 0 0 0 2px #111827;
        }
        .react-datepicker {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          font-family: inherit;
        }
        .react-datepicker__header {
          background-color: #111827;
          border-bottom: 1px solid #374151;
          border-radius: 15px 15px 0 0;
          padding: 16px 0;
        }
        .react-datepicker__current-month {
          color: white;
          font-weight: 600;
          font-size: 16px;
        }
        .react-datepicker__day-name {
          color: #d1d5db;
          font-weight: 500;
          font-size: 12px;
        }
        .react-datepicker__day {
          color: #374151;
          font-weight: 500;
          border-radius: 8px;
          margin: 2px;
          transition: all 0.2s;
        }
        .react-datepicker__day:hover {
          background-color: #f3f4f6;
          color: #111827;
        }
        .react-datepicker__day--selected {
          background-color: #111827;
          color: white;
        }
        .react-datepicker__day--selected:hover {
          background-color: #374151;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #f3f4f6;
          color: #111827;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        .react-datepicker__day--disabled:hover {
          background-color: transparent;
        }
        .react-datepicker__navigation {
          top: 22px;
        }
        .react-datepicker__navigation--previous {
          border-right-color: white;
        }
        .react-datepicker__navigation--next {
          border-left-color: white;
        }
        .react-datepicker__navigation:hover *::before {
          border-color: #d1d5db;
        }
        .react-datepicker__day--today {
          background-color: #dbeafe;
          color: #1e40af;
          font-weight: 600;
        }
        .react-datepicker__day--in-range {
          background-color: #f3f4f6;
          color: #111827;
        }
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: #111827;
          color: white;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Employee Dashboard
                </h1>
                <p className="text-gray-600">Welcome back, {user?.name}!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Requests
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {requests.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Request Time Off Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  My Time Off Requests
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your time off requests and track their status
                </p>
              </div>
              <button
                onClick={() => setShowRequestForm(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Request Time Off</span>
              </button>
            </div>
          </div>

          {/* Requests List */}
          <div className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 4v10a2 2 0 01-2 2H10a2 2 0 01-2-2V11M8 11h8"
                    />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">No requests yet</p>
                <p className="text-gray-600 mt-1">
                  Click &ldquo;Request Time Off&ldquo; to create your first
                  request
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              request.status
                            )}`}
                          >
                            <span className="mr-1">
                              {getStatusIcon(request.status)}
                            </span>
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                          <span className="text-gray-900 font-medium">
                            {request.start_date} to {request.end_date}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium mb-2">
                          {request.reason}
                        </p>
                        <p className="text-sm text-gray-600">
                          Requested on{" "}
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.status === "rejected" &&
                          request.admin_note && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm font-medium text-red-800">
                                Admin Note:
                              </p>
                              <p className="text-sm text-red-700 mt-1">
                                {request.admin_note}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  Request Time Off
                </h3>
                <p className="text-gray-600 mt-1">
                  Fill out the form below to request time off
                </p>
              </div>
              <form
                onSubmit={handleSubmitRequest}
                className="p-6 space-y-6 text-black"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Start Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    minDate={today}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    End Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    minDate={startDate || today}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                    className="w-full"
                    required
                    disabled={!startDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Reason
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 resize-none"
                    placeholder="Please provide a reason for your time off request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestForm(false);
                      setStartDate(null);
                      setEndDate(null);
                      setReason("");
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !startDate || !endDate}
                    className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-xl hover:bg-gray-800 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
