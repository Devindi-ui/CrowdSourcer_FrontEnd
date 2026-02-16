import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";

const Register = () => {
    const navigate = useNavigate();

    //Single form state
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role_name: ""
    });

    //handle input changes
    const handleChange = (e) => {
        const {name, value} = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    //Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        //Role validation
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1f3a] to-[#1e3a8a] p-6 text-gray-100">
      <form 
        onSubmit={handleSubmit}
        className="bg-[#0b1f3a] border border-blue-700 p-8 rounded-2xl shadow-2xl w-[420px] backdrop-blur-md">

        <h2 className="text-2xl font-bold text-center text-blue-300 mb-6 tracking-wide">
          Create Account
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full mb-4 px-4 py-3 bg-[#132c52] border border-blue-600 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 bg-[#132c52] border border-blue-600 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-3 bg-[#132c52] border border-blue-600 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          className="w-full mb-4 px-4 py-3 bg-[#132c52] border border-blue-600 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <select 
            name="role_name"
            value={form.role_name}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none transition"    
            required    
        >
            <option value="">Select Role</option>
            <option value="Passenger">Passenger</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
        </select>

        <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 hover:scale-[1.02] transition-all duration-200 shadow-lg"
        >
            Register
        </button>
      </form>
    </div>
  );
};

export default Register;
