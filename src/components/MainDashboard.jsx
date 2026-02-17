import { FaUsers, FaUserTie, FaUserShield, FaIdBadge } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MainDashboard = ({ onSelectRole, onLogout }) => {
  const navigate = useNavigate();

  const handleSelect = (role, path) => {
    onSelectRole(role);
    localStorage.setItem("role", role);
    navigate(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center bg-black overflow-hidden text-white">

      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse"></div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.08),transparent_60%)] pointer-events-none"></div>

      <div className="mt-10 w-[950px] max-w-[90%] bg-black/70 backdrop-blur-xl border border-yellow-600/30 rounded-3xl shadow-[0_0_60px_rgba(255,215,0,0.15)] p-12 transition-all duration-700">

        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-3 tracking-widest bg-gradient-to-r from-yellow-400 via-white to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,215,0,0.35)]">
            Welcome to PublicPilot
          </h1>
          <p className="mt-4 text-yellow-500/80 tracking-[0.4em] text-xs uppercase">
            Continue As
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div 
            onClick={() => handleSelect("Passenger", "/passenger")} 
            className="group mt-3 cursor-pointer bg-black/60 border border-yellow-600/20 rounded-2xl p-8 text-center 
            shadow-[0_0_25px_rgba(255,215,0,0.08)] hover:shadow-[0_0_40px_rgba(255,215,0,0.25)] 
            hover:border-yellow-500/50 hover:scale-105 transition-all duration-500 backdrop-blur-md">
            <FaUsers className="text-4xl text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition duration-300"/>
            <h3 className="font-semibold text-lg tracking-wide text-white">Passenger</h3>
          </div>

          <div 
            onClick={() => handleSelect("Owner", "/owner")} 
            className="group mt-3 cursor-pointer bg-black/60 border border-yellow-600/20 rounded-2xl p-8 text-center 
            shadow-[0_0_25px_rgba(255,215,0,0.08)] hover:shadow-[0_0_40px_rgba(255,215,0,0.25)] 
            hover:border-yellow-500/50 hover:scale-105 transition-all duration-500 backdrop-blur-md">
            <FaUserTie className="text-4xl text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition duration-300"/>
            <h3 className="font-semibold text-lg tracking-wide text-white">Owner</h3>
          </div>

          <div 
            onClick={() => handleSelect("Driver/Conductor", "/cd")} 
            className="group mt-3 cursor-pointer bg-black/60 border border-yellow-600/20 rounded-2xl p-8 text-center 
            shadow-[0_0_25px_rgba(255,215,0,0.08)] hover:shadow-[0_0_40px_rgba(255,215,0,0.25)] 
            hover:border-yellow-500/50 hover:scale-105 transition-all duration-500 backdrop-blur-md">
            <FaUserShield className="text-4xl text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition duration-300"/>
            <h3 className="font-semibold text-lg tracking-wide text-white">Driver / Conductor</h3>
          </div>

          <div 
            onClick={() => handleSelect("Admin", "/admin")} 
            className="group mt-3 cursor-pointer bg-black/60 border border-yellow-600/20 rounded-2xl p-8 text-center 
            shadow-[0_0_25px_rgba(255,215,0,0.08)] hover:shadow-[0_0_40px_rgba(255,215,0,0.25)] 
            hover:border-yellow-500/50 hover:scale-105 transition-all duration-500 backdrop-blur-md">
            <FaIdBadge className="text-4xl text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition duration-300"/>
            <h3 className="font-semibold text-lg tracking-wide text-white">Admin</h3>
          </div>

        </div>

        <div className="mt-14 flex flex-col md:flex-row justify-center gap-8">

          <button 
            onClick={() => navigate("/register")}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-semibold tracking-wide
                      hover:scale-105 hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all duration-300"
          >
            Register 
          </button>

          <button 
            onClick={handleLogout}
            className="px-8 py-3 rounded-2xl border border-yellow-500/40 
                            text-yellow-400 hover:bg-yellow-500 hover:text-black 
                            hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all duration-300"
          >
            Logout       
          </button>

        </div>

      </div>
    </div>
  );
};

export default MainDashboard;
