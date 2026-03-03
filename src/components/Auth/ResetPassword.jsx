import { useState, useEffect } from "react";
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes, FaTrafficLight } from "react-icons/fa";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import { useNavigate, useLocation, Link } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [isValidToken, setIsValidToken] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    
    if (tokenParam) {
      setToken(tokenParam);
      // Optional: Verify token with backend
      verifyToken(tokenParam);
    } else {
      toast.error("Invalid or missing reset token");
      setIsValidToken(false);
    }
  }, [location]);

  const verifyToken = async (token) => {
    try {
      const res = await authAPI.verifyResetToken(token);
      if (!res.data?.success) {
        setIsValidToken(false);
        toast.error("This reset link has expired or is invalid");
      }
    } catch (error) {
      setIsValidToken(false);
      toast.error("Invalid reset token");
    }
  };

  // Password strength validation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "None", color: "gray" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;
    
    const strengths = [
      { score: 0, label: "Weak", color: "red" },
      { score: 1, label: "Fair", color: "orange" },
      { score: 2, label: "Good", color: "yellow" },
      { score: 3, label: "Strong", color: "green" },
      { score: 4, label: "Very Strong", color: "green" }
    ];
    
    return strengths[score] || strengths[0];
  };

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = password === confirmPassword;
  const isPasswordValid = password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use actual API call
      const response = await authAPI.resetPassword({ 
        token, 
        newPassword: password 
      });
      
      if (response.data?.success || response.status === 200) {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.error(response.data?.message || "Failed to reset password");
      }
      
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.msg || 
                      "Failed to reset password. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8 bg-black/70 border border-red-500/30 rounded-2xl">
          <FaTimes className="text-5xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl text-red-400 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-400 mb-4">This password reset link has expired or is invalid.</p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-2 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* ... keep your existing JSX structure (I'm keeping it short here) ... */}
      
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
            Create a new password for your account
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-10 bg-black/70 backdrop-blur-xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-yellow-500/5 pointer-events-none"></div>

          <div className="w-full max-w-sm relative z-10">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="animate-fadeIn">
                <h2 className="text-2xl font-semibold text-center mb-2 text-yellow-400 tracking-wide">
                  Reset Password
                </h2>
                
                <p className="text-center text-zinc-400 text-sm mb-6">
                  Enter your new password below
                </p>

                {/* Password Input */}
                <div className="relative mb-3">
                  <FaLock className="absolute top-3.5 left-3 text-yellow-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 
                               bg-black/60 border border-yellow-600/40 
                               rounded-xl text-white
                               focus:outline-none focus:ring-2
                               focus:ring-yellow-500 focus:border-yellow-500
                               transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3.5 right-3 text-yellow-500 hover:text-yellow-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Password strength:</span>
                      <span className={`text-xs text-${passwordStrength.color}-400`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Confirm Password Input */}
                <div className="relative mb-4">
                  <FaLock className="absolute top-3.5 left-3 text-yellow-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 
                               bg-black/60 border border-yellow-600/40 
                               rounded-xl text-white
                               focus:outline-none focus:ring-2
                               focus:ring-yellow-500 focus:border-yellow-500
                               transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-3.5 right-3 text-yellow-500 hover:text-yellow-400"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password Requirements Checklist */}
                <div className="mb-6 space-y-2 text-sm">
                  <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                    {password.length >= 8 ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 ${password.match(/[A-Z]/) ? 'text-green-400' : 'text-gray-500'}`}>
                    {password.match(/[A-Z]/) ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 ${password.match(/[0-9]/) ? 'text-green-400' : 'text-gray-500'}`}>
                    {password.match(/[0-9]/) ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                    <span>One number</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordsMatch && confirmPassword ? 'text-green-400' : 'text-gray-500'}`}>
                    {passwordsMatch && confirmPassword ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                    <span>Passwords match</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid || !passwordsMatch}
                  className="w-full py-3 mt-2 
                             bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 
                             text-black rounded-xl font-semibold tracking-wide
                             shadow-[0_0_25px_rgba(212,175,55,0.4)]
                             hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)]
                             transition duration-300
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            ) : (
              <div className="text-center animate-fadeIn">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-500/30 flex items-center justify-center">
                  <FaCheck className="text-3xl text-green-400" />
                </div>
                
                <h2 className="text-2xl font-semibold mb-2 text-yellow-400 tracking-wide">
                  Password Reset!
                </h2>
                
                <p className="text-zinc-400 text-sm mb-6">
                  Your password has been successfully reset.
                </p>
                
                <p className="text-zinc-500 text-xs mb-6">
                  Redirecting you to login page in 3 seconds...
                </p>

                <Link
                  to="/login"
                  className="inline-block w-full py-3 
                             bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 
                             text-black rounded-xl font-semibold tracking-wide
                             shadow-[0_0_25px_rgba(212,175,55,0.4)]
                             hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)]
                             transition duration-300"
                >
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;