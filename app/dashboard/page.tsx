"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { Trash } from "lucide-react";
import {
  Package,
  User,
  Filter,
  Plus,
  MessageSquare,
  Clock,
  MapPin,
  IndianRupee,
  Bell,
} from "lucide-react";

interface Parcel {
  _id: string;
  name: string;
  contactNumber: string;
  gender: string;
  parcelCost: number;
  placedItemSite: string;
  parcelStatus: string;
  pickupPlace: string;
  deadline: string;
  deliveryPersonName: string;
  userId: string;
  deliveryStatus: "pending" | "in_progress" | "delivered";
  hostelBlock: string;
  createdAt: string;
}

interface FeedbackItem {
  _id: string;
  userId: string;
  feedback: string;
  createdAt: string;
}
type NotificationType = {
  _id: string;
  message: string;
  createdAt: string;
};

interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
}

export default function Dashboard() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true); // false
  const [showingMyOrders, setShowingMyOrders] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(
    null
  );
  const [showingContributions, setShowingContributions] = useState(false);
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Feedback
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // User profile
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [uid, setUid] = useState<string | null>(null);

  const hasUnread = notifications.length > 0;

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUid(firebaseUser.uid);
      } else {
        setUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notification");
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this parcel?")) return;

    try {
      const res = await fetch(`/api/parcel/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        // ✅ remove from UI
        setParcels((prev) => prev.filter((p) => p._id !== id));
        alert("Parcel deleted successfully!");
      } else {
        alert(data.error || "Failed to delete parcel");
      }
    } catch (err) {
      console.error("Error deleting parcel:", err);
      alert("Something went wrong.");
    }
  };

 const handleLogout = async () => {
  try {
    const res = await fetch("/api/sessionLogout", {
      method: "POST",
      credentials: "include", // important so cookies are sent
    });

    if (res.ok) {
      window.location.href = "/login"; // hard redirect
    } else {
      console.error("Logout failed");
      alert("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert("Logout failed");
  }
};


  const handleParcelAction = async (
    id: string,
    action: "accept" | "cancel" | "complete"
  ) => {
    try {
      const res = await fetch(`/api/parcel/${id}/deliver`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Update local state with new parcel status
        setParcels((prev) =>
          prev.map((p) => (p._id === id ? { ...p, ...data.parcel } : p))
        );
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Error updating parcel:", err);
    }
  };

  useEffect(() => {
    const fetchParcels = async () => {
      setLoading(true);
      try {
        let url = "/api/parcel/show"; // default

        if (showingMyOrders) {
          url = "/api/parcel/my-parcels";
        } else if (showingContributions) {
          url = "/api/parcel/delivered";
        }

        const res = await fetch(url);
        const data = await res.json();
        setParcels(data.parcels || []);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const res = await fetch("/api/feedback");
        const data = await res.json();
        setFeedbacks(data || []);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    const fetchUser = async () => {
      if (!uid) return;
      try {
        const res = await fetch(`/api/user?uid=${uid}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setCurrentUser({ email: data.email });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchParcels();
    fetchFeedbacks();
    fetchUser();
  }, [uid, showingMyOrders, showingContributions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredParcels = parcels.filter((parcel) => {
    const parcelStatusLower = parcel.parcelStatus.toLowerCase();
    const filterStatusLower = statusFilter.toLowerCase();
    const inStatusFilter =
      statusFilter === "all" || parcelStatusLower === filterStatusLower;
    const inAmountRange =
      (!minAmount || parcel.parcelCost >= Number(minAmount)) &&
      (!maxAmount || parcel.parcelCost <= Number(maxAmount));
    return inStatusFilter && inAmountRange;
  });

  const handleFeedbackSubmit = async () => {
    if (!newFeedback.trim() || !uid) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          feedback: newFeedback,
        }),
      });
      if (res.ok) {
        setNewFeedback("");
        const data = await res.json();
        setFeedbacks((prev) => [data.feedback, ...prev]);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ✅ Logo and Brand (Left) */}
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">parcelBuddy</h1>
            </div>

            {/* ✅ Right Side: Notifications + Profile */}
            <div className="flex items-center space-x-4">
              {/* 🔔 Notification Bell */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 relative"
                >
                  <Bell className="h-6 w-6 text-slate-700" />
                  {hasUnread && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-50">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Notifications
                    </h3>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 mt-2">
                        No notifications yet.
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-200 mt-2 max-h-64 overflow-y-auto">
                        {notifications.map((n) => (
                          <li key={n._id} className="py-2">
                            <p className="text-sm text-gray-800">{n.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* 👤 User Profile Dropdown */}
              {user && (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500">
                      <img
                        src={
                          user.photoURL ||
                          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                        }
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700">
                      {user.name}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-slate-600 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full mt-2 px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-2xl font-bold mb-2">
                Need something delivered to your hostel?
              </h2>
              <p className="text-emerald-100 max-w-2xl">
                Place a request and we&apos;ll pick up your parcel from any location
                and deliver it straight to your hostel doorstep.
              </p>
            </div>
            <Link
              href="/new-parcel"
              className="inline-flex items-center space-x-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:bg-emerald-50"
            >
              <Plus className="h-5 w-5" />
              <span>Request Delivery</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Total Parcels
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {parcels.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Paid Parcels
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {
                    parcels.filter(
                      (p) => p.parcelStatus.toLowerCase() === "paid"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  UnPaid Parcels
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {
                    parcels.filter(
                      (p) => p.parcelStatus.toLowerCase() === "unpaid"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Filter Parcels
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Min Amount (₹)
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Amount (₹)
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="1000"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setMinAmount("");
                  setMaxAmount("");
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Parcels Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-8">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {showingMyOrders
                  ? "My Orders"
                  : showingContributions
                  ? "My Contributions"
                  : "Active Parcels"}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {filteredParcels.length} parcel
                {filteredParcels.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Move both toggle buttons here, right-aligned */}
            <div className="flex gap-2">
              {/* Contributions Button */}
              <button
                onClick={() => {
                  setShowingContributions(!showingContributions);
                  setShowingMyOrders(false);
                }}
                className={`px-4 py-1 rounded font-semibold border ${
                  showingContributions
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-emerald-50 text-emerald-700 border"
                }`}
              >
                {showingContributions ? "Show All Parcels" : "My Contributions"}
              </button>

              {/* My Orders Button */}
              <button
                onClick={() => {
                  setShowingMyOrders(!showingMyOrders);
                  setShowingContributions(false);
                }}
                className={`px-4 py-1 rounded font-semibold border ${
                  showingMyOrders
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-emerald-50 text-emerald-700 border"
                }`}
              >
                {showingMyOrders ? "Show All Parcels" : "My Orders"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading parcels...</p>
            </div>
          ) : filteredParcels.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">
                No parcels found with the selected filters.
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredParcels.map((parcel) => (
                  <div
                    key={parcel._id}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 truncate">
                        {parcel.name}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          parcel.parcelStatus.toLowerCase() === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {parcel.parcelStatus}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-slate-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>{parcel.contactNumber}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">
                          {parcel.hostelBlock} • {parcel.pickupPlace}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <IndianRupee className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          ₹{parcel.parcelCost}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-xs">
                          {new Date(parcel.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-1 border-t border-slate-200"></div>

                    {parcel.userId !== currentUser?.email &&
                      parcel.deliveryStatus === "pending" && (
                        <button
                          onClick={() =>
                            handleParcelAction(parcel._id, "accept")
                          }
                          className="mt-3 px-3 py-1 rounded bg-blue-500 text-white text-sm"
                        >
                          Accept Delivery
                        </button>
                      )}

                    {parcel.deliveryStatus === "in_progress" && (
                      <p className="mt-3 text-blue-600 text-sm font-medium">
                        In Progress
                      </p>
                    )}
                    {showingMyOrders &&
                      parcel.userId === currentUser?.email &&
                      parcel.deliveryStatus === "in_progress" && (
                        <div className="mt-3 space-x-2">
                          <button
                            onClick={() =>
                              handleParcelAction(parcel._id, "complete")
                            }
                            className="px-3 py-1 rounded bg-green-500 text-white text-sm"
                          >
                            Mark as Delivered
                          </button>
                          <button
                            onClick={() =>
                              handleParcelAction(parcel._id, "cancel")
                            }
                            className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                          >
                            Cancel Delivery
                          </button>
                        </div>
                      )}
                    {parcel.deliveryStatus === "delivered" && (
                      <p className="mt-3 text-green-600 text-sm font-medium">
                        Delivered ✅
                      </p>
                    )}

                    {showingMyOrders &&
                      parcel.deliveryStatus !== "delivered" && (
                        <button
                          onClick={() => handleDelete(parcel._id)}
                          className="mt-3 w-full flex items-center justify-center gap-2 
               text-red-600 border border-red-200 rounded-md px-3 py-1.5 
               text-sm font-medium transition-colors
               hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                          Delete Order
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Feedback</h3>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submit Feedback */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Share Your Experience
                </h4>
                <p className="text-sm text-slate-600 mb-4">
                  Help us improve our service by sharing your feedback about the
                  delivery process.
                </p>
                <textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="w-full border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  rows={4}
                />
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackLoading || !newFeedback.trim()}
                  className="mt-3 w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {feedbackLoading ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>

              {/* Recent Feedback */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">
                  Recent Feedback
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {feedbacks.slice(0, 5).map((fb) => (
                    <div
                      key={fb._id}
                      className="bg-slate-50 p-3 rounded-lg border border-slate-200"
                    >
                      <p className="text-sm text-slate-700">{fb.feedback}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {feedbacks.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">
                        No feedback yet. Be the first to share!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
