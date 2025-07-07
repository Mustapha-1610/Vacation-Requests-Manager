"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  LogOut,
  User,
  Mail,
  AlertCircle,
} from "lucide-react";

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

type FilterType = "all" | "pending" | "approved" | "rejected";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TimeOffRequest[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(
    null
  );
  const [adminNote, setAdminNote] = useState<string>("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser: User = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/employee/dashboard");
      return;
    }

    setUser(parsedUser);
    fetchRequests();
  }, [router]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((req) => req.status === filter));
    }
  }, [requests, filter]);

  const fetchRequests = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://vacation-requests-manager.onrender.com/time_off_requests",
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

  const handleStatusUpdate = async (
    requestId: number,
    status: "approved" | "rejected"
  ): Promise<void> => {
    setProcessingId(requestId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://vacation-requests-manager.onrender.com/time_off_requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: status,
            admin_note: status === "rejected" ? adminNote : null,
          }),
        }
      );

      if (response.ok) {
        fetchRequests();
        setShowModal(false);
        setAdminNote("");
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (request: TimeOffRequest): void => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusCount = (
    status: "pending" | "approved" | "rejected"
  ): number => {
    return requests.filter((req) => req.status === status).length;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="text-slate-900 font-medium">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-3 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="text-slate-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Requests
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {requests.length}
                </p>
              </div>
              <div className="bg-slate-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-slate-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {getStatusCount("pending")}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {getStatusCount("approved")}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {getStatusCount("rejected")}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Time Off Requests
            </h2>
            <Filter className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All Requests", count: requests.length },
              {
                key: "pending",
                label: "Pending",
                count: getStatusCount("pending"),
              },
              {
                key: "approved",
                label: "Approved",
                count: getStatusCount("approved"),
              },
              {
                key: "rejected",
                label: "Rejected",
                count: getStatusCount("rejected"),
              },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as FilterType)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === key
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No requests found</p>
              <p className="text-slate-400 text-sm mt-2">
                {filter === "all"
                  ? "No time off requests have been submitted yet."
                  : `No ${filter} requests found.`}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <User className="w-5 h-5 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {request.user_name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          <span>{request.user_email}</span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        <span className="text-sm font-medium capitalize">
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-600">
                            Duration
                          </span>
                        </div>
                        <p className="text-slate-900 font-semibold">
                          {formatDate(request.start_date)} -{" "}
                          {formatDate(request.end_date)}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {calculateDays(request.start_date, request.end_date)}{" "}
                          day(s)
                        </p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-600">
                            Reason
                          </span>
                        </div>
                        <p className="text-slate-900 font-medium">
                          {request.reason}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          Submitted on {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>

                    {request.status === "rejected" && request.admin_note && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">
                            Admin Note
                          </span>
                        </div>
                        <p className="text-red-800">{request.admin_note}</p>
                      </div>
                    )}
                  </div>

                  {request.status === "pending" && (
                    <div className="flex space-x-3 ml-6">
                      <button
                        onClick={() =>
                          handleStatusUpdate(request.id, "approved")
                        }
                        disabled={processingId === request.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {processingId === request.id
                            ? "Processing..."
                            : "Approve"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        disabled={processingId === request.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Reject Request
                </h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl mb-4">
                <p className="text-slate-900 font-medium mb-2">
                  {selectedRequest.user_name}&apos;s Request
                </p>
                <p className="text-sm text-slate-600">
                  {formatDate(selectedRequest.start_date)} -{" "}
                  {formatDate(selectedRequest.end_date)}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Reason: {selectedRequest.reason}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder-slate-400"
                  rows={4}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setAdminNote("");
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedRequest.id, "rejected")
                  }
                  disabled={processingId === selectedRequest?.id}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === selectedRequest?.id
                    ? "Processing..."
                    : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
