import React from "react";
import { FaUsers, FaBus, FaRoute, FaTripadvisor, FaExclamationTriangle, FaPlus, FaBell,
    FaMapMarkedAlt, FaClipboardList, FaBusAlt, FaMapSigns, FaHeart, 
    FaCommentDots, FaHistory, FaUserShield, FaLock, FaRoad
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { dashboardAPI } from "../../services/api";


const AdminDashboard = () => {
    const [stats, setStats] = useState([
        { title: "Active Users", value: 0, icon: <FaUsers/> },
        { title: "Active Buses", value: 0, icon: <FaBus/> },
        { title: "Trips", value: 0, icon: <FaTripadvisor/> },
        { title: "Crowd Alerts", value: 0, icon: <FaExclamationTriangle/> }
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [users, buses, trips, alerts] = await Promise.all([
                    dashboardAPI.users(),
                    dashboardAPI.buses(),
                    dashboardAPI.trips(),
                    dashboardAPI.alerts()
                ]);

                setStats([
                    {title: "Active Users", value: users.data.total, icon: <FaUsers/>},
                    {title: "Active Buses", value: buses.data.total, icon: <FaBus/>},
                    {title: "Ongoing Trips", value: trips.data.total, icon: <FaTripadvisor/>},
                    {title: "Crowd Alerts", value: alerts.data.total, icon: <FaExclamationTriangle/>}
                ]);
                
            } catch (error) {
                console.error("Failed to load dashboard stats", error.message);
                
            }
        };

        fetchStats();
    }, []);

    const quickActions = [
        {
            title: "Alert",
            desc: "Create & manage system alerts",
            icon: <FaExclamationTriangle/>
        },
        {
            title: "Auth",
            desc: "Authentication & access control",
            icon: <FaLock/>
        },
        {
            title: "Bus",
            desc: "Manage buses",
            icon: <FaBus/>
        },
        {
            title: "Bus Assignment",
            desc: "Assign buses to routes",
            icon: <FaBusAlt/>
        },
        {
            title: "Bus Type",
            desc: "Manage bus categories",
            icon: <FaRoad/>
        },
        {
            title: "Crowd Report",
            desc: "View crowd level reports",
            icon: <FaClipboardList/>
        },
        {
            title: "Favourite Route",
            desc: "User saved routes",
            icon: <FaHeart/>
        },
        {
            title: "Feedback",
            desc: "Passenger feedback",
            icon: <FaCommentDots/>
        },
        {
            title: "Notification",
            desc: "Send notifications",
            icon: <FaBell/>
        },
        {
            title: "Report History",
            desc: "Syatem activity logs",
            icon: <FaHistory/>
        },
        {
            title: "Role",
            desc: "Manage user roles",
            icon: <FaUserShield/>
        },
        {
            title: "Route",
            desc: "Create & edit routes",
            icon: <FaRoute/>
        },
        {
            title: "Route Stop",
            desc: "Manage route stops",
            icon: <FaMapSigns/>
        },
        {
            title: "Trip",
            desc: "Manage trips",
            icon: <FaRoad/>
        },
        {
            title: "User",
            desc: "Manage users",
            icon: <FaUsers/>
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-500 p-6">

            {/* Main container */}
            <div className="mt-13 max-w-7xl mx-auto space-y-8">
                {/* Welcome Bar */}
                <div className="rounded-3xl bg-white/70 backdrop-blur shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-sky-900">
                        Admin Command Center 
                    </h1>
                    <p className="text-sm text-gray-600">
                        Full system control & real-time monitoring
                    </p>
                </div>
                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((item, index) => (
                        <div 
                            key={index}
                            className="rounded-3xl bg-white/70 backdrop-blur shadow-md p-6 
                            hover:shadow-xl transition"
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
                {/* Live Operations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map */}
                    <div className="lg:col-span-4 rounded-3xl bg-white/70 backdrop-blur shadow-lg p-6">
                        <h3 className="font-semibold text-lg text-sky-900 mb-4">
                            Live Bus Locations
                        </h3>
                        <div className="h-64 rounded-2xl bg-gray-200 
                            flex-items-center justify-center text-gray-500">
                            <FaMapMarkedAlt className="text-4xl"/>
                            <span className="ml-3">Live Map Preview</span>
                        </div>
                    </div>
                    {/* Alerts */}
                    {/* <div className="rounded-3xl bg-white/70 backdrop-blur shadow-lg p-6">
                        <h3 className="font-semibold text-lg text-sky-900 mb-4">
                            Active Alerts
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="p-3 rounded-xl bg-red-50 text-red-700
                                cursor-pointer hover:shadow-xl hover:bg-red-100">
                                🚨 Heavy crowd on Route 138
                            </li>
                            <li className="p-3 rounded-xl bg-yellow-50 text-yellow-700
                                cursor-pointer hover:shadow-xl hover:bg-yellow-100">
                                ⚠ Bus delay detected (Bus 22)
                            </li>
                            <li className="p-3 rounded-xl bg-blue-50 text-blue-700
                                cursor-pointer hover:shadow-xl hover:bg-blue-100">
                                ℹ Route update pending approval
                            </li>
                        </ul>
                    </div> */}
                </div>
                {/* Activity Log */}
                {/* <div className="rounded-3xl bg-white/70 backdrop-blur shadow-lg p-6">
                    <h3 className="font-semibold text-lg text-sky-900 mb-4">
                        Recent System Activity
                    </h3>
                    <ul className="space-y-4 text-sm text-gray-700">
                        <li>✔ New bus added (Bus #45)</li>
                        <li>✏ Route 120 updated</li>
                        <li>🧑 User role changed to Owner</li>
                        <li>📢 Alert sent to Route 138</li>
                    </ul>
                </div> */}
                {/* Quick actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {quickActions.map((action, index) => (
                        <button 
                            key={index}
                            className="rounded-2xl bg-white/70 backdrop-blur shadow-md 
                            p-5 text-left hover:shadow-xl hover:scale-105 
                            transition"
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

export default AdminDashboard;
