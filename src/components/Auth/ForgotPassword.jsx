import { useState } from "react";
import { FaEnvelope, FaArrowLeft, FaPaperPlane, FaTrafficLight } from "react-icons/fa";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use actual API call
      const response = await authAPI.forgotPassword({ email });
      
      if (response.data?.success || response.status === 200) {
        setIsSent(true);
        toast.success("Password reset link sent to your email!");
      } else {
        toast.error(response.data?.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.msg || 
                      "Failed to send reset link. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* ... (keep your existing JSX structure, just update the form part) ... */}
      
      {/* I'll keep your existing JSX but ensure the form is correct */}
      <div className="flex w-[950px] max-w-[95%] min-h-[560px] rounded-3xl 
        shadow-[0_0_60px_rgba(212,175,55,0.15)] overflow-hidden 
        border border-yellow-600/30 
        backdrop-blur-xl bg-white/5 animate-fadeIn">

        {/* Left Side - Branding (keep as is) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-black via-zinc-900 to-black 
          text-white flex-col justify-center items-center p-10 text-center relative">
          {/* ... keep your existing branding ... */}
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
            Reset your password securely
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-10 bg-black/70 backdrop-blur-xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-yellow-500/5 pointer-events-none"></div>

          <div className="w-full max-w-sm relative z-10">
            
            {/* Back Button */}
            <button
              onClick={() => navigate("/login")}
              className="absolute -top-12 left-0 flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              <span className="text-sm">Back to Login</span>
            </button>

            {!isSent ? (
              <form onSubmit={handleSubmit} className="animate-fadeIn">
                <h2 className="text-2xl font-semibold text-center mb-2 text-yellow-400 tracking-wide">
                  Forgot Password?
                </h2>
                
                <p className="text-center text-zinc-400 text-sm mb-8">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <div className="relative mb-6">
                  <FaEnvelope className="absolute top-3.5 left-3 text-yellow-500" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 
                               bg-black/60 border border-yellow-600/40 
                               rounded-xl text-white
                               focus:outline-none focus:ring-2
                               focus:ring-yellow-500 focus:border-yellow-500
                               transition duration-300"
                  />
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
                             disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center animate-fadeIn">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-500/30 flex items-center justify-center">
                  <FaPaperPlane className="text-3xl text-green-400 transform rotate-12" />
                </div>
                
                <h2 className="text-2xl font-semibold mb-2 text-yellow-400 tracking-wide">
                  Check Your Email
                </h2>
                
                <p className="text-zinc-400 text-sm mb-6">
                  We've sent a password reset link to:
                </p>
                
                <div className="bg-yellow-500/10 border border-yellow-600/30 rounded-xl p-3 mb-6">
                  <p className="text-yellow-300 font-medium break-all">{email}</p>
                </div>
                
                <p className="text-zinc-500 text-xs mb-6">
                  Didn't receive the email? Check your spam folder or try again.
                </p>

                <button
                  onClick={() => setIsSent(false)}
                  className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                >
                  Try another email
                </button>
              </div>
            )}

            <p className="text-center text-sm mt-8 text-zinc-400">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-yellow-400 font-semibold cursor-pointer hover:underline"
              >
                Sign in
              </Link>
            </p>
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

export default ForgotPassword;