import { FaUsers, FaUserTie, FaUserShield, FaIdBadge } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MainDashboard = ({ onSelectRole, onLogout }) => {
  const navigate = useNavigate();

  const handleSelect = (role, path) => {
    onSelectRole(role);
    localStorage.setItem("role", role); //save role
    navigate(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };


  return (
    <div className="min-h-screen flex justify-center items-center 
      bg-gradient-to-br from-[#0f172a] via-[#0b1f3a] to-[#1e3a8a] p-6 text-gray-100">
      <div className="mt-10 w-[950px] max-w-[50%] bg-[#0b1f3a] border border-blue-700 rounded-2xl 
        shadow-2xl p-10">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-300 mb-2 tracking-wide">
            Welcome to PublicPilot
          </h1>
          <p className="mt-3 text-blue-200 tracking-widest text-sm">
            CONTINUE AS
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols lg:grid-cols-4 gap-6">

          {/* Passenger */}
          <div 
            onClick={() => handleSelect("Passenger", "/passenger")} 
            className="mt-3 cursor-pointer bg-[#132c52] border border-blue-700 rounded-xl p-6 text-center 
            shadow-lg hover:shadow-blue-900/40 hover:bg-[#1e3a8a] hover:scale-105 transition duration-300">
            <FaUsers className="text-4xl text-blue-400 mx-auto mb-3"/>
            <h3 className="font-semibold text-lg text-white">Passenger</h3>
          </div>

          {/* Owner */}
          <div 
            onClick={() => handleSelect("Owner", "/owner")} 
            className="mt-3 cursor-pointer bg-[#132c52] border border-blue-700 rounded-xl p-6 text-center 
            shadow-lg hover:shadow-blue-900/40 hover:bg-[#1e3a8a] hover:scale-105 transition duration-300">
            <FaUserTie className="text-4xl text-blue-400 mx-auto mb-3"/>
            <h3 className="font-semibold text-lg text-white">Owner</h3>
          </div>

          {/* Driver/Conductor */}
          <div 
            onClick={() => handleSelect("Driver/Conductor", "/cd")} 
            className="mt-3 cursor-pointer bg-[#132c52] border border-blue-700 rounded-xl p-6 text-center 
            shadow-lg hover:shadow-blue-900/40 hover:bg-[#1e3a8a] hover:scale-105 transition duration-300">
            <FaUserShield className="text-4xl text-blue-400 mx-auto mb-3"/>
            <h3 className="font-semibold text-lg text-white">Driver / Conductor</h3>
          </div>

          {/* Admin */}
          <div 
            onClick={() => handleSelect("Admin", "/admin")} 
            className="mt-3 cursor-pointer bg-[#132c52] border border-blue-700 rounded-xl p-6 text-center 
            shadow-lg hover:shadow-blue-900/40 hover:bg-[#1e3a8a] hover:scale-105 transition duration-300">
            <FaIdBadge className="text-4xl text-blue-400 mx-auto mb-3"/>
            <h3 className="font-semibold text-lg text-white">Admin</h3>
          </div>

        </div>

        {/* Bottom Action */}
        <div className="mt-10 flex flex-col md:flex-row justify-center gap-6">

          <button 
            onClick={() => navigate("/register")}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white 
                      hover:bg-blue-700 transition shadow-md"
          >
            Register 
          </button>

          <button 
            onClick={handleLogout}
            className="px-6 py-2 rounded-xl border border-blue-500 
                            text-blue-300 hover:bg-[#132c52] hover:text-white transition"
          >
            Logout       
          </button>

        </div>

      </div>
    </div>
  );
};

export default MainDashboard;
