"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { auth } from "@/lib/firebaseClient"; 
import { onAuthStateChanged } from "firebase/auth";

// Required mark
const RequiredMark = () => (
  <span className="text-red-500 font-bold ml-1" aria-label="required">*</span>
);

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

export default function NewParcelPage() {
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    gender: "",
    parcelCost: "",
    placedItemSite: "",
    parcelStatus: "unpaid",
    pickupPlace: "In front of SJT",
    deadline: "",
    deliveryPersonName: "",
    hostelBlock: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uid, setUid] = useState<string | null>(null);

  // ✅ Get uid from Firebase session — same as Dashboard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUid(firebaseUser.uid);
      } else {
        setUid(null);
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      setMessage("❌ Unable to determine logged-in user. Please log in again.");
      return;
    }

    setLoading(true);
    setMessage("");
    const cost = formData.parcelCost.trim() === "" ? null : Number(formData.parcelCost);

    try {
      const res = await fetch("/api/parcel/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, parcelCost: cost, userId: uid })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      setMessage("✅ Parcel order placed successfully!");

      window.location.href = "/dashboard";
      setFormData({
        name: "",
        contactNumber: "",
        gender: "",
        parcelCost: "",
        placedItemSite: "",
        parcelStatus: "unpaid",
        pickupPlace: "In front of SJT",
        deadline: "",
        deliveryPersonName: "",
        hostelBlock: ""
      });
    } catch (err) {
      setMessage("❌ " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen px-4 py-8 overflow-hidden">
      {/* BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source
          src="/newdelivery.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* FORM CONTAINER */}
      <motion.div
        className="w-full max-w-2xl rounded-2xl p-8 shadow-2xl bg-white/80 backdrop-blur-md border border-gray-200 relative z-10"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl font-extrabold text-gray-800 mb-6 text-center"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          📦 Place New Parcel Order
        </motion.h1>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-5 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
              message.startsWith("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.startsWith("✅") ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            {message}
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Recipient Name */}
          <motion.div variants={fadeInUp}>
            <label className="block font-semibold text-gray-900 mb-1">
              Recipient Name <RequiredMark />
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter recipient&apos;s name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </motion.div>

          {/* Contact Number */}
          <motion.div variants={fadeInUp}>
            <label className="block font-semibold text-gray-900 mb-1">
              Contact Number <RequiredMark />
            </label>
            <input
              type="tel"
              name="contactNumber"
              placeholder="10-digit contact number"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </motion.div>

          {/* Gender */}
          <motion.div variants={fadeInUp}>
            <label className="block font-semibold text-gray-900 mb-1">
              Gender <RequiredMark />
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </motion.div>

          {/* Parcel Cost */}
          <motion.div variants={fadeInUp}>
            <label className="block font-semibold text-gray-900 mb-1">
              Parcel Cost (₹) <RequiredMark />
            </label>
            <input
              type="number"
              name="parcelCost"
              placeholder="Amount in ₹"
              value={formData.parcelCost}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </motion.div>

          {/* Placed Item Site */}
          <motion.div variants={fadeInUp}>
            <label className="block font-semibold text-gray-900 mb-1">
              Placed Item Site <RequiredMark />
            </label>
            <input
              type="text"
              name="placedItemSite"
              placeholder="E.g., Amazon, Flipkart..."
              value={formData.placedItemSite}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </motion.div>

          {/* Parcel Status */}
          <motion.div variants={fadeInUp}>
            <label className="block font-semibold text-gray-900 mb-1">
              Parcel Status <RequiredMark />
            </label>
            <select
              name="parcelStatus"
              value={formData.parcelStatus}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </motion.div>

          {/* Pickup Place - fixed */}
          <motion.div variants={fadeInUp}>
            <label className="block font-medium text-gray-700 mb-1">
              Pickup Place <RequiredMark />
            </label>
            <input
              type="text"
              name="pickupPlace"
              value={formData.pickupPlace}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-100 focus:ring-0 outline-none cursor-not-allowed"
            />
          </motion.div>

          {/* Deadline */}
          <motion.div variants={fadeInUp}>
            <label className="block font-semibold text-gray-900 mb-1">
              Deadline <RequiredMark />
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </motion.div>

          {/* Delivery Person Name */}
          <motion.div variants={fadeInUp}>
            <label className="block font-semibold text-gray-900 mb-1">
              Delivery Person Name <RequiredMark />
            </label>
            <input
              type="text"
              name="deliveryPersonName"
              placeholder="Enter name"
              value={formData.deliveryPersonName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </motion.div>

          {/* Hostel Block */}
          <motion.div variants={fadeInUp}>
            <label className="block font-semibold text-gray-900 mb-1">
              Hostel Block <RequiredMark />
            </label>
            <input
              type="text"
              name="hostelBlock"
              placeholder="Hostel Block"
              value={formData.hostelBlock}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </motion.div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            variants={fadeInUp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md hover:shadow-xl transition"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
