import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FaBus, FaUserTie, FaUsers, FaCalendarAlt, 
    FaPlus, FaChartLine, FaRoute, FaClock,
    FaMapMarkerAlt, FaHistory, FaCalendarDay
} from "react-icons/fa";
import { ownerAPI, currentSituationAPI } from "../../services/api";

// Helper functions for Sri Lanka timezone (UTC+5:30)
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

const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [stats, setStats] = useState({
        totalBuses: 0,
        totalDrivers: 0,
        totalConductors: 0,
        activeTrips: 0
    });
    const [myBuses, setMyBuses] = useState([]);
    const [myStaff, setMyStaff] = useState([]);
    const [recentTrips, setRecentTrips] = useState([]);
    const [latestSituations, setLatestSituations] = useState({});

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const ownerId = sessionStorage.getItem('userId');
            
            if (!ownerId) {
                console.error("No ownerId found");
                setLoading(false);
                return;
            }
            
            // Fetch stats
            const statsRes = await ownerAPI.getDashboardStats(ownerId);
            if (statsRes.data?.success) {
                setStats(statsRes.data.data);
            }
            
            // Fetch MY BUSES
            const busesRes = await ownerAPI.getMyBuses(ownerId);
            if (busesRes.data?.success) {
                setMyBuses(busesRes.data.data);
            }
            
            // Fetch MY STAFF
            const driversRes = await ownerAPI.getMyStaff(5, ownerId);
            const conductorsRes = await ownerAPI.getMyStaff(6, ownerId);
            const allStaff = [
                ...(driversRes.data?.data || []),
                ...(conductorsRes.data?.data || [])
            ];
            setMyStaff(allStaff);
            
            // Fetch ALL current situations
            const situationsRes = await currentSituationAPI.getAll();
            let allSituations = situationsRes.data?.data || [];
            
            // Group latest situations by bus
            const latestSituationByBus = {};
            allSituations.forEach(sit => {
                const busNumber = sit.bus_number;
                const sitDate = new Date(sit.created_at || sit.updated_at);
                if (!latestSituationByBus[busNumber] || 
                    new Date(latestSituationByBus[busNumber].created_at) < sitDate) {
                    latestSituationByBus[busNumber] = sit;
                }
            });
            
            // Fetch RECENT TRIPS
            const tripsRes = await ownerAPI.getMyTrips(ownerId);
            if (tripsRes.data?.success) {
                const todaySriLanka = getTodaySriLanka();
                const allTrips = tripsRes.data.data;
                
                // Filter ongoing trips for today
                const ongoingTrips = allTrips.filter(trip => {
                    if (!trip.date) return false;
                    const tripDateSriLanka = toSriLankaDate(trip.date);
                    const isToday = tripDateSriLanka === todaySriLanka;
                    const isOngoing = trip.status === 'ongoing';
                    return isToday && isOngoing;
                });
                
                setRecentTrips(ongoingTrips);
                
                // Get latest situations for each trip's bus
                const situationsMap = {};
                for (const trip of ongoingTrips) {
                    const busSituations = allSituations.filter(s => s.bus_number === trip.bus_number);
                    const sortedSituations = busSituations.sort((a, b) => 
                        new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at)
                    );
                    if (sortedSituations[0]) {
                        situationsMap[trip.bus_number] = sortedSituations[0];
                    }
                }
                setLatestSituations(situationsMap);
            }
            
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { title: "Add Bus", desc: "Register new bus", icon: <FaPlus />, path: "/owner/buses", bg: "from-yellow-600 to-yellow-500" },
        { title: "Add Driver", desc: "Register new driver", icon: <FaUserTie />, path: "/owner/staff", bg: "from-gray-600 to-gray-500" },
        { title: "Add Conductor", desc: "Register new conductor", icon: <FaUsers />, path: "/owner/staff", bg: "from-silver-600 to-silver-500" },
        { title: "Manage Trips", desc: "Schedule and manage trips", icon: <FaCalendarAlt />, path: "/owner/trips", bg: "from-yellow-700 to-yellow-600" },
        { title: "Manage Reports", desc: "View crowd reports", icon: <FaChartLine />, path: "/owner/crowd-report", bg: "from-gray-700 to-gray-600" },
    ];

    const statCards = [
        { title: "Total Buses", value: stats.totalBuses, icon: <FaBus />, color: "text-yellow-400" },
        { title: "Drivers", value: stats.totalDrivers, icon: <FaUserTie />, color: "text-gray-300" },
        { title: "Conductors", value: stats.totalConductors, icon: <FaUsers />, color: "text-white" },
        { title: "Active Trips", value: stats.activeTrips, icon: <FaCalendarAlt />, color: "text-yellow-500" },
    ];

    const formatTripTime = (time) => {
        if (!time) return "N/A";
        return time.substring(0, 5);
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return "N/A";
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        return past.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-yellow-400 animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/30 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></span>
                    Owner Dashboard
                </h1>
                <p className="text-gray-400 mt-1">Manage your buses, drivers, and operations</p>
            </div>

            {/* Date and Time Banner - Like PassengerDashboard */}
            <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-yellow-400" />
                        <span className="text-gray-300">{formatDate(currentDateTime)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaClock className="text-yellow-400" />
                        <span className="text-yellow-400 font-mono font-semibold">{formatTime(currentDateTime)}</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div key={index}
                        className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-all duration-300"
                    >
                        <div className={`${stat.color} text-2xl mb-2`}>{stat.icon}</div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-400">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></span>
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(action.path)}
                            className={`bg-gradient-to-r ${action.bg} rounded-xl p-4 text-white hover:scale-105 hover:shadow-lg transition-all duration-300`}
                        >
                            <div className="text-2xl mb-2">{action.icon}</div>
                            <h4 className="font-semibold text-sm">{action.title}</h4>
                            <p className="text-xs opacity-80">{action.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Two Column Layout - My Buses & My Staff */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Buses */}
                <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-2xl p-4">
                    <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                        <span className="w-1 h-4 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></span>
                        My Buses ({myBuses.length})
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {myBuses.length > 0 ? (
                            myBuses.map(bus => (
                                <div 
                                    key={bus.bus_id} 
                                    onClick={() => navigate(`/owner/buses?busId=${bus.bus_id}`)}
                                    className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-yellow-600/20 cursor-pointer hover:border-yellow-500 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaBus className="text-yellow-400" />
                                        <div>
                                            <p className="text-sm font-semibold text-white">{bus.bus_number}</p>
                                            <p className="text-xs text-gray-400">{bus.route_name}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${bus.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {bus.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">No buses added yet</p>
                        )}
                    </div>
                </div>

                {/* My Staff */}
                <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-2xl p-4">
                    <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                        <span className="w-1 h-4 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></span>
                        My Staff ({myStaff.length})
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {myStaff.length > 0 ? (
                            myStaff.map(staff => (
                                <div key={staff.user_id} className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-yellow-600/20">
                                    <div className="flex items-center gap-3">
                                        {staff.role_name === 'Driver' ? 
                                            <FaUserTie className="text-yellow-400" /> : 
                                            <FaUsers className="text-yellow-400" />
                                        }
                                        <div>
                                            <p className="text-sm font-semibold text-white">{staff.name}</p>
                                            <p className="text-xs text-gray-400">{staff.role_name}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">No staff members added yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Ongoing Trips Today - No View All Button */}
            <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <span className="w-1 h-4 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></span>
                        Ongoing Trips Today ({recentTrips.length})
                    </h3>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {recentTrips.length > 0 ? (
                        recentTrips.map(trip => {
                            const latestSit = latestSituations[trip.bus_number];
                            return (
                                <div key={trip.trip_id} className="bg-black/60 rounded-xl border border-yellow-600/20 p-3 hover:border-yellow-500 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <FaBus className="text-yellow-400 text-sm" />
                                            <span className="font-semibold text-white text-sm">{trip.bus_number}</span>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                            🟢 ONGOING
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                        <div className="flex items-center gap-1">
                                            <FaRoute className="text-yellow-400/70" />
                                            <span className="text-gray-400">Route:</span>
                                            <span className="text-white">{trip.route_no}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FaClock className="text-yellow-400/70" />
                                            <span className="text-gray-400">Time:</span>
                                            <span className="text-white">{formatTripTime(trip.start_time)} - {formatTripTime(trip.end_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 col-span-2">
                                            <FaRoute className="text-yellow-400/70" />
                                            <span className="text-gray-400">Route Name:</span>
                                            <span className="text-white truncate">{trip.route_name}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Latest Current Situation */}
                                    {latestSit && (
                                        <div className="mt-2 pt-2 border-t border-yellow-600/20">
                                            <div className="flex items-center gap-2 text-xs">
                                                <FaMapMarkerAlt className="text-yellow-400" />
                                                <span className="text-gray-400">Current Stop:</span>
                                                <span className="text-yellow-300">{latestSit.current_stop}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <FaUsers className="text-yellow-400/70" />
                                                    <span className="text-gray-400">Passengers:</span>
                                                    <span className="text-white">{latestSit.avg_passengers}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaHistory className="text-yellow-400/70" />
                                                    <span className="text-gray-400">Updated:</span>
                                                    <span className="text-gray-500">{formatTimeAgo(latestSit.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!latestSit && (
                                        <div className="mt-2 pt-2 border-t border-yellow-600/20 text-center text-xs text-gray-500">
                                            No current situation reported
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8">
                            <FaCalendarAlt className="text-4xl text-yellow-400/30 mx-auto mb-2" />
                            <p className="text-gray-500">No ongoing trips for today</p>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 215, 0, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 215, 0, 0.5);
                }
                `}
            </style>
        </div>
    );
};

export default OwnerDashboard;