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
      password,
    };

    const loginPromise = authAPI.login(credentials);

    toast
      .promise(loginPromise, {
        loading: "Logging in...",
        success: <b>Login successful!</b>,
        error: <b>Invalid email or password</b>,
      })
      .then((res) => {
        // Optional: save token/user data
        localStorage.setItem("token", res.data.token);

        if (onLoginSuccess) {
          onLoginSuccess(res.data);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
        navigate("/")
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-sky-500">
      <div className="flex w-[900px] max-w-[95%] h-[550px] rounded-xl shadow-2xl overflow-hidden bg-gray-300">

        {/* Left Side */}
        <div className="hidden md:flex w-1/2 bg-sky-900 text-white flex-col justify-center items-center p-10 text-center">
          <FaTrafficLight className="text-4xl"/>
          <h1 className="mt-3 text-3xl font-bold mb-4">
             PUBLICPILOT</h1>
          <p className="text-base opacity-90">
            Login to continue your journey with us
          </p>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-8">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm animate-fadeIn"
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-sky-900">
              Login
            </h2>

            {/* Email */}
            <div className="relative mb-4">
              <FaEnvelope className="absolute top-3.5 left-3 text-sky-900" />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-xl
                           focus:outline-none focus:ring-2
                           focus:ring-sky-900"
              />
            </div>

            {/* Password */}
            <div className="relative mb-4">
              <FaLock className="absolute top-3.5 left-3 text-sky-900" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-xl
                           focus:outline-none focus:ring-2
                           focus:ring-sky-400"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 mt-2 bg-sky-900 text-white
                         rounded-xl font-semibold
                         hover:bg-sky-800
                         transition duration-300
                         disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {/* Switch to Register */}
            <p className="text-center text-sm mt-4 text-slate-700">
              Don't have an account?{" "}
              <Link
                to= "/register"
                className="text-sky-900 font-semibold cursor-pointer hover:underline"
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
