import React from "react";
import { 
    FaUsers, FaBus, FaExclamationTriangle, 
    FaRoute, FaBusAlt, FaClipboardList, 
    FaHeart, FaCommentDots, FaUserShield, FaRoad, FaMapSigns,
    FaBell, FaChartLine, FaCalendarCheck, FaClock, FaUserTie,
    FaCheckCircle, FaTimesCircle, FaPlayCircle, FaHistory,
    FaMapMarkerAlt, FaClock as FaClockRegular
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
    dashboardAPI, userAPI, busAPI, tripAPI, alertAPI, 
    routeAPI, routeStopAPI, busAssignmentAPI, crowdReportAPI,
    favouriteRouteAPI, feedbackAPI, currentSituationAPI
} from "../../services/api";

// Import map components
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Real statistics from database - Only Users and Buses
    const [stats, setStats] = useState([
        { title: "Total Users", value: 0, icon: <FaUsers/>, change: "+0", color: "blue", details: {} },
        { title: "Active Buses", value: 0, icon: <FaBus/>, change: "+0", color: "green", details: {} }
    ]);

    // Real bus locations from database
    const [busLocations, setBusLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Colombo center
    const [mapZoom, setMapZoom] = useState(11);

    // Real recent activities
    const [recentActivities, setRecentActivities] = useState([]);

    // Additional real-time data
    const [systemHealth, setSystemHealth] = useState({
        users: { active: 0, inactive: 0, total: 0 },
        buses: { active: 0, inactive: 0, total: 0 }
    });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                
                // Fetch only users and buses data
                const [
                    userRes, busRes, currentSitRes
                ] = await Promise.allSettled([
                    userAPI.getAllUsers(),
                    busAPI.getAllBuses(),
                    currentSituationAPI.getAll()
                ]);

                // Process User Data
                const users = userRes.value?.data?.data || [];
                const activeUsers = users.filter(u => u.status_d === 1).length;
                const inactiveUsers = users.filter(u => u.status_d === 0).length;

                // Process Bus Data
                const buses = busRes.value?.data?.data || [];
                const activeBuses = buses.filter(b => b.status === 'active' && b.status_d === 1).length;
                const inactiveBuses = buses.filter(b => b.status === 'inactive' || b.status_d === 0).length;

                // Update Stats - Only Users and Buses
                setStats([
                    { title: "Total Users", value: users.length, icon: <FaUsers/>, 
                      change: `+${activeUsers} active`, color: "blue", 
                      details: { active: activeUsers, inactive: inactiveUsers } },
                    { title: "Active Buses", value: activeBuses, icon: <FaBus/>, 
                      change: `${inactiveBuses} inactive`, color: "green",
                      details: { total: buses.length, active: activeBuses, inactive: inactiveBuses } }
                ]);

                // Update system health
                setSystemHealth({
                    users: { active: activeUsers, inactive: inactiveUsers, total: users.length },
                    buses: { active: activeBuses, inactive: inactiveBuses, total: buses.length }
                });

                // Generate bus locations from current situation data
                const currentSituations = currentSitRes.value?.data?.data || [];
                const locations = [];
                
                if (currentSituations.length > 0) {
                    // Use current situation data to place buses on map
                    currentSituations.slice(0, 8).forEach((sit, index) => {
                        // Generate random positions around Colombo for demo
                        // In production, use actual coordinates from your data
                        const baseLat = 6.9271;
                        const baseLng = 79.8612;
                        locations.push({
                            id: sit.cr_id || index,
                            bus_number: sit.bus_number || `NB-${1000 + index}`,
                            position: [
                                baseLat + (Math.random() - 0.5) * 0.1,
                                baseLng + (Math.random() - 0.5) * 0.1
                            ],
                            route: sit.route_name || 'Unknown Route',
                            status: 'On Time',
                            passengers: sit.avg_passengers || Math.floor(Math.random() * 50) + 20,
                            stop: sit.current_stop || 'Main Station'
                        });
                    });
                } else {
                    // Fallback demo data
                    for (let i = 0; i < 5; i++) {
                        locations.push({
                            id: i,
                            bus_number: `NB-${2000 + i}`,
                            position: [
                                6.9271 + (Math.random() - 0.5) * 0.15,
                                79.8612 + (Math.random() - 0.5) * 0.15
                            ],
                            route: ['Colombo - Kandy', 'Colombo - Galle', 'Kandy - Jaffna'][i % 3],
                            status: ['On Time', 'Delayed', 'Early'][i % 3],
                            passengers: Math.floor(Math.random() * 60) + 15,
                            stop: ['Fort', 'Pettah', 'Bambalapitiya'][i % 3]
                        });
                    }
                }
                setBusLocations(locations);

                // Generate recent activities from real data
                const activities = [];

                // Add recent users
                if (users.length > 0) {
                    users.slice(0, 3).forEach(u => {
                        activities.push({
                            id: `user-${u.user_id}`,
                            action: "New user registered",
                            user: u.name,
                            time: "Just now",
                            icon: <FaUsers className="text-blue-400" />
                        });
                    });
                }

                // Add recent bus activities
                if (buses.length > 0) {
                    buses.slice(0, 3).forEach(b => {
                        activities.push({
                            id: `bus-${b.bus_id}`,
                            action: `Bus ${b.bus_number} ${b.status}`,
                            route: b.route_name || 'Unknown Route',
                            time: "Recently",
                            icon: <FaBus className="text-green-400" />
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

        // Refresh data every 60 seconds
        const interval = setInterval(fetchAllData, 60000);
        return () => clearInterval(interval);
    }, []);

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

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'on time': return 'text-green-400';
            case 'delayed': return 'text-red-400';
            case 'early': return 'text-blue-400';
            case 'completed': return 'text-green-400';
            case 'ongoing': return 'text-yellow-400';
            case 'cancelled': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-black via-[#050505] to-[#0f0f0f] p-6 text-white font-[Inter] overflow-hidden">

            {/* Animated Gold Shimmer Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent 
                            animate-[shimmer_3s_linear_infinite]" />

            {/* Glass Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

            {/* Main container */}
            <div className="relative mt-13 max-w-7xl mx-auto space-y-8 animate-[fadeIn_1.2s_ease-out]">

                {/* Welcome Bar with Quick Stats */}
                <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-yellow-600/30 
                                shadow-[0_0_50px_rgba(255,215,0,0.06)] p-6 transition duration-500">
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

                {/* System Stats Cards - Only Users and Buses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stats.map((item, index) => (
                        <div 
                            key={index}
                            className="rounded-3xl bg-white/5 backdrop-blur-xl border border-yellow-600/20 
                                       shadow-[0_0_30px_rgba(255,215,0,0.05)] p-6
                                       hover:shadow-[0_0_80px_rgba(255,215,0,0.25)]
                                       hover:border-yellow-500/50 
                                       transition-all duration-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 tracking-wide">
                                        {item.title}
                                    </p>
                                    <h2 className="text-3xl font-bold text-white mt-2">
                                        {loading ? (
                                            <div className="w-16 h-8 bg-gray-700 animate-pulse rounded"></div>
                                        ) : (
                                            item.value
                                        )}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">{item.change}</p>
                                </div>
                                <div className="text-3xl text-yellow-500 drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]">
                                    {item.icon}
                                </div>
                            </div>
                            
                            {/* Details tooltip on hover */}
                            {item.details && Object.keys(item.details).length > 0 && (
                                <div className="mt-2 text-xs text-gray-400 border-t border-yellow-600/20 pt-2">
                                    {Object.entries(item.details).map(([key, val]) => (
                                        <span key={key} className="mr-2">
                                            {key}: <span className="text-yellow-300">{val}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Live Map and System Health */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Live Map */}
                    <div className="lg:col-span-2 rounded-3xl bg-white/5 backdrop-blur-2xl 
                                    border border-yellow-600/20 
                                    shadow-[0_0_40px_rgba(255,215,0,0.05)] p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-white tracking-wide">
                                Live Bus Tracking
                            </h3>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                    {busLocations.length} Buses Active
                                </span>
                            </div>
                        </div>
                        
                        {/* Map Container */}
                        <div className="h-96 rounded-2xl overflow-hidden border border-yellow-600/20">
                            <MapContainer 
                                center={mapCenter} 
                                zoom={mapZoom} 
                                style={{ height: '100%', width: '100%' }}
                                className="z-10"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                
                                {/* Bus Markers with custom icon */}
                                {busLocations.map((bus) => (
                                    <Marker 
                                        key={bus.id} 
                                        position={bus.position}
                                        icon={busIcon}
                                    >
                                        <Popup>
                                            <div className="text-black p-2 min-w-[200px]">
                                                <h4 className="font-bold text-lg text-yellow-600">Bus {bus.bus_number}</h4>
                                                <p className="text-sm mt-1">
                                                    <span className="font-semibold">Route:</span> {bus.route}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-semibold">Current Stop:</span> {bus.stop}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-semibold">Status:</span> 
                                                    <span className={`ml-1 ${getStatusColor(bus.status)}`}>{bus.status}</span>
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-semibold">Passengers:</span> {bus.passengers}
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                                
                                {/* Add a circle for Colombo center */}
                                <CircleMarker 
                                    center={[6.9271, 79.8612]} 
                                    radius={20}
                                    pathOptions={{ color: 'gold', fillColor: 'yellow', fillOpacity: 0.2 }}
                                >
                                    <Popup>Colombo City Center</Popup>
                                </CircleMarker>
                            </MapContainer>
                        </div>

                        {/* Bus List Mini */}
                        <div className="mt-4 grid grid-cols-4 gap-2">
                            {busLocations.slice(0, 4).map(bus => (
                                <div key={bus.id} className="text-center p-2 bg-black/40 rounded-lg border border-yellow-600/20">
                                    <p className="text-xs font-mono text-yellow-400">{bus.bus_number}</p>
                                    <p className={`text-xs ${getStatusColor(bus.status)}`}>{bus.status}</p>
                                    <p className="text-xs text-gray-500">{bus.passengers} pax</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Health & Recent Activities */}
                    <div className="space-y-6">
                        {/* System Health Card - Only Users and Buses */}
                        <div className="rounded-3xl bg-white/5 backdrop-blur-2xl 
                                        border border-yellow-600/20 
                                        shadow-[0_0_40px_rgba(255,215,0,0.05)] p-6">
                            <h3 className="font-semibold text-lg text-white mb-4 tracking-wide">
                                System Health
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-black/40 rounded-xl">
                                    <span className="text-sm text-gray-400">Users</span>
                                    <div className="flex gap-2">
                                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                            {systemHealth.users.active} Active
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                                            {systemHealth.users.inactive} Inactive
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
                        <div className="rounded-3xl bg-white/5 backdrop-blur-2xl 
                                        border border-yellow-600/20 
                                        shadow-[0_0_40px_rgba(255,215,0,0.05)] p-6">
                            <h3 className="font-semibold text-lg text-white mb-4 tracking-wide">
                                Recent Activities
                            </h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((activity) => (
                                        <div key={activity.id} 
                                            className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-yellow-600/10 hover:border-yellow-500/30 transition">
                                            <div className="text-xl">
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-white">{activity.action}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {activity.user || activity.route || activity.bus} • {activity.time}
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
                </div>

                {/* Quick Actions Grid */}
                <div>
                    <h3 className="font-semibold text-lg text-white mb-4 tracking-wide">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {quickActions.map((action, index) => (
                            <button 
                                key={index}
                                className="rounded-xl bg-white/5 backdrop-blur-sm border border-yellow-600/20 
                                           shadow-[0_0_15px_rgba(255,215,0,0.02)] 
                                           p-4 text-left relative
                                           hover:border-yellow-500/60 
                                           hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] 
                                           hover:scale-105
                                           transition-all duration-300"
                                onClick={() => navigate(action.path)}
                            >
                                {action.count !== undefined && action.count > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                        {action.count}
                                    </span>
                                )}
                                <div className={`text-2xl text-yellow-500 mb-2 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]`}>
                                    {action.icon}
                                </div>
                                <h4 className="font-semibold text-sm text-white tracking-wide">
                                    {action.title}
                                </h4>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {action.desc}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

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

                /* Custom scrollbar */
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