import React from "react";
import { 
    FaUsers, FaBus, FaExclamationTriangle, 
    FaRoute, FaBusAlt, FaClipboardList, 
    FaHeart, FaCommentDots, FaUserShield, FaRoad, FaMapSigns,
    FaBell, FaChartLine, FaCalendarCheck, FaClock, FaUserTie,
    FaCheckCircle, FaTimesCircle, FaPlayCircle, FaHistory,
    FaMapMarkerAlt, FaClock as FaClockRegular, FaFilter
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
    userAPI, busAPI, tripAPI, alertAPI, 
    routeAPI, routeStopAPI, favouriteRouteAPI, 
    feedbackAPI, currentSituationAPI, busTypeAPI
} from "../../services/api";

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Real statistics
    const [stats, setStats] = useState([
        { title: "Total Users", value: 0, icon: <FaUsers/>, change: "+0", color: "blue", details: {} },
        { title: "Active Buses", value: 0, icon: <FaBus/>, change: "+0", color: "green", details: {} }
    ]);

    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);
    const [systemHealth, setSystemHealth] = useState({
        users: { active: 0, total: 0 },
        buses: { active: 0, inactive: 0, total: 0 }
    });

    // Buses list states
    const [allBuses, setAllBuses] = useState([]);
    const [filteredBuses, setFilteredBuses] = useState([]);
    const [trips, setTrips] = useState([]);
    const [busTypes, setBusTypes] = useState([]);
    const [routeStops, setRouteStops] = useState({});
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("all");
    const [expandedStops, setExpandedStops] = useState({});

    // Helper functions for timezone
    const toSriLankaDate = (utcDate) => {
        if (!utcDate) return null;
        const date = new Date(utcDate);
        const sriLankaTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
        return sriLankaTime.toISOString().split('T')[0];
    };

    const getTodaySriLanka = () => {
        const now = new Date();
        const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        return sriLankaTime.toISOString().split('T')[0];
    };

    // Find ongoing trip for a bus
    const findOngoingTrip = (busId) => {
        const todaySriLanka = getTodaySriLanka();
        return trips.find(trip => {
            if (!trip.date || trip.status !== 'ongoing') return false;
            if (trip.bus_id !== busId) return false;
            const tripDateSriLanka = toSriLankaDate(trip.date);
            return tripDateSriLanka === todaySriLanka;
        });
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                
                const [
                    userRes, busRes, tripRes, busTypeRes,
                    situationsRes, feedbackRes
                ] = await Promise.allSettled([
                    userAPI.getAllUsers(),
                    busAPI.getAllBuses(),
                    tripAPI.getAllTrips(),
                    busTypeAPI.getAllBusTypes(),
                    currentSituationAPI.getAll(),
                    feedbackAPI.getAllFeedbacks()
                ]);

                // Process Users
                const users = userRes.value?.data?.data || [];
                const activeUsers = users.filter(u => u.status_d === 1).length;

                // Process Buses
                const buses = busRes.value?.data?.data || [];
                const activeBusesCount = buses.filter(b => b.status === 'active' && b.status_d === 1).length;
                const inactiveBuses = buses.filter(b => b.status === 'inactive' || b.status_d === 0).length;

                // Set Stats
                setStats([
                    { title: "Total Users", value: users.length, icon: <FaUsers/>, 
                      change: `+${activeUsers} active`, color: "blue", 
                      details: { active: activeUsers, inactive: users.length - activeUsers } },
                    { title: "Active Buses", value: activeBusesCount, icon: <FaBus/>, 
                      change: `${inactiveBuses} inactive`, color: "green",
                      details: { total: buses.length, active: activeBusesCount, inactive: inactiveBuses } }
                ]);

                setSystemHealth({
                    users: { active: users.length, total: users.length },
                    buses: { active: activeBusesCount, inactive: inactiveBuses, total: buses.length }
                });

                // Process Trips
                const tripsData = tripRes.value?.data?.data || [];
                setTrips(tripsData);

                // Process Bus Types
                const busTypesData = busTypeRes.value?.data?.data || [];
                const busTypeMap = {};
                busTypesData.forEach(type => {
                    busTypeMap[type.bus_type_id] = type.type_name;
                });
                setBusTypes(busTypeMap);

                // Get ongoing buses for today
                const todaySriLanka = getTodaySriLanka();
                const ongoingTrips = tripsData.filter(trip => {
                    if (!trip.date || trip.status !== 'ongoing') return false;
                    const tripDateSriLanka = toSriLankaDate(trip.date);
                    return tripDateSriLanka === todaySriLanka;
                });

                const ongoingBusIds = new Set(ongoingTrips.map(trip => trip.bus_id));
                
                // Filter active buses that have ongoing trips
                let activeBuses = buses.filter(bus => 
                    bus.status === 'active' && 
                    ongoingBusIds.has(bus.bus_id)
                );
                setAllBuses(activeBuses);
                setFilteredBuses(activeBuses);

                // Extract cities from route names
                const citySet = new Set();
                activeBuses.forEach(bus => {
                    if (bus.route_name) {
                        const parts = bus.route_name.split(' - ');
                        parts.forEach(part => {
                            const trimmed = part.trim();
                            if (trimmed) citySet.add(trimmed);
                        });
                    }
                });
                const uniqueCities = ['all', ...Array.from(citySet).sort()];
                setCities(uniqueCities);

                // Load stops for each bus
                const stopsMap = {};
                for (const bus of activeBuses) {
                    if (bus.route_no) {
                        try {
                            const stopsRes = await routeStopAPI.getByRouteNo(bus.route_no);
                            stopsMap[bus.route_no] = stopsRes?.data?.data || [];
                        } catch (error) {
                            stopsMap[bus.route_no] = [];
                        }
                    }
                }
                setRouteStops(stopsMap);

                // Generate recent activities
                const activities = [];

                const formatTimeAgo = (timestamp) => {
                    if (!timestamp) return "Recently";
                    const now = new Date();
                    const past = new Date(timestamp);
                    const diffMs = now - past;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);
                    
                    if (diffMins < 1) return "Just now";
                    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
                    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                    if (diffDays === 1) return "Yesterday";
                    if (diffDays < 7) return `${diffDays} days ago`;
                    return past.toLocaleDateString();
                };

                // Add recent users
                if (users.length > 0) {
                    [...users].sort((a, b) => b.user_id - a.user_id).slice(0, 3).forEach(u => {
                        activities.push({
                            id: `user-${u.user_id}`,
                            action: "New user registered",
                            user: u.name,
                            time: formatTimeAgo(u.created_at),
                            icon: <FaUsers className="text-blue-400" />
                        });
                    });
                }

                // Add recent buses
                if (buses.length > 0) {
                    [...buses].sort((a, b) => b.bus_id - a.bus_id).slice(0, 3).forEach(b => {
                        activities.push({
                            id: `bus-${b.bus_id}`,
                            action: b.status === 'active' ? "Bus went active" : `Bus ${b.bus_number} updated`,
                            busNumber: b.bus_number,
                            route: b.route_name || 'Unknown',
                            time: "Recently",
                            icon: <FaBus className={b.status === 'active' ? "text-green-400" : "text-yellow-400"} />
                        });
                    });
                }

                setRecentActivities(activities.slice(0, 5));

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
        const interval = setInterval(fetchAllData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleCityChange = (e) => {
        const city = e.target.value;
        setSelectedCity(city);
        
        if (city === 'all') {
            setFilteredBuses(allBuses);
        } else {
            setFilteredBuses(allBuses.filter(bus => 
                bus.route_name && bus.route_name.includes(city)
            ));
        }
    };

    const toggleStops = (busId) => {
        setExpandedStops(prev => ({
            ...prev,
            [busId]: !prev[busId]
        }));
    };

    const goToBusManagement = (busId) => {
        // Navigate to bus management page (you can pass busId via state or URL)
        navigate('/admin/bus', { state: { preselectedBusId: busId } });
    };

    const quickActions = [
        { title: "User", desc: "Manage users", icon: <FaUsers/>, path: "/user", color: "blue", count: stats[0].value },
        { title: "Alert", desc: "Manage alerts", icon: <FaExclamationTriangle/>, path: "/alert", color: "red" },
        { title: "Bus", desc: "Manage buses", icon: <FaBus/>, path: "/bus", color: "green", count: stats[1].value },
        { title: "Bus Assignment", desc: "Assign buses", icon: <FaBusAlt/>, path: "/busAssignment", color: "yellow" },
        { title: "Crowd Report", desc: "View crowd levels", icon: <FaClipboardList/>, path: "/crowdReport", color: "orange" },
        { title: "Favourite Route", desc: "User saved routes", icon: <FaHeart/>, path: "/favouriteRoute", color: "pink" },
        { title: "Feedback", desc: "Passenger feedback", icon: <FaCommentDots/>, path: "/feedback", color: "teal" },
        { title: "Role", desc: "Manage roles", icon: <FaUserShield/>, path: "/role", color: "indigo" },
        { title: "Route", desc: "Manage routes", icon: <FaRoute/>, path: "/route", color: "cyan" },
        { title: "Route Stop", desc: "Manage stops", icon: <FaMapSigns/>, path: "/routeStop", color: "lime" },
        { title: "Trip", desc: "Manage trips", icon: <FaRoad/>, path: "/trip", color: "amber" },
        { title: "Current Situation", desc: "Live updates", icon: <FaClockRegular/>, path: "/currentSituation", color: "emerald" },
    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-black via-[#050505] to-[#0f0f0f] p-6 text-white font-[Inter] overflow-hidden">
            
            {/* Animated Gold Shimmer Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent 
                            animate-[shimmer_3s_linear_infinite]" />

            {/* Main container */}
            <div className="relative mt-13 max-w-7xl mx-auto space-y-8 animate-[fadeIn_1.2s_ease-out]">

                {/* Welcome Bar */}
                <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-yellow-600/30 
                                shadow-[0_0_50px_rgba(255,215,0,0.06)] p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-wide text-white font-[Playfair_Display]">
                                Admin Command Center 
                            </h1>
                            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                <FaHistory className="text-yellow-400" />
                                Last updated: {new Date().toLocaleTimeString()}
                                <span className="text-green-400 text-xs ml-2">
                                    {loading ? 'Updating...' : 'Live'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stats.map((item, index) => (
                        <div key={index}
                            className="rounded-3xl bg-white/5 backdrop-blur-xl border border-yellow-600/20 
                                       shadow-[0_0_30px_rgba(255,215,0,0.05)] p-6
                                       hover:shadow-[0_0_80px_rgba(255,215,0,0.25)]
                                       hover:border-yellow-500/50 transition-all duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 tracking-wide">{item.title}</p>
                                    <h2 className="text-3xl font-bold text-white mt-2">
                                        {loading ? <div className="w-16 h-8 bg-gray-700 animate-pulse rounded"></div> : item.value}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">{item.change}</p>
                                </div>
                                <div className="text-3xl text-yellow-500 drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]">
                                    {item.icon}
                                </div>
                            </div>
                            {item.details && Object.keys(item.details).length > 0 && (
                                <div className="mt-2 text-xs text-gray-400 border-t border-yellow-600/20 pt-2">
                                    {Object.entries(item.details).map(([key, val]) => (
                                        <span key={key} className="mr-2">{key}: <span className="text-yellow-300">{val}</span></span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Active Buses Section - Replaces Map */}
                <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-yellow-600/20 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg text-white tracking-wide flex items-center gap-2">
                            <span className="w-1 h-5 bg-yellow-500 rounded-full"></span>
                            Active & Ongoing Buses
                        </h3>
                        <span className="text-sm px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                            {filteredBuses.length} buses active
                        </span>
                    </div>

                    {/* City Filter */}
                    <div className="flex justify-end mb-6">
                        <div className="relative w-64">
                            <select
                                value={selectedCity}
                                onChange={handleCityChange}
                                className="w-full p-3 bg-black/60 backdrop-blur-xl border border-yellow-600/30 rounded-xl text-gray-300 appearance-none cursor-pointer focus:outline-none focus:border-yellow-500"
                            >
                                {cities.map(city => (
                                    <option key={city} value={city} className="bg-gray-900">
                                        {city === 'all' ? '🚌 All Cities' : `📍 ${city}`}
                                    </option>
                                ))}
                            </select>
                            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400/70 pointer-events-none" />
                        </div>
                    </div>

                    {/* Buses Grid */}
                    {filteredBuses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredBuses.map(bus => {
                                const ongoingTrip = findOngoingTrip(bus.bus_id);
                                const busStops = routeStops[bus.route_no] || [];
                                const displayStops = expandedStops[bus.bus_id] ? busStops : busStops.slice(0, 3);
                                const hasMoreStops = busStops.length > 3;

                                return (
                                    <div
                                        key={bus.bus_id}
                                        onClick={() => goToBusManagement(bus.bus_id)}
                                        className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] transition-all duration-300 group cursor-pointer"
                                    >
                                        {/* Bus Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <FaBus className="text-yellow-400" />
                                                <span className="font-mono text-yellow-400 font-bold">{bus.bus_number}</span>
                                            </div>
                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                                                🟢 ONGOING
                                            </span>
                                        </div>

                                        {/* Route Info */}
                                        <div className="space-y-2 mb-3">
                                            <p className="text-sm text-gray-300">
                                                <FaRoute className="inline mr-1 text-yellow-400/70" />
                                                Route {bus.route_no}: {bus.route_name}
                                            </p>
                                            <div className="flex gap-2 text-xs">
                                                <span className="bg-yellow-500/10 text-yellow-300 px-2 py-1 rounded-full border border-yellow-600/30">
                                                    {busTypes[bus.bus_type_id] || 'Standard'}
                                                </span>
                                                <span className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded-full border border-gray-700">
                                                    {bus.seat_capacity} seats
                                                </span>
                                            </div>
                                            {ongoingTrip && (
                                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                                    <FaClock className="text-yellow-400/70" />
                                                    {ongoingTrip.start_time?.slice(0,5)} - {ongoingTrip.end_time?.slice(0,5)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Route Stops */}
                                        {busStops.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-xs text-yellow-400 mb-2">Route Stops:</p>
                                                <div className="space-y-1">
                                                    {displayStops.map((stop, index) => (
                                                        <div key={stop.stop_order_id || index} className="flex items-center gap-2 text-xs">
                                                            <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-[10px] border border-yellow-600/30">
                                                                {index + 1}
                                                            </span>
                                                            <span className="text-gray-400">{stop.stop_name}</span>
                                                        </div>
                                                    ))}
                                                    {hasMoreStops && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleStops(bus.bus_id);
                                                            }}
                                                            className="text-yellow-400 text-xs hover:text-yellow-300 transition-colors mt-1 ml-6"
                                                        >
                                                            {expandedStops[bus.bus_id] ? 'Show less ↑' : `+${busStops.length - 3} more stops ↓`}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-black/40 backdrop-blur-xl rounded-2xl border border-yellow-600/20">
                            <FaBus className="text-6xl text-yellow-400/30 mx-auto mb-4" />
                            <h3 className="text-xl text-white mb-2">No Active Buses</h3>
                            <p className="text-gray-400">No buses are currently active with ongoing trips.</p>
                        </div>
                    )}
                </div>

                {/* System Health & Recent Activities - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* System Health Card */}
                    <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-yellow-600/20 p-6">
                        <h3 className="font-semibold text-lg text-white mb-4 tracking-wide">System Health</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-black/40 rounded-xl">
                                <span className="text-sm text-gray-400">Users</span>
                                <div className="flex gap-2">
                                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                        {systemHealth.users.active} Active
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded">
                                        {systemHealth.users.total} Total
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-black/40 rounded-xl">
                                <span className="text-sm text-gray-400">Buses</span>
                                <div className="flex gap-2">
                                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                        {systemHealth.buses.active} Active
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded">
                                        {systemHealth.buses.inactive} Inactive
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-yellow-600/20 p-6">
                        <h3 className="font-semibold text-lg text-white mb-4 tracking-wide">Recent Activities</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity) => (
                                    <div key={activity.id} 
                                        className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-yellow-600/10 hover:border-yellow-500/30 transition">
                                        <div className="text-xl">{activity.icon}</div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white">{activity.action}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {activity.user || activity.route || activity.busNumber} • {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No recent activities</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid
                <div>
                    <h3 className="font-semibold text-lg text-white mb-4 tracking-wide">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {quickActions.map((action, index) => (
                            <button 
                                key={index}
                                className="rounded-xl bg-white/5 backdrop-blur-sm border border-yellow-600/20 
                                           shadow-[0_0_15px_rgba(255,215,0,0.02)] p-4 text-left relative
                                           hover:border-yellow-500/60 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] 
                                           hover:scale-105 transition-all duration-300"
                                onClick={() => navigate(action.path)}
                            >
                                {action.count !== undefined && action.count > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                        {action.count}
                                    </span>
                                )}
                                <div className="text-2xl text-yellow-500 mb-2 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
                                    {action.icon}
                                </div>
                                <h4 className="font-semibold text-sm text-white tracking-wide">{action.title}</h4>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{action.desc}</p>
                            </button>
                        ))}
                    </div>
                </div> */}

            </div>

            {/* Custom Animations */}
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
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 10px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 215, 0, 0.3);
                    border-radius: 10px;
                }
                `}
            </style>

        </div>
    );
};

export default AdminDashboard;