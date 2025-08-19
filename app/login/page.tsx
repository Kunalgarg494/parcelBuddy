"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const allowedDomain = "@vitstudent.ac.in";

  const signIn = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || "";

      if (!email.endsWith(allowedDomain)) {
        await signOut(auth);
        setError(
          `❌ This service is only for VIT Vellore students.\nPlease use your official VIT ID (${allowedDomain}).`
        );
        return;
      }

      // 🔹 Save user to MongoDB via API
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }),
      });

      // 🔹 Create Firebase session cookie
      const idToken = await user.getIdToken();
      const res = await fetch("/api/sessionLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.error || "Failed to log in on server");
        return;
      }

      router.push("/dashboard");
    } catch (error: any) {
      if (error.code === "auth/cancelled-popup-request") {
        console.log("Popup sign-in cancelled by user or another request.");
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6 overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full bg-[url('/maingate.png')] bg-cover bg-center blur-sm brightness-75 z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden md:flex flex-col justify-center max-w-md space-y-8 p-6 bg-white/20 rounded-3xl backdrop-blur-lg shadow-lg text-left"
        >
          <img
            src="/logo.png"
            alt="VIT Logo"
            className="w-32 h-32 mx-auto md:mx-0 rounded-full shadow-md object-contain"
          />
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg leading-tight">
            Welcome to <span className="text-blue-300">ParcelBuddy</span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-md">
            Fast, reliable parcel delivery service exclusively for{" "}
            <strong>VIT Vellore</strong> students. Log in with your official VIT
            email to unlock seamless parcel pickups and deliveries.
          </p>
          <img
            src="/illustration.png"
            alt="Parcel Delivery Illustration"
            className="max-w-full rounded-lg shadow-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-gray-200 max-w-md mx-auto"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              Sign in with your VIT account
            </h2>
            <p className="text-sm text-gray-600">
              🎓 Only for VIT Vellore students. Use your official VIT email{" "}
              <br />
              <span className="font-semibold text-blue-600">
                {allowedDomain}
              </span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 whitespace-pre-line">
              {error}
            </div>
          )}

          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-transform transform active:scale-95"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google Icon"
              className="w-6 h-6"
            />
            Sign in with Google
          </button>
        </motion.div>
      </div>

      <footer className="absolute bottom-6 w-full text-center text-gray-300 text-xs select-none z-10">
        © 2025 ParcelBuddy, VIT Vellore | Crafted with ❤️ for students
      </footer>
    </div>
  );
}
