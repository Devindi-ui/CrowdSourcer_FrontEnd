import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
    FaBus, FaHeart, FaCommentDots, FaExclamationTriangle,
    FaMapMarkerAlt, FaUser, FaStar, 
    FaRoute, FaClock, FaUsers, FaPlus, 
    FaMapMarkedAlt, FaEye
} from "react-icons/fa";
import { busAPI, currentSituationAPI, favouriteRouteAPI, feedbackAPI } from "../../services/api";
import ThemeLayout from "../../components/common/Layout/ThemeLayout";

const PassengerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    
    // Data states
    const [liveBuses, setLiveBuses] = useState([]);
    const [recentSituations, setRecentSituations] = useState([]);
    const [favouriteRoutes, setFavouriteRoutes] = useState([]);
    const [recentFeedback, setRecentFeedback] = useState([]);
    
    // User stats
    const [userStats, setUserStats] = useState({
        totalTrips: 24,
        savedRoutes: 3,
        feedbackGiven: 8,
        warnings: 1
    });

    const [showBusSelector, setShowBusSelector] = useState(false);

    // Mock user data
    const [userName] = useState("");
    const [userLocation] = useState("");
    const [warnings] = useState(1);

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            const [busesRes, situationsRes, favRoutesRes, feedbacksRes] = await Promise.allSettled([
                busAPI.getAllBuses(),
                currentSituationAPI.getAll(),
                favouriteRouteAPI.getAllFavouriteRoutes(),
                feedbackAPI.getAllFeedbacks()
            ]);

            if (busesRes.value?.data?.data) {
                const buses = busesRes.value.data.data.filter(b => b.status === 'active');
                setLiveBuses(buses.slice(0, 6));
            }

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

    // Convert URL path to section name
    const getActiveSectionFromPath = () => {
        const path = location.pathname;
        
        if (path === '/passenger' || path === '/passenger/dashboard' || path === '/passenger/') {
            return 'home';
        }
        
        // Extract the last part of the path
        const lastSegment = path.split('/').pop();
        
        // Map URL segments to section names
        const sectionMap = {
            'bus': 'home',  // Bus page is still part of home section
            'stations': 'stations',
            'bookings': 'bookings',
            'analytics': 'analytics',
            'history': 'history',
            'settings': 'settings'
        };
        
        return sectionMap[lastSegment] || 'home';
    };

    // Navigation handlers - FIXED: Using sessionStorage instead of passing functions
    const goToBuses = () => {
        navigate('/passenger/bus');
    };

    const goToCurrentSituations = (busNumber = null) => {
        if (busNumber) {
            sessionStorage.setItem('selectedBus', busNumber);
            sessionStorage.setItem('action', 'report');
            navigate('/passenger/currentSituation');
        } else {
            sessionStorage.removeItem('selectedBus');
            sessionStorage.removeItem('action');
            navigate('/passenger/currentSituation');
        }
    };

    const goToFavouriteRoutes = () => {
        navigate('/passenger/favouriteRoute');
    };

    const goToFeedback = (bus = null) => {
        if (bus) {
            sessionStorage.setItem('selectedBus', bus.bus_number);
            sessionStorage.setItem('selectedBusData', JSON.stringify(bus));
            sessionStorage.setItem('action', 'feedback');
        } else {
            sessionStorage.removeItem('selectedBus');
            sessionStorage.removeItem('selectedBusData');
            sessionStorage.removeItem('action');
        }
        navigate('/passenger/feedback');
    };

    const handleBusSelect = (bus) => {
        setShowBusSelector(false);
        // Store in sessionStorage
        sessionStorage.setItem('selectedBus', bus.bus_number);
        sessionStorage.setItem('selectedBusData', JSON.stringify(bus));
        sessionStorage.setItem('action', 'report');
        // Navigate to add situation
        navigate('/passenger/currentSituation');
    };

    const renderContent = () => {
        const currentPath = location.pathname;
        
        // If we're on dashboard routes, show the home content
        if (currentPath === '/passenger' || 
            currentPath === '/passenger/' || 
            currentPath === '/passenger/dashboard') {
            return (
                <div className="space-y-6">
                    {/* Warning Banner */}
                    {warnings > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <FaExclamationTriangle className="text-red-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">Warned</h4>
                                    <p className="text-sm text-gray-400">You have {warnings} active warning</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm">
                                View Details
                            </button>
                        </div>
                    )}

                    {/* Live Buses Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Live Buses Near You</h3>
                            <button 
                                onClick={goToBuses}
                                className="text-yellow-400 text-sm hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {liveBuses.map(bus => (
                                <div 
                                    key={bus.bus_id}
                                    className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-xl p-4 hover:border-yellow-500 transition group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <FaBus className="text-yellow-400" />
                                            <span className="font-mono text-yellow-400">{bus.bus_number}</span>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-1">
                                        <FaRoute className="inline mr-1 text-yellow-400/70" />
                                        {bus.route_name || 'Unknown Route'}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Capacity: {bus.seat_capacity} seats
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => goToCurrentSituations(bus.bus_number)}
                                            className="flex-1 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg text-xs hover:bg-yellow-500/20 transition"
                                        >
                                            Report Situation
                                        </button>
                                        <button
                                            onClick={() => goToFeedback(bus)}
                                            className="flex-1 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs hover:bg-gray-700 transition"
                                        >
                                            Give Feedback
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-900/50 border border-yellow-600/20 rounded-xl p-4">
                            <FaRoute className="text-yellow-400 text-xl mb-2" />
                            <p className="text-2xl font-bold text-white">{userStats.totalTrips}</p>
                            <p className="text-xs text-gray-400">Total Trips</p>
                        </div>
                        <div className="bg-gray-900/50 border border-yellow-600/20 rounded-xl p-4">
                            <FaHeart className="text-yellow-400 text-xl mb-2" />
                            <p className="text-2xl font-bold text-white">{userStats.savedRoutes}</p>
                            <p className="text-xs text-gray-400">Saved Routes</p>
                        </div>
                        <div className="bg-gray-900/50 border border-yellow-600/20 rounded-xl p-4">
                            <FaCommentDots className="text-yellow-400 text-xl mb-2" />
                            <p className="text-2xl font-bold text-white">{userStats.feedbackGiven}</p>
                            <p className="text-xs text-gray-400">Feedbacks</p>
                        </div>
                        <div className="bg-gray-900/50 border border-yellow-600/20 rounded-xl p-4">
                            <FaExclamationTriangle className="text-yellow-400 text-xl mb-2" />
                            <p className="text-2xl font-bold text-white">{userStats.warnings}</p>
                            <p className="text-xs text-gray-400">Warnings</p>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Situations */}
                        <div className="bg-gray-900/30 border border-yellow-600/20 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Recent Situations</h3>
                                <button 
                                    onClick={() => goToCurrentSituations()}
                                    className="text-yellow-400 text-sm hover:underline"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="space-y-3">
                                {recentSituations.map(sit => (
                                    <div key={sit.cr_id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl">
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-400">Bus {sit.bus_number}</p>
                                            <p className="text-xs text-gray-400">{sit.current_stop}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            sit.avg_passengers > 50 ? 'bg-red-500/20 text-red-400' :
                                            sit.avg_passengers > 30 ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>
                                            {sit.avg_passengers} passengers
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Favourite Routes */}
                        <div className="bg-gray-900/30 border border-yellow-600/20 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Favourite Routes</h3>
                                <button 
                                    onClick={goToFavouriteRoutes}
                                    className="text-yellow-400 text-sm hover:underline"
                                >
                                    Manage
                                </button>
                            </div>
                            <div className="space-y-3">
                                {favouriteRoutes.map(route => (
                                    <div key={route.favourite_route_id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <FaHeart className="text-red-400 text-sm" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">{route.route_name}</p>
                                                <p className="text-xs text-gray-400">Route {route.route_no}</p>
                                            </div>
                                        </div>
                                        <button className="text-yellow-400 text-xs hover:underline">Track</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Feedback */}
                    <div className="bg-gray-900/30 border border-yellow-600/20 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Recent Feedback</h3>
                            <button 
                                onClick={() => goToFeedback()}
                                className="text-yellow-400 text-sm hover:underline"
                            >
                                Give Feedback
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentFeedback.map(fb => (
                                <div key={fb.feedback_id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl">
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
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
        
        // For other sections, extract the last part of the URL
        const lastSegment = currentPath.split('/').pop();
        
        // Define content for each section
        const sectionContent = {
            'stations': {
                icon: <FaMapMarkedAlt className="text-6xl text-yellow-400/30 mx-auto mb-4" />,
                title: 'Stations View',
                message: 'Coming soon: View all bus stations and schedules'
            },
            'bookings': {
                icon: <FaClock className="text-6xl text-yellow-400/30 mx-auto mb-4" />,
                title: 'Your Bookings',
                message: 'No active bookings found'
            },
            'analytics': {
                icon: <FaEye className="text-6xl text-yellow-400/30 mx-auto mb-4" />,
                title: 'Travel Analytics',
                message: 'View your travel patterns and statistics'
            },
            'history': {
                icon: <FaClock className="text-6xl text-yellow-400/30 mx-auto mb-4" />,
                title: 'Trip History',
                message: 'Your past trips will appear here'
            },
            'settings': {
                icon: <FaUser className="text-6xl text-yellow-400/30 mx-auto mb-4" />,
                title: 'Account Settings',
                message: 'Manage your preferences and notifications'
            }
        };
        
        // Get content for current section
        const content = sectionContent[lastSegment];
        
        // If we have content for this section, show it
        if (content) {
            return (
                <div className="text-center py-12">
                    {content.icon}
                    <h3 className="text-xl text-white mb-2">{content.title}</h3>
                    <p className="text-gray-400">{content.message}</p>
                    <button 
                        onClick={() => navigate('/passenger/dashboard')}
                        className="mt-4 px-6 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition"
                    >
                        Back to Home
                    </button>
                </div>
            );
        }
        
        // If no content matches, return null
        return null;
    };

    return (
        <ThemeLayout pageTitle="Passenger Dashboard">
            {/* Main Container */}
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
                
                {/* Top Bar with Logo and User */}
                <div className="border-b border-yellow-600/20 bg-black/50 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                powerhub.
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Welcome back,</p>
                                <p className="font-semibold text-white">{userName}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                                <FaUser className="text-black" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="pt-16 pb-8">
                    {/* Location and Credits Bar */}
                    <div className="bg-gradient-to-r from-gray-900 to-black border-y border-yellow-600/20 py-4">
                        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center">
                            <div className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-yellow-400" />
                                <span className="text-white">{userLocation}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {warnings > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
                                        <FaExclamationTriangle className="text-red-400 text-sm" />
                                        <span className="text-red-400 text-sm">Warned</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="border-b border-yellow-600/20 bg-black/30">
                        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
                            <div className="flex gap-6 py-3">
                                {['Home', 'Station', 'Bookings', 'Analytics', 'History', 'Settings'].map(item => {
                                    const itemLower = item.toLowerCase();
                                    
                                    // Map menu items to URLs
                                    const getUrlForMenuItem = () => {
                                        if (itemLower === 'home') return '/passenger/dashboard';
                                        return `/passenger/${itemLower}`;
                                    };
                                    
                                    // Check if this menu item is active based on URL
                                    const isActive = () => {
                                        const currentPath = location.pathname;
                                        if (itemLower === 'home') {
                                            return currentPath === '/passenger' || 
                                                currentPath === '/passenger/dashboard' || 
                                                currentPath === '/passenger/';
                                        }
                                        return currentPath === `/passenger/${itemLower}`;
                                    };
                                    
                                    return (
                                        <button
                                            key={item}
                                            onClick={() => navigate(getUrlForMenuItem())}  // ✅ Navigate to URL
                                            className={`text-sm font-medium transition whitespace-nowrap ${
                                                isActive()  // ✅ Check URL for active state
                                                    ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1'
                                                    : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    );
                                })}                                     
                            </div>
                        </div>
                    </div>

                    {/* Main Dashboard Content */}
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        {renderContent()}
                    </div>

                    {/* Quick Action Buttons - FIXED: No function passing */}
                    <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                        <button
                            onClick={() => setShowBusSelector(true)}
                            className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black flex items-center justify-center shadow-lg hover:scale-110 transition"
                        >
                            <FaPlus className="text-xl" />
                        </button>
                        <button
                            onClick={goToBuses}
                            className="w-14 h-14 rounded-full bg-gray-800 border border-yellow-600/30 text-yellow-400 flex items-center justify-center shadow-lg hover:scale-110 transition"
                        >
                            <FaBus className="text-xl" />
                        </button>
                    </div>

                    {/* Bus Selector Modal - FIXED: Using sessionStorage */}
                    {showBusSelector && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-gray-900 border border-yellow-600/30 rounded-3xl p-6 max-w-md w-full">
                                <h3 className="text-xl font-bold text-white mb-4">Select a Bus</h3>
                                <div className="max-h-96 overflow-y-auto space-y-2">
                                    {liveBuses.map(bus => (
                                        <button
                                            key={bus.bus_id}
                                            onClick={() => handleBusSelect(bus)}
                                            className="w-full text-left p-4 bg-black/50 hover:bg-black/70 rounded-xl border border-yellow-600/20 hover:border-yellow-500 transition flex items-center gap-3"
                                        >
                                            <FaBus className="text-yellow-400" />
                                            <div>
                                                <p className="font-semibold text-white">{bus.bus_number}</p>
                                                <p className="text-xs text-gray-400">{bus.route_name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowBusSelector(false)}
                                    className="w-full mt-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                `}
            </style>
        </ThemeLayout>
    );
};

export default PassengerDashboard;