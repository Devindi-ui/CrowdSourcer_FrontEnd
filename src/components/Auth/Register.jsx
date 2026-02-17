import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role_name: ""
    });

    const handleChange = (e) => {
        const {name, value} = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!form.role_name) {
            toast.error("Please select a role");
            return;
        }

        try {
            const res = await userAPI.register({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                role_name: form.role_name
            });

            if (res.data.success) {
              toast.success("Registered Successfully!");  
              navigate("/login");         
              
            } else {
              toast.error(res.data.message || "Registration failed");
            }           

        } catch (error) {
            console.error(error);           
            toast.error(error.response?.data?.message || "Server Error");
        }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white p-6 overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-[shimmer_3s_linear_infinite]" />

      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-yellow-500/5 pointer-events-none" />

      <form 
        onSubmit={handleSubmit}
        className="relative bg-black/70 border border-yellow-600/40 p-10 rounded-3xl shadow-[0_0_40px_rgba(255,215,0,0.15)] w-[440px] backdrop-blur-2xl animate-[fadeIn_0.6s_ease-out]">

        <h2 className="text-3xl font-semibold text-center mb-8 tracking-wide bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">
          Create Account
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full mb-5 px-5 py-3 bg-black/60 border border-yellow-600/30 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-300"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full mb-5 px-5 py-3 bg-black/60 border border-yellow-600/30 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-300"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full mb-5 px-5 py-3 bg-black/60 border border-yellow-600/30 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-300"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          className="w-full mb-5 px-5 py-3 bg-black/60 border border-yellow-600/30 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-300"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <select 
            name="role_name"
            value={form.role_name}
            onChange={handleChange}
            className="w-full mb-8 px-5 py-3 bg-black/60 border border-yellow-600/30 rounded-2xl text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-300 appearance-none"
            required    
        >
            <option value="" className="bg-black text-white">Select Role</option>
            <option value="Passenger" className="bg-black text-white">Passenger</option>
            <option value="Owner" className="bg-black text-white">Owner</option>
            <option value="Admin" className="bg-black text-white">Admin</option>
        </select>

        <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black py-3 rounded-2xl font-semibold hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all duration-300"
        >
            Register
        </button>
      </form>

      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

    </div>
  );
};

export default Register;
