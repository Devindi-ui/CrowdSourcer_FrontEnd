import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    FaMapMarkerAlt, 
    FaUser, 
    FaExclamationTriangle,
    FaPlus,
    FaBus
} from 'react-icons/fa';

const PassengerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const warnings = 1;
    const userName = "";
    const userLocation = "Colombo, Sri Lanka";

    // Determine active tab from URL
    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/passenger' || path === '/passenger/dashboard' || path === '/passenger/home') {
            return 'home';
        }
        return path.split('/').pop();
    };

    const activeTab = getActiveTab();

    // Check if a menu item is active
    const isActive = (itemLower) => {
        const currentPath = location.pathname;
        if (itemLower === 'home') {
            return currentPath === '/passenger' || 
                   currentPath === '/passenger/dashboard' || 
                   currentPath === '/passenger/home' ||
                   currentPath === '/passenger/';
        }
        return currentPath === `/passenger/${itemLower}`;
    };

    // Get URL for menu item
    const getUrlForMenuItem = (itemLower) => {
        if (itemLower === 'home') return '/passenger/dashboard';
        return `/passenger/${itemLower}`;
    };

    return (
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

            {/* Location and Warning Bar */}
            <div className="pt-16">
                <div className="bg-gradient-to-r from-gray-900 to-black border-y border-yellow-600/20 py-4">
                    <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center">
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-yellow-400" />
                            <span className="text-white">{userLocation}</span>
                        </div>
                        {warnings > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
                                <FaExclamationTriangle className="text-red-400 text-sm" />
                                <span className="text-red-400 text-sm">Warned</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Passenger Navigation Tabs */}
                <div className="border-b border-yellow-600/20 bg-black/30">
                    <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
                        <div className="flex gap-6 py-3">
                            {['Home', 'Station', 'Bookings', 'Analytics', 'History', 'Settings'].map(item => {
                                const itemLower = item.toLowerCase();
                                return (
                                    <button
                                        key={item}
                                        onClick={() => navigate(getUrlForMenuItem(itemLower))}
                                        className={`text-sm font-medium transition whitespace-nowrap ${
                                            isActive(itemLower)
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
            </div>

            {/* Content Area - This changes based on the route */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <Outlet />
            </div>

            {/* Quick Action Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                <button
                    onClick={() => navigate('/passenger/currentSituation')}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black flex items-center justify-center shadow-lg hover:scale-110 transition"
                    title="Report Situation"
                >
                    <FaPlus className="text-xl" />
                </button>
                <button
                    onClick={() => navigate('/passenger/bus')}
                    className="w-14 h-14 rounded-full bg-gray-800 border border-yellow-600/30 text-yellow-400 flex items-center justify-center shadow-lg hover:scale-110 transition"
                    title="View All Buses"
                >
                    <FaBus className="text-xl" />
                </button>
            </div>
        </div>
    );
};

export default PassengerLayout;