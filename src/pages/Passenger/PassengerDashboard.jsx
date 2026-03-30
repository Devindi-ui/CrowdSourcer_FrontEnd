import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
    FaBus, FaHeart, FaCommentDots, FaExclamationTriangle,
    FaMapMarkerAlt, FaUser, FaStar, FaRoute, FaClock, 
    FaUsers, FaPlus, FaMapMarkedAlt, FaEye, 
    FaCalendarAlt, FaFilter, FaBell
} from "react-icons/fa";
import { 
    busAPI, currentSituationAPI, favouriteRouteAPI, feedbackAPI,
    tripAPI, busTypeAPI, routeStopAPI, routeAPI, alertAPI
} from "../../services/api";

const PassengerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    
    // User data from sessionStorage
    const [userName, setUserName] = useState("Guest");
    const [userLocation, setUserLocation] = useState("Sri Lanka");
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempLocation, setTempLocation] = useState("");
    const [tempName, setTempName] = useState("");

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Data states
    const [allBuses, setAllBuses] = useState([]);
    const [filteredBuses, setFilteredBuses] = useState([]);
    const [trips, setTrips] = useState([]);
    const [busTypes, setBusTypes] = useState([]);
    const [routeStops, setRouteStops] = useState({});
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("all");
    const [expandedStops, setExpandedStops] = useState({});
    
    // Existing states
    const [recentSituations, setRecentSituations] = useState([]);
    const [favouriteRoutes, setFavouriteRoutes] = useState([]);
    const [recentFeedback, setRecentFeedback] = useState([]);
    const [showBusSelector, setShowBusSelector] = useState(false);
    const [userStats] = useState({
        totalTrips: 24,
        savedRoutes: 3,
        feedbackGiven: 8,
        warnings: 1
    });

    // Helper function to convert UTC date to Sri Lanka date (UTC+5:30)
    const toSriLankaDate = (utcDate) => {
        if (!utcDate) return null;
        const date = new Date(utcDate);
        const sriLankaTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
        return sriLankaTime.toISOString().split('T')[0];
    };

    // Helper function to get today's date in Sri Lanka time
    const getTodaySriLanka = () => {
        const now = new Date();
        const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        return sriLankaTime.toISOString().split('T')[0];
    };

    // Load user data from sessionStorage
    useEffect(() => {
        const storedUserName = sessionStorage.getItem('userName');
        const storedUserLocation = sessionStorage.getItem('userLocation');
        
        if (storedUserName) {
            setUserName(storedUserName);
        }
        
        if (storedUserLocation) {
            setUserLocation(storedUserLocation);
        } else {
            setUserLocation("Sri Lanka");
        }
    }, []);

    // Gold shimmer animation
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
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
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format date and time
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

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 300000); //5 mins = 300,000 milliseconds
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            const [
                busesRes, tripsRes, busTypesRes, situationsRes, 
                favRoutesRes, feedbacksRes
            ] = await Promise.allSettled([
                busAPI.getAllBuses(),
                tripAPI.getAllTrips(),
                busTypeAPI.getAllBusTypes(),
                currentSituationAPI.getAll(),
                favouriteRouteAPI.getAllFavouriteRoutes(),
                feedbackAPI.getAllFeedbacks()
            ]);

            // Process buses
            const allBusesData = busesRes.value?.data?.data || [];
            setAllBuses(allBusesData);

            // Process trips
            const tripsData = tripsRes.value?.data?.data || [];
            setTrips(tripsData);

            // Process bus types
            const busTypesData = busTypesRes.value?.data?.data || [];
            const busTypeMap = {};
            busTypesData.forEach(type => {
                busTypeMap[type.bus_type_id] = type.type_name;
            });
            setBusTypes(busTypeMap);

            // Get today's date in Sri Lanka time
            const todaySriLanka = getTodaySriLanka();
            
            // Filter ongoing trips for today using Sri Lanka timezone
            const ongoingTrips = tripsData.filter(trip => {
                if (!trip.date || trip.status !== 'ongoing') return false;
                const tripDateSriLanka = toSriLankaDate(trip.date);
                return tripDateSriLanka === todaySriLanka;
            });

            const ongoingBusIds = new Set(ongoingTrips.map(trip => trip.bus_id));

            // Filter active buses that have ongoing trips TODAY
            let activeBuses = allBusesData.filter(bus => 
                bus.status === 'active' && 
                ongoingBusIds.has(bus.bus_id)
            );

            // Extract cities from route names
            const citySet = new Set();
            activeBuses.forEach(bus => {
                if (bus.route_name) {
                    const parts = bus.route_name.split(' - ');
                    parts.forEach(part => {
                        const trimmed = part.trim();
                        if (trimmed) {
                            citySet.add(trimmed);
                        }
                    });
                }
            });

            // Convert to array and add "all" option
            const uniqueCities = ['all', ...Array.from(citySet).sort()];
            
            setCities(uniqueCities);
            setFilteredBuses(activeBuses);

            // Load stops for active buses only
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

            // Set other data
            if (situationsRes.value?.data?.data) {
                setRecentSituations(situationsRes.value.data.data.slice(0, 3));
            }
            if (favRoutesRes.value?.data?.data) {
                setFavouriteRoutes(favRoutesRes.value.data.data.slice(0, 3));
            }
            if (feedbacksRes.value?.data?.data) {
                setRecentFeedback(feedbacksRes.value.data.data.slice(0, 2));
            }

        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    // Check if screen is mobile and navbar is expanded
    useEffect(() => {
        const handleResize = () => {
            // If screen is larger than md (768px), mobile menu is not visible
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        // You need to listen for navbar menu state - this is a workaround
        // Add a custom event listener for navbar menu toggle
        const handleNavbarToggle = (event) => {
            setIsMobileMenuOpen(event.detail?.isOpen || false);
        };
        
        window.addEventListener('navbarToggle', handleNavbarToggle);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('navbarToggle', handleNavbarToggle);
        };
    }, []);

    const handleCityChange = (e) => {
        const city = e.target.value;
        setSelectedCity(city);
        
        const todaySriLanka = getTodaySriLanka();
        
        if (city === 'all') {
            // Filter all ongoing buses
            const ongoingTrips = trips.filter(trip => {
                if (!trip.date || trip.status !== 'ongoing') return false;
                const tripDateSriLanka = toSriLankaDate(trip.date);
                return tripDateSriLanka === todaySriLanka;
            });
            const ongoingBusIds = new Set(ongoingTrips.map(trip => trip.bus_id));
            
            setFilteredBuses(allBuses.filter(bus => 
                bus.status === 'active' && 
                ongoingBusIds.has(bus.bus_id)
            ));
        } else {
            // Filter by city
            const ongoingTrips = trips.filter(trip => {
                if (!trip.date || trip.status !== 'ongoing') return false;
                const tripDateSriLanka = toSriLankaDate(trip.date);
                return tripDateSriLanka === todaySriLanka;
            });
            const ongoingBusIds = new Set(ongoingTrips.map(trip => trip.bus_id));
            
            setFilteredBuses(allBuses.filter(bus => 
                bus.status === 'active' && 
                ongoingBusIds.has(bus.bus_id) &&
                bus.route_name && 
                bus.route_name.includes(city)
            ));
        }
    };

    const toggleStops = (busId) => {
        setExpandedStops(prev => ({
            ...prev,
            [busId]: !prev[busId]
        }));
    };

    const goToBuses = () => {
        navigate('/passenger/bus');
    };

    const goToCurrentSituations = (bus) => {
        if (!bus) {
            setShowBusSelector(true);
            return;
        }
        
        const encodedRouteName = encodeURIComponent(bus.route_name || '');
        const url = `/passenger/currentSituation?busId=${bus.bus_id}&busNumber=${bus.bus_number}&routeNo=${bus.route_no || ''}&routeName=${encodedRouteName}&seatCapacity=${bus.seat_capacity || ''}`;
        navigate(url);
    };

    const goToFavouriteRoutes = () => {
        navigate('/passenger/favouriteRoute');
    };

    const goToFeedback = (bus = null) => {
        if (bus) {
            const encodedRouteName = encodeURIComponent(bus.route_name || '');
            const url = `/passenger/feedback?busId=${bus.bus_id}&busNumber=${bus.bus_number}&routeNo=${bus.route_no || ''}&routeName=${encodedRouteName}`;
            navigate(url);
        } else {
            setShowBusSelector(true);
        }
    };

    const handleBusSelect = (bus) => {
        setShowBusSelector(false);
        goToFeedback(bus);
    };

    const startEditLocation = () => {
        setTempLocation(userLocation);
        setIsEditingLocation(true);
    };

    const saveLocation = () => {
        if (tempLocation.trim()) {
            setUserLocation(tempLocation);
            sessionStorage.setItem('userLocation', tempLocation);
            setIsEditingLocation(false);
        }
    };

    const startEditName = () => {
        setTempName(userName);
        setIsEditingName(true);
    };

    const saveName = () => {
        if (tempName.trim()) {
            setUserName(tempName);
            sessionStorage.setItem('userName', tempName);
            setIsEditingName(false);
        }
    };

    const findOngoingTrip = (busId) => {
        const todaySriLanka = getTodaySriLanka();
        
        return trips.find(trip => {
            if (!trip.date || trip.status !== 'ongoing') return false;
            if (trip.bus_id !== busId) return false;
            const tripDateSriLanka = toSriLankaDate(trip.date);
            return tripDateSriLanka === todaySriLanka;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-yellow-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-20">
            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Location and Status Bar */}
                <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                        {/* Location Section - Click to Edit */}
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-yellow-400" />
                            {isEditingLocation ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempLocation}
                                        onChange={(e) => setTempLocation(e.target.value)}
                                        className="bg-black/60 border border-yellow-600/30 rounded-lg px-2 py-1 text-gray-300 text-sm focus:outline-none focus:border-yellow-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={saveLocation}
                                        className="text-green-400 text-xs hover:text-green-300"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditingLocation(false)}
                                        className="text-red-400 text-xs hover:text-red-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={startEditLocation}
                                    className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center gap-1"
                                >
                                    <span>{userLocation}</span>
                                    <span className="text-xs text-yellow-500/50">✎</span>
                                </button>
                            )}
                        </div>

                        {/* User Name Section - Click to Edit */}
                        <div className="flex items-center gap-2">
                            <FaUser className="text-yellow-400" />
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="bg-black/60 border border-yellow-600/30 rounded-lg px-2 py-1 text-gray-300 text-sm focus:outline-none focus:border-yellow-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={saveName}
                                        className="text-green-400 text-xs hover:text-green-300"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditingName(false)}
                                        className="text-red-400 text-xs hover:text-red-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={startEditName}
                                    className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center gap-1"
                                >
                                    <span>{userName}</span>
                                    <span className="text-xs text-yellow-500/50">✎</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Date and Time Banner */}
                <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 mb-6">
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

                {/* City Filter Dropdown */}
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

                {/* Live Buses Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="w-1 h-5 bg-yellow-500 rounded-full"></span>
                            {selectedCity === 'all' ? 'Live Buses Near You' : `Buses Serving ${selectedCity}`}
                        </h3>
                        <span className="text-sm px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-600/30">
                            {filteredBuses.length} active
                        </span>
                    </div>
                    
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
                                        className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] transition-all duration-300 group"
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
                                                            onClick={() => toggleStops(bus.bus_id)}
                                                            className="text-yellow-400 text-xs hover:text-yellow-300 transition-colors mt-1 ml-6"
                                                        >
                                                            {expandedStops[bus.bus_id] ? 'Show less ↑' : `+${busStops.length - 3} more stops ↓`}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-yellow-600/20">
                                            <button
                                                onClick={() => goToCurrentSituations(bus)}
                                                className="flex-1 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500 hover:text-black transition-all duration-300 border border-yellow-600/30"
                                            >
                                                Report Situation
                                            </button>
                                            <button
                                                onClick={() => goToFeedback(bus)}
                                                className="flex-1 py-2 bg-gray-800/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 hover:text-white transition-all duration-300 border border-gray-700"
                                            >
                                                Give Feedback
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const encodedRouteName = encodeURIComponent(bus.route_name || '');
                                                    const url = `/passenger/alert?busId=${bus.bus_id}&busNumber=${bus.bus_number}&routeNo=${bus.route_no || ''}&routeName=${encodedRouteName}`;
                                                    navigate(url);
                                                }}
                                                className="flex-1 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-xs hover:bg-purple-500/20 transition"
                                            >
                                                Report Alert
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-black/40 backdrop-blur-xl rounded-2xl border border-yellow-600/20">
                            <FaBus className="text-6xl text-yellow-400/30 mx-auto mb-4" />
                            <h3 className="text-xl text-white mb-2">No Active Buses</h3>
                            <p className="text-gray-400">
                                {selectedCity === 'all' 
                                    ? 'No buses are currently active'
                                    : `No buses currently serving ${selectedCity}`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 hover:border-yellow-500/50 transition-all duration-300">
                        <FaRoute className="text-yellow-400 text-xl mb-2" />
                        <p className="text-2xl font-bold text-white">{userStats.totalTrips}</p>
                        <p className="text-xs text-gray-400">Total Trips</p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 hover:border-yellow-500/50 transition-all duration-300">
                        <FaHeart className="text-yellow-400 text-xl mb-2" />
                        <p className="text-2xl font-bold text-white">{userStats.savedRoutes}</p>
                        <p className="text-xs text-gray-400">Saved Routes</p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 hover:border-yellow-500/50 transition-all duration-300">
                        <FaCommentDots className="text-yellow-400 text-xl mb-2" />
                        <p className="text-2xl font-bold text-white">{userStats.feedbackGiven}</p>
                        <p className="text-xs text-gray-400">Feedbacks</p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 hover:border-yellow-500/50 transition-all duration-300">
                        <FaExclamationTriangle className="text-yellow-400 text-xl mb-2" />
                        <p className="text-2xl font-bold text-white">{userStats.warnings}</p>
                        <p className="text-xs text-gray-400">Warnings</p>
                    </div>
                </div>

                {/* Recent Sections - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Situations */}
                    <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
                                Recent Situations
                            </h3>
                            <button 
                                onClick={() => setShowBusSelector(true)}
                                className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                                View All →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentSituations.length > 0 ? (
                                recentSituations.map(sit => (
                                    <div key={sit.cr_id} className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-yellow-600/20">
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-400">Bus {sit.bus_number}</p>
                                            <p className="text-xs text-gray-400">{sit.current_stop}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            sit.avg_passengers > 50 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                            sit.avg_passengers > 30 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                            'bg-green-500/20 text-green-400 border border-green-500/30'
                                        }`}>
                                            {sit.avg_passengers} passengers
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-2">No recent situations</p>
                            )}
                        </div>
                    </div>

                    {/* Favourite Routes */}
                    <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
                                Favourite Routes
                            </h3>
                            <button 
                                onClick={goToFavouriteRoutes}
                                className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                                Manage →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {favouriteRoutes.length > 0 ? (
                                favouriteRoutes.map(route => (
                                    <div key={route.favourite_route_id} className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-yellow-600/20">
                                        <div className="flex items-center gap-2">
                                            <FaHeart className="text-red-400 text-sm" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">{route.route_name}</p>
                                                <p className="text-xs text-gray-400">Route {route.route_no}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-2">No favourite routes</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Feedback */}
                <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-2xl p-4 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
                            Recent Feedback
                        </h3>
                        <button 
                            onClick={() => setShowBusSelector(true)}
                            className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                            Give Feedback →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentFeedback.length > 0 ? (
                            recentFeedback.map(fb => (
                                <div key={fb.feedback_id} className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-yellow-600/20">
                                    <div>
                                        <p className="text-sm text-white">{fb.comment?.substring(0, 50)}...</p>
                                        <p className="text-xs text-gray-400">Bus {fb.bus_number}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(star => (
                                            <FaStar key={star} className={star <= fb.rating ? 'text-yellow-400 text-xs' : 'text-gray-600 text-xs'} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-2">No recent feedback</p>
                        )}
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                    <button
                        onClick={() => setShowBusSelector(true)}
                        className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all duration-300"
                        title="Report Situation"
                    >
                        <FaPlus className="text-xl" />
                    </button>
                </div>

                {/* Bus Selector Modal */}
                {showBusSelector && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-900/90 backdrop-blur-xl border border-yellow-600/30 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(255,215,0,0.1)]">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                                Select a Bus
                            </h3>
                            <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                                {filteredBuses.length > 0 ? (
                                    filteredBuses.map(bus => (
                                        <button
                                            key={bus.bus_id}
                                            onClick={() => handleBusSelect(bus)}
                                            className="w-full text-left p-4 bg-black/60 hover:bg-black/80 rounded-xl border border-yellow-600/20 hover:border-yellow-500 transition-all duration-300 flex items-center gap-3 group"
                                        >
                                            <FaBus className="text-yellow-400" />
                                            <div>
                                                <p className="font-semibold text-white">{bus.bus_number}</p>
                                                <p className="text-xs text-gray-400">{bus.route_name}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center py-4">No buses available</p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowBusSelector(false)}
                                className="w-full mt-4 py-3 bg-gray-800/50 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 border border-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Scrollbar Styles */}
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

export default PassengerDashboard;