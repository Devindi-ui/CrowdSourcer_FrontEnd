import { useState } from "react";
import { FaEnvelope, FaLock, FaTrafficLight } from "react-icons/fa";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const credentials = {
      email,
      password
    };

    try {
      const res = await authAPI.login(credentials);
      console.log("Login response:", res.data);

      // Check if login was successful
      if (res.data?.success) {
      // Check if user account is deactivated
      if (res.data.data?.user?.status_d === 0) {
        toast.error(<b className="text-red-500">Your account has been deactivated. Please contact admin.</b>);
        setIsSubmitting(false);
        return;
      }

      if (res.data?.success) {
        // Get the user object
        const user = res.data.data.user;
        
        console.log("User data from login:", user); // {id: 43, name: 'Nithya Devindi', ...}
        
        // ✅ FIX: Use the CORRECT property name - it's "id", not "user_id"!
        sessionStorage.setItem("userId", user?.id);      // ← Changed from user_id to id
        sessionStorage.setItem("userName", user?.name);  // ← This is correct (property is "name")
        
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        
        // Store token if available
        if (res.data.data?.token) {
          localStorage.setItem("token", res.data.data.token);
        }

        // Store user role
        localStorage.setItem("role", user?.role || user?.role_name);

        toast.success("Login successful!");

        // Call onLoginSuccess callback if provided
        if (onLoginSuccess) {
          onLoginSuccess(res.data.data);
        }

        // Navigate to main dashboard
        navigate("/");
      }
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle different error scenarios
      if (err.response?.status === 401) {
        toast.error("Invalid email or password");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none"></div>

      <div className="flex w-[950px] max-w-[95%] min-h-[560px] rounded-3xl 
        shadow-[0_0_60px_rgba(212,175,55,0.15)] overflow-hidden 
        border border-yellow-600/30 
        backdrop-blur-xl bg-white/5 animate-fadeIn">

        {/* Left Side - Branding */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-black via-zinc-900 to-black 
          text-white flex-col justify-center items-center p-10 text-center relative">

          <div className="absolute top-0 left-0 w-full h-[2px] 
            bg-gradient-to-r from-transparent via-yellow-500 to-transparent 
            animate-pulse"></div>

          <FaTrafficLight className="text-4xl text-yellow-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]"/>
          <h1 className="mt-4 text-3xl font-semibold tracking-[4px] text-white">
             <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(212,175,55,0.7)]">
               PUBLIC
             </span>
             <span className="text-white ml-1">
               PILOT
             </span>
          </h1>
          <p className="text-base text-zinc-300 mt-4">
            Login to continue your journey with us
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-10 bg-black/70 backdrop-blur-xl relative">

          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-yellow-500/5 pointer-events-none"></div>

          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm animate-fadeIn relative z-10"
          >
            <h2 className="text-2xl font-semibold text-center mb-8 text-yellow-400 tracking-wide">
              Executive Login
            </h2>

            <div className="relative mb-5">
              <FaEnvelope className="absolute top-3.5 left-3 text-yellow-500" />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 
                           bg-black/60 border border-yellow-600/40 
                           rounded-xl text-white
                           focus:outline-none focus:ring-2
                           focus:ring-yellow-500 focus:border-yellow-500
                           transition duration-300"
                disabled={isSubmitting}
              />
            </div>

            <div className="relative mb-2">
              <FaLock className="absolute top-3.5 left-3 text-yellow-500" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 
                           bg-black/60 border border-yellow-600/40 
                           rounded-xl text-white
                           focus:outline-none focus:ring-2
                           focus:ring-yellow-500 focus:border-yellow-500
                           transition duration-300"
                disabled={isSubmitting}
              />
            </div>

            {/* Forgot Password link - Right aligned */}
            <div className="flex justify-end mb-4">
              <Link
                to="/forgot-password"
                className="text-sm text-yellow-400/70 hover:text-yellow-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2 
                         bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 
                         text-black rounded-xl font-semibold tracking-wide
                         shadow-[0_0_25px_rgba(212,175,55,0.4)]
                         hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)]
                         transition duration-300
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : "Login"}
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm mt-6 text-zinc-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-yellow-400 font-semibold cursor-pointer hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Add animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;