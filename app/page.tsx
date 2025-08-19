"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  return (
    <div
      className="flex flex-col min-h-screen font-sans text-gray-800"
      style={{
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)"
      }}
    >
      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white shadow-lg fixed w-full z-50 backdrop-blur-lg bg-opacity-80">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
          <motion.h1
            className="text-xl sm:text-2xl font-extrabold"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.8 }}
          >
            🚀 ParcelBuddy
          </motion.h1>
          <nav className="hidden md:flex space-x-6 lg:space-x-8 text-base lg:text-lg">
            {["Features", "How It Works", "Contact"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.replace(/\s+/g, "-").toLowerCase()}`}
                className="hover:underline hover:opacity-90 transition-colors"
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.07 * i }}
              >
                {item}
              </motion.a>
            ))}
          </nav>
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="material-icons text-3xl">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            className="md:hidden bg-blue-700 px-4 py-5 space-y-4 text-lg"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {["Features", "How It Works", "Contact"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.replace(/\s+/g, "-").toLowerCase()}`}
                className="block hover:underline"
                whileHover={{ scale: 1.05 }}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
              >
                {item}
              </motion.a>
            ))}
          </motion.div>
        )}
      </header>

      {/* HERO SECTION */}
      <motion.section
        className="relative h-[80vh] sm:h-[90vh] w-full"
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={{ once: true, amount: 0.4 }}
      >
        <Image
          src="/main.png"
          alt="Parcel Delivery"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-white/0" />

        <motion.div
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6"
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg"
            variants={fadeInUp}
          >
            Your Parcels, Delivered by Friends 🎯
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg lg:text-xl text-gray-200 max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            No more SJT runs — get your packages faster while helping each other.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <motion.a
              href="/login"
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 font-semibold inline-block transition text-sm sm:text-base"
              whileHover={{
                scale: 1.07,
                boxShadow: "0 8px 32px rgba(55,100,200,.21)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started 🚀
            </motion.a>
            <motion.a
              href="#features"
              className="bg-white border border-blue-600 text-blue-700 px-6 sm:px-8 py-3 rounded-full shadow hover:shadow-md inline-block font-semibold transition text-sm sm:text-base"
              whileHover={{
                scale: 1.05,
                backgroundColor: "#f0f8ff"
              }}
              whileTap={{ scale: 0.96 }}
            >
              Learn More
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* FEATURES */}
      <motion.section
        id="features"
        className="py-16 sm:py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h3
          className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12"
          variants={fadeInUp}
        >
          ✨ Why ParcelBuddy?
        </motion.h3>
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-7xl mx-auto px-4 sm:px-6">
          {[
            { icon: "⏳", title: "Save Time", text: "Avoid unnecessary trips to SJT." },
            { icon: "⚖️", title: "Gender Rules", text: "Follows hostel policies perfectly." },
            { icon: "🏆", title: "Earn Rewards", text: "Get on leaderboards for helping." }
          ].map((f, i) => (
            <motion.div
              key={i}
              className="p-5 sm:p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-100 rounded-xl shadow hover:shadow-2xl transition-transform hover:-translate-y-1"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: 0.1 * i }}
            >
              <h4 className="text-lg sm:text-xl font-bold mb-2">{f.icon} {f.title}</h4>
              <p className="text-sm sm:text-base">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section
        id="how-it-works"
        className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 text-center"
          variants={fadeInUp}
        >
          <h3 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-10">
            How It Works
          </h3>
          <motion.div
            className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-700 max-w-3xl mx-auto"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <p>1️⃣ Post a pickup request with your hostel & gender preference.</p>
            <p>2️⃣ Someone nearby accepts your request.</p>
            <p>3️⃣ They deliver it to your hostel, and you mark it as completed.</p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-2">
          <p className="text-sm sm:text-base">
            © {new Date().getFullYear()} ParcelBuddy | Made for VIT Vellore
          </p>
          <p className="text-xs sm:text-sm">parcelbuddy@vit.ac.in</p>
        </div>
      </footer>
    </div>
  );
}
