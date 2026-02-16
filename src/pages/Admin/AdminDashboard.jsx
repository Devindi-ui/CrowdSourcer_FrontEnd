import React from "react";
import { FaUsers, FaBus, FaRoute, FaTripadvisor, FaExclamationTriangle, FaPlus, FaBell,
    FaMapMarkedAlt, FaClipboardList, FaBusAlt, FaMapSigns, FaHeart, 
    FaCommentDots, FaHistory, FaUserShield, FaLock, FaRoad
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { dashboardAPI } from "../../services/api";


const AdminDashboard = () => {
    const navigate = useNavigate();

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
            title: "User",
            desc: "Manage users",
            icon: <FaUsers/>,
            path: "/user"
        },
        {
            title: "Alert",
            desc: "Create & manage system alerts",
            icon: <FaExclamationTriangle/>,
            path: "/alert"
        },
        {
            title: "Auth",
            desc: "Authentication & access control",
            icon: <FaLock/>,
            path: "/auth"
        },
        {
            title: "Bus",
            desc: "Manage buses",
            icon: <FaBus/>,
            path: "/bus"
        },
        {
            title: "Bus Assignment",
            desc: "Assign buses to routes",
            icon: <FaBusAlt/>,
            path: "/busAssignment"
        },
        {
            title: "Bus Type",
            desc: "Manage bus categories",
            icon: <FaRoad/>,
            path: "/busType"
        },
        {
            title: "Crowd Report",
            desc: "View crowd level reports",
            icon: <FaClipboardList/>,
            path: "/crowdReport"
        },
        {
            title: "Favourite Route",
            desc: "User saved routes",
            icon: <FaHeart/>,
            path: "/favouriteRoute"
        },
        {
            title: "Feedback",
            desc: "Passenger feedback",
            icon: <FaCommentDots/>,
            path: "/feedback"
        },
        {
            title: "Notification",
            desc: "Send notifications",
            icon: <FaBell/>,
            path: "/notification"
        },
        {
            title: "Report History",
            desc: "Syatem activity logs",
            icon: <FaHistory/>,
            path: "/reportHistory"
        },
        {
            title: "Role",
            desc: "Manage user roles",
            icon: <FaUserShield/>,
            path: "/role"
        },
        {
            title: "Route",
            desc: "Create & edit routes",
            icon: <FaRoute/>,
            path: "/route"
        },
        {
            title: "Route Stop",
            desc: "Manage route stops",
            icon: <FaMapSigns/>,
            path: "/routeStop"
        },
        {
            title: "Trip",
            desc: "Manage trips",
            icon: <FaRoad/>,
            path: "/trip"
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1f3a] to-[#1e3a8a] p-6 text-gray-100">

            {/* Main container */}
            <div className="mt-13 max-w-7xl mx-auto space-y-8">
                {/* Welcome Bar */}
                <div className="rounded-3xl bg-[#0b1f3a] border border-blue-700 shadow-2xl p-6">
                    <h1 className="text-2xl font-bold text-blue-300 tracking-wide">
                        Admin Command Center 
                    </h1>
                    <p className="text-sm text-blue-200">
                        Full system control & real-time monitoring
                    </p>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((item, index) => (
                        <div 
                            key={index}
                            className="rounded-3xl bg-[#0b1f3a] border border-blue-700 shadow-xl p-6 
                            hover:bg-[#132c52] hover:shadow-2xl transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-200">
                                        {item.title}
                                    </p>
                                    <h2 className="text-3xl font-bold text-white mt-2">
                                        {item.value}
                                    </h2>
                                </div>
                                <div className="text-3xl text-blue-400">
                                    {item.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live Operations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Map */}
                    <div className="lg:col-span-4 rounded-3xl bg-[#0b1f3a] border border-blue-700 shadow-2xl p-6">
                        <h3 className="font-semibold text-lg text-blue-300 mb-4">
                            Live Bus Locations
                        </h3>
                        <div className="h-64 rounded-2xl bg-[#132c52] 
                            flex items-center justify-center text-blue-300">
                            <FaMapMarkedAlt className="ml-3 text-4xl text-blue-400"/>
                            <span className="mt-3 ml-3">Live Map Preview</span>
                        </div>
                    </div>

                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {quickActions.map((action, index) => (
                        <button 
                            key={index}
                            className="rounded-2xl bg-[#0b1f3a] border border-blue-700 shadow-lg 
                            p-5 text-left hover:bg-[#132c52] hover:scale-105 
                            transition text-white"
                            onClick={() => navigate(action.path)}
                        >
                            <div className="text-2xl text-blue-400 mb-2">
                                {action.icon}
                            </div>
                            <h4 className="font-semibold text-blue-200">
                                {action.title}
                            </h4>
                            <p className="text-sm text-blue-300">
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
