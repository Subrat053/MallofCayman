import React, { useState } from "react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadUser } from "../../redux/actions/user";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${server}/user/login-user`,
        { email, password },
        { withCredentials: true }
      );

      // Load user data and get the user info
      await dispatch(loadUser());

      // Fetch user data directly to check role
      const { data } = await axios.get(`${server}/user/getuser`, {
        withCredentials: true,
      });

      // Show success message and redirect
      toast.success("Login Successful!");

      // Check user role and redirect accordingly
      if (
        data.user &&
        (data.user.role === "Admin" ||
          data.user.role === "SubAdmin" ||
          data.user.role === "Manager")
      ) {
        navigate("/admin/dashboard");
      } else if (data.user && data.user.role === "store_manager") {
        // Redirect store managers to their dashboard
        navigate("/store-manager");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";

      // Handle specific error for suppliers trying to use user login
      if (
        errorMessage.includes("You are registered as a Supplier") ||
        errorMessage.includes("Please use the Shop Login")
      ) {
        toast.error(
          "You are a Supplier. Please use Shop Login to access your dashboard."
        );
        navigate("/shop-login");
      } else if (errorMessage.includes("Your role has been changed")) {
        toast.error(
          "Your role has been changed. Please login again with the appropriate login type."
        );
        navigate("/");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.15)_1px,transparent_0)] [background-size:20px_20px] opacity-60"></div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-2xl animate-pulse delay-500"></div>
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border border-white/20"
        >
          <AiOutlineArrowLeft size={22} className="text-slate-700 group-hover:text-slate-900 transition-colors duration-200" />
        </button>
      </div>

      {/* Header */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative w-32 h-32 bg-white/90 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 p-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
              <img
                src="/logo (10).png"
                alt="Brand Logo"
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(99, 102, 241, 0.15))",
                }}
              />
            </div>
          </div>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Welcome back
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Sign in to your account to continue your journey
          </p>
          <div className="flex items-center justify-center mt-4 gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white/80 backdrop-blur-sm py-12 px-8 lg:px-12 shadow-2xl rounded-3xl border border-white/20 relative overflow-hidden">
          {/* Background Pattern for Form */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-indigo-50/30 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-2xl"></div>

          <form className="relative z-10 space-y-8" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800 tracking-wide"
              >
                Email address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none text-gray-900 bg-white/70 backdrop-blur-sm placeholder-gray-500 transition-all duration-300 hover:border-indigo-300 group-hover:shadow-lg focus:shadow-xl focus:bg-white/90 text-sm font-medium hover:bg-white/80 focus:scale-[1.02]"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-focus-within:from-indigo-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-indigo-500/5 transition-all duration-500 pointer-events-none"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-800 tracking-wide"
              >
                Password
              </label>
              <div className="relative group">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none text-gray-900 bg-white/70 backdrop-blur-sm placeholder-gray-500 transition-all duration-300 hover:border-indigo-300 group-hover:shadow-lg focus:shadow-xl focus:bg-white/90 text-sm font-medium hover:bg-white/80 focus:scale-[1.02]"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
                  )}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-focus-within:from-indigo-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-indigo-500/5 transition-all duration-500 pointer-events-none"></div>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center group">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-lg transition-all duration-200 cursor-pointer hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-3 block text-sm text-gray-700 cursor-pointer group-hover:text-indigo-600 transition-colors duration-200 font-medium"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-indigo-600 hover:text-indigo-800 transition-all duration-200 hover:underline decoration-2 underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center items-center py-4 px-5 border-0 rounded-2xl text-sm font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 tracking-wide ${loading
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed shadow-lg"
                    : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-700 hover:shadow-2xl hover:shadow-indigo-500/25 hover:scale-105 focus:scale-105 active:scale-95 shadow-xl"
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in to your account"
                )}
              </button>
            </div>

            {/* Sign up link */}
            <div className="text-center pt-6 mt-4 border-t border-gray-200/50 backdrop-blur-sm">
              <p className="text-sm text-gray-600 font-medium">
                Don't have an account?{" "}
                <Link
                  to="/sign-up"
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-all duration-200 hover:underline decoration-2 underline-offset-2 ml-1"
                >
                  Create account
                </Link>
              </p>
            </div>

            {/* Supplier Login Link */}
            <div className="text-center pt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/70"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-500 text-sm font-medium rounded-full border border-gray-200/50">or</span>
                </div>
              </div>
              <div className="group">
                <Link
                  to="/shop-login"
                  className="relative inline-flex items-center justify-center px-6 py-3 border-2 border-indigo-200 rounded-2xl text-sm font-semibold text-indigo-600 bg-indigo-50/80 backdrop-blur-sm hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-105 group-hover:backdrop-blur-md overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="tracking-wide">Login as Supplier</span>
                  </div>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
