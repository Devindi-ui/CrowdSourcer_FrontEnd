import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    FaBus, FaRoute, FaUserTie, FaUsers, FaChartLine, 
    FaBell, FaCommentDots, FaExclamationTriangle, 
    FaCalendarAlt, FaUser
} from 'react-icons/fa';

const OwnerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName] = useState(sessionStorage.getItem('userName') || 'Owner');

    const navItems = [
        { path: '/owner', name: 'Dashboard', icon: <FaChartLine /> },
        { path: '/owner/buses', name: 'My Buses', icon: <FaBus /> },
        { path: '/owner/staff', name: 'Drivers & Conductors', icon: <FaUsers /> },
        { path: '/owner/trips', name: 'Trips', icon: <FaCalendarAlt /> },
        { path: '/owner/routes', name: 'Routes', icon: <FaRoute /> },
        { path: '/owner/feedbacks', name: 'Feedbacks', icon: <FaCommentDots /> },
    ];

    const isActive = (path) => {
        if (path === '/owner' && location.pathname === '/owner') return true;
        if (path !== '/owner' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-20 left-4 z-50 p-2 rounded-lg"
            >
                <div className="mt-2 w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                    <FaUserTie className="text-black" />
                </div>
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-black/90 backdrop-blur-xl 
                border-r border-yellow-600/20 z-40 transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}>
                <div className="p-6 pt-24">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-yellow-600/20">
                        {/* <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                            <FaUserTie className="text-black" />
                        </div> */}
                        <div>
                            <p className="px-15 text-white font-semibold">{userName}</p>
                            <p className="px-15 text-xs text-yellow-400">Owner</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setSidebarOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                    transition-all duration-300
                                    ${isActive(item.path) 
                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 min-h-screen">
                {/* Top Bar with Gold Shimmer */}
                <div className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-black/50 backdrop-blur-xl border-b border-yellow-600/20">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-[shimmer_3s_linear_infinite]" />
                    <div className="px-6 py-4 flex justify-end items-center">
                        <div className="flex items-center gap-3">
                            <FaBell className="text-yellow-400" />
                            <span className="text-gray-300">{userName}</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="pt-20 px-6 pb-8">
                    <Outlet />
                </div>
            </main>

            <style>
                {`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                `}
            </style>
        </div>
    );
};

export default OwnerLayout;