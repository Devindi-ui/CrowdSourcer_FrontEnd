import { FaUsers, FaUserTie, FaUserShield, FaIdBadge } from "react-icons/fa";

const MainDashboard = ({ onSelectRole, onRegister }) => {
  return (
    <div className="min-h-screen flex justify-center items-center 
      justify-center bg-gradient-to-br from-slate-900 to-sky-500">
      <div className="w-[950px] max-w-[50%] bg-gray-300 rounded-2xl 
        shadow-2xl p-10">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-sky-900 mb-2">
            Welcome to PublicPilot
          </h1>
          <p className="text-slate-700">
            CONTINUE AS
          </p>
        </div>

        {/* Role Cards */}
        <div className="gris grid-cols-1 md:grid-cols lg:grid-cols-4 gap-3">

          {/* Passenger */}
          <div 
            onClick={() => onSelectRole("Passenger")} 
            className="cursor-pointer bg-white rounded-xl p-6 text-center 
            shadow-md hover:shadow-xl hover:scale-105 transition duration-300">
            <FaUsers className="text-4xl text-sky-700 mx-auto mb-3"/>
            <h3 className="font-semibold text-lg text-sky-900">Passenger</h3>
          </div>

          {/* Owner */}
          <div 
            onClick={() => onSelectRole("Owner")} 
            className="mt-3 cursor-pointer bg-white rounded-xl p-6 text-center 
            shadow-md hover:shadow-xl hover:scale-105 transition duration-300">
            <FaUserTie className="text-4xl text-sky-700 mx-auto mb-3"/>
            <h3 className="font-semibold text-lg text-sky-900">Owner</h3>
          </div>

          {/* Driver/Conductor */}
          <div 
            onClick={() => onSelectRole("Driver/Conductor")} 
            className="mt-3 cursor-pointer bg-white rounded-xl p-6 text-center 
            shadow-md hover:shadow-xl hover:scale-105 transition duration-300">
            <FaUserShield className="text-4xl text-sky-700 mx-auto mb-3"/>
            <h3 className="font-semibold text-lg text-sky-900">Driver/Conductor</h3>
          </div>

          {/* Admin */}
          <div 
            onClick={() => onSelectRole("Admin")} 
            className="mt-3 cursor-pointer bg-white rounded-xl p-6 text-center 
            shadow-md hover:shadow-xl hover:scale-105 transition duration-300">
            <FaIdBadge className="text-4xl text-sky-700 mx-auto mb-3"/>
            <h3 className="font-semibold text-lg text-sky-900">Admin</h3>
          </div>

        </div>

        {/* Bottom Action */}
        <div className="mt-10 flex flex-col md:flex-row justify-center gap-6">

          <button 
            onClick={onRegister}
            className="px-6 py-2 rounded-xl bg-sky-900 text-white 
                      hover:bg-sky-800 transition">
            Register 
          </button>

          <button 
            className="px-6 py-2 rounded-xl border border-sky-900 
                            text-sky-900 hover:bg-sky-100 transition">
            Logout       
          </button>

        </div>

      </div>
    </div>
  );
};

export default MainDashboard;