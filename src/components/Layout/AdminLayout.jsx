import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FaHome, FaUsers, FaBus, FaRoute, FaRoad, FaClipboardList, FaExclamationTriangle, FaBusAlt, FaRoad as FaBusType, FaClock, FaHeart, FaComment, FaUserShield, FaMapSigns, FaSignOutAlt } from "react-icons/fa";
import Navbar from "./Navbar";

const AdminLayout = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    { path: "/admin", icon: <FaHome />, label: "Dashboard" },
    { path: "/admin/user", icon: <FaUsers />, label: "Users" },
    { path: "/admin/bus", icon: <FaBus />, label: "Buses" },
    { path: "/admin/route", icon: <FaRoute />, label: "Routes" },
    { path: "/admin/trip", icon: <FaRoad />, label: "Trips" },
    { path: "/admin/crowdReport", icon: <FaClipboardList />, label: "Crowd Reports" },
    { path: "/admin/alert", icon: <FaExclamationTriangle />, label: "Alerts" },
    { path: "/admin/busAssignment", icon: <FaBusAlt />, label: "Bus Assignments" },
    { path: "/admin/busType", icon: <FaBusType />, label: "Bus Types" },
    { path: "/admin/currentSituation", icon: <FaClock />, label: "Current Situation" },
    { path: "/admin/favouriteRoute", icon: <FaHeart />, label: "Favourite Routes" },
    { path: "/admin/feedback", icon: <FaComment />, label: "Feedback" },
    { path: "/admin/role", icon: <FaUserShield />, label: "Roles" },
    { path: "/admin/routeStop", icon: <FaMapSigns />, label: "Route Stops" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-black/90 border-b border-yellow-600/30 z-50">
        <div className="flex items-center justify-between px-6 py-3">
            <Navbar/>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-[60px] bottom-0 w-64 bg-black/90 border-r border-yellow-600/30 overflow-y-auto">
        <div className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 mb-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 mt-[60px] p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;