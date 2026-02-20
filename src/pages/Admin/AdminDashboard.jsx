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
                const [
                    authRes,
                    busRes,
                    tripRes,
                    alertRes
                ] = await Promise.all([
                    dashboardAPI.getAuthCount(),
                    dashboardAPI.getBusCount(),
                    dashboardAPI.getTripCount(),
                    dashboardAPI.getAlertCount()
                ]);

                setStats({
                    users: authRes.data.total,
                    buses: busRes.data.total,
                    trips: tripRes.data.total,
                    alerts: alertRes.data.total,
                });

            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            }
        };


        fetchStats();
    }, []);

    const quickActions = [
        { title: "User", desc: "Manage users", icon: <FaUsers/>, path: "/user" },
        { title: "Alert", desc: "Create & manage system alerts", icon: <FaExclamationTriangle/>, path: "/alert" },
        { title: "Auth", desc: "Authentication & access control", icon: <FaLock/>, path: "/auth" },
        { title: "Bus", desc: "Manage buses", icon: <FaBus/>, path: "/bus" },
        { title: "Bus Assignment", desc: "Assign buses to routes", icon: <FaBusAlt/>, path: "/busAssignment" },
        { title: "Bus Type", desc: "Manage bus categories", icon: <FaRoad/>, path: "/busType" },
        { title: "Crowd Report", desc: "View crowd level reports", icon: <FaClipboardList/>, path: "/crowdReport" },
        { title: "Favourite Route", desc: "User saved routes", icon: <FaHeart/>, path: "/favouriteRoute" },
        { title: "Feedback", desc: "Passenger feedback", icon: <FaCommentDots/>, path: "/feedback" },
        { title: "Notification", desc: "Send notifications", icon: <FaBell/>, path: "/notification" },
        { title: "Report History", desc: "Syatem activity logs", icon: <FaHistory/>, path: "/reportHistory" },
        { title: "Role", desc: "Manage user roles", icon: <FaUserShield/>, path: "/role" },
        { title: "Route", desc: "Create & edit routes", icon: <FaRoute/>, path: "/route" },
        { title: "Route Stop", desc: "Manage route stops", icon: <FaMapSigns/>, path: "/routeStop" },
        { title: "Trip", desc: "Manage trips", icon: <FaRoad/>, path: "/trip" },
        { title: "Current Situation", desc: "Manage live bus situations", icon: <FaClipboardList/>, path: "/currentSituation" },

    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-black via-[#050505] to-[#0f0f0f] p-6 text-white font-[Inter] overflow-hidden">

            {/* 🔥 Animated Gold Shimmer Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent 
                            animate-[shimmer_3s_linear_infinite]" />

            {/* ✨ Glass Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

            {/* Main container */}
            <div className="relative mt-13 max-w-7xl mx-auto space-y-8 animate-[fadeIn_1.2s_ease-out]">

                {/* Welcome Bar */}
                <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-yellow-600/30 
                                shadow-[0_0_50px_rgba(255,215,0,0.06)] p-6 transition duration-500">
                    <h1 className="text-3xl font-semibold tracking-wide text-white font-[Playfair_Display]">
                        Admin Command Center 
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Full system control & real-time monitoring
                    </p>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((item, index) => (
                        <div 
                            key={index}
                            className="rounded-3xl bg-white/5 backdrop-blur-xl border border-yellow-600/20 
                                       shadow-[0_0_30px_rgba(255,215,0,0.05)] p-6
                                       hover:shadow-[0_0_80px_rgba(255,215,0,0.25)]
                                       hover:border-yellow-500/50 
                                       transition-all duration-500 animate-[fadeUp_1s_ease-out]"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 tracking-wide">
                                        {item.title}
                                    </p>
                                    <h2 className="text-3xl font-bold text-white mt-2">
                                        {item.value}
                                    </h2>
                                </div>
                                <div className="text-3xl text-yellow-500 drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]">
                                    {item.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live Operations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-4 rounded-3xl bg-white/5 backdrop-blur-2xl 
                                    border border-yellow-600/20 
                                    shadow-[0_0_40px_rgba(255,215,0,0.05)] p-6 animate-[fadeUp_1.2s_ease-out]">
                        <h3 className="font-semibold text-lg text-white mb-4 tracking-wide">
                            Live Bus Locations
                        </h3>
                        <div className="h-64 rounded-2xl bg-black/70 border border-yellow-600/10
                                        flex items-center justify-center text-gray-400">
                            <FaMapMarkedAlt className="ml-3 text-4xl text-yellow-500 drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]"/>
                            <span className="mt-3 ml-3">Live Map Preview</span>
                        </div>
                    </div>

                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {quickActions.map((action, index) => (
                        <button 
                            key={index}
                            className="rounded-2xl bg-white/5 backdrop-blur-xl border border-yellow-600/20 
                                       shadow-[0_0_25px_rgba(255,215,0,0.04)] 
                                       p-5 text-left 
                                       hover:border-yellow-500/60 
                                       hover:shadow-[0_0_70px_rgba(255,215,0,0.3)] 
                                       hover:-translate-y-2
                                       transition-all duration-500 animate-[fadeUp_1.4s_ease-out]"
                            onClick={() => navigate(action.path)}
                        >
                            <div className="text-2xl text-yellow-500 mb-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.7)]">
                                {action.icon}
                            </div>
                            <h4 className="font-semibold text-white tracking-wide">
                                {action.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                                {action.desc}
                            </p>
                        </button>
                    ))}
                </div>

            </div>

            {/* 💎 Custom Animations */}
            <style>
                {`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>

        </div>
    );
};

export default AdminDashboard;
