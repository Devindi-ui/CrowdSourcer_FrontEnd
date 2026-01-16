import React from "react";
import {
  FaBus,
  FaRoad,
  FaExclamationTriangle,
  FaClipboardList,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const cdDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "My Buses",
      value: 12,
      icon: <FaBus />,
    },
    {
      title: "Active Trips",
      value: 6,
      icon: <FaRoad />,
    },
    {
      title: "Today Alerts",
      value: 3,
      icon: <FaExclamationTriangle />,
    },
  ];

  const quickActions = [
    {
      title: "Manage Buses",
      desc: "View & edit your buses",
      icon: <FaBus />,
      path: "/owner/buses",
    },
    {
      title: "Trips",
      desc: "Check ongoing trips",
      icon: <FaRoad />,
      path: "/owner/trips",
    },
    {
      title: "Reports",
      desc: "Crowd & alert reports",
      icon: <FaClipboardList />,
      path: "/owner/reports",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-500 p-6">
      <div className="max-w-6xl mx-auto space-y-8 mt-10">

        {/* Header */}
        <div className="rounded-3xl bg-white/70 backdrop-blur shadow-lg p-6">
          <h1 className="text-2xl font-bold text-sky-900">
            Conductor / Driver Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Manage your buses & monitor trips
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white/70 backdrop-blur shadow-md 
              p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {item.title}
                  </p>
                  <h2 className="text-3xl font-bold text-sky-900 mt-2">
                    {item.value}
                  </h2>
                </div>
                <div className="text-3xl text-sky-600">
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="rounded-2xl bg-white/70 backdrop-blur shadow-md 
              p-6 text-left hover:shadow-xl hover:scale-105 transition"
            >
              <div className="text-2xl text-sky-600 mb-2">
                {action.icon}
              </div>
              <h4 className="font-semibold text-sky-900">
                {action.title}
              </h4>
              <p className="text-sm text-gray-500">
                {action.desc}
              </p>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default cdDashboard;
