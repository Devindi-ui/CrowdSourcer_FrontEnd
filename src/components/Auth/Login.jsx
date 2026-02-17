import { useState } from "react";
import { FaEnvelope, FaLock, FaTrafficLight } from "react-icons/fa";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Login = ({ onLoginSuccess, onShowSignup }) => {
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

    const loginPromise = authAPI.login(credentials);

    toast
      .promise(loginPromise, {
        loading: "Logging in...",
        success: <b>Login successful!</b>,
        error: <b>Invalid email or password</b>,
      })
      .then((res) => {
        if (res.data?.user?.status_d === 0) {
          toast.error(
            <b className="text-red-500">
              Your account has been deactivated. Please contact admin.
            </b>
          );
          return;
        }

        localStorage.setItem("token", res.data.token);

        if (onLoginSuccess) {
          onLoginSuccess(res.data);
        }
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none"></div>

      <div className="flex w-[950px] max-w-[95%] h-[560px] rounded-3xl 
        shadow-[0_0_60px_rgba(212,175,55,0.15)] overflow-hidden 
        border border-yellow-600/30 
        backdrop-blur-xl bg-white/5 animate-fadeIn">

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
              />
            </div>

            <div className="relative mb-6">
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
                         disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

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
    </div>
  );
};

export default Login;
