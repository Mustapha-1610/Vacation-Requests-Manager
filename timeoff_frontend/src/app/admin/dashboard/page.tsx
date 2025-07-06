"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      const response = await fetch("http://localhost:3000/time_off_requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        `http://localhost:3000/time_off_requests/${requestId}/status`,
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
        fetchRequests(); // Refresh the list
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
    router.push("/login");
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getStatusCount = (
    status: "pending" | "approved" | "rejected"
  ): number => {
    return requests.filter((req) => req.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {requests.length}
            </div>
            <div className="text-gray-600">Total Requests</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {getStatusCount("pending")}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {getStatusCount("approved")}
            </div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {getStatusCount("rejected")}
            </div>
            <div className="text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "approved"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Requests List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No requests found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <li key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.user_name} ({request.user_email})
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        <strong>Dates:</strong> {request.start_date} to{" "}
                        {request.end_date}
                      </p>
                      <p className="text-gray-600 mt-1">
                        <strong>Reason:</strong> {request.reason}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Requested on:{" "}
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.status === "rejected" && request.admin_note && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            <strong>Admin Note:</strong> {request.admin_note}
                          </p>
                        </div>
                      )}
                    </div>

                    {request.status === "pending" && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() =>
                            handleStatusUpdate(request.id, "approved")
                          }
                          disabled={processingId === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          {processingId === request.id
                            ? "Processing..."
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          disabled={processingId === request.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reject Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Reject Request
              </h3>
              <p className="text-gray-600 mb-4">
                Rejecting request from{" "}
                <strong>{selectedRequest.user_name}</strong> for{" "}
                {selectedRequest.start_date} to {selectedRequest.end_date}
              </p>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setAdminNote("");
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedRequest.id, "rejected")
                  }
                  disabled={processingId === selectedRequest?.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processingId === selectedRequest?.id
                    ? "Processing..."
                    : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
