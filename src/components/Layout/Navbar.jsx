import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = ({onLogout}) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate("/login");
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 
            bg-black/80 backdrop-blur-2xl 
            shadow-[0_0_40px_rgba(255,215,0,0.08)] 
            border-b border-yellow-600/20">

            {/* 🔥 Gold Shimmer Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] 
                bg-gradient-to-r from-transparent via-yellow-500 to-transparent 
                animate-[shimmer_3s_linear_infinite]" />

            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between 
                items-center">

                {/* Logo */}
                <Link 
                    to="/" 
                    className="text-2xl font-semibold 
                        bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 
                        bg-clip-text text-transparent 
                        tracking-wider 
                        font-[Playfair_Display]
                        drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]
                        hover:scale-105 transition duration-300"
                >
                    PublicPilot
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-gray-300 font-medium">

                    <Link 
                        className="hover:text-yellow-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-yellow-500 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all after:duration-300"
                        to="/main"
                    >
                        Home
                    </Link>

                    <Link 
                        className="hover:text-yellow-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-yellow-500 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all after:duration-300"
                        to="/passenger"
                    >
                        Passenger
                    </Link>

                    <Link 
                        className="hover:text-yellow-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-yellow-500 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all after:duration-300"
                        to="/cd"
                    >
                        Drivers
                    </Link>

                    <Link 
                        className="hover:text-yellow-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-yellow-500 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all after:duration-300"
                        to="/owner"
                    >
                        Owner
                    </Link>

                    <Link 
                        className="hover:text-yellow-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-yellow-500 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all after:duration-300"
                        to="/admin"
                    >
                        Admin
                    </Link>

                    <button 
                        onClick={handleLogout}
                        className="px-5 py-2 rounded-xl 
                            border border-yellow-600/40 
                            text-yellow-500 font-semibold
                            bg-black/60 backdrop-blur-md
                            hover:bg-yellow-500 hover:text-black 
                            hover:shadow-[0_0_25px_rgba(255,215,0,0.6)]
                            transition-all duration-300"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-yellow-500 text-2xl 
                        hover:text-yellow-400 transition"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    { isOpen ? <FaTimes/> : <FaBars/> }
                </button>

            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden 
                    bg-black/90 backdrop-blur-2xl 
                    border-t border-yellow-600/20 
                    px-6 pb-6 pt-4 
                    space-y-4 text-gray-300 font-medium">

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/main" 
                            className="block hover:text-yellow-400 transition"
                        >
                            Home
                        </Link>

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/passenger" 
                            className="block hover:text-yellow-400 transition"
                        >
                            Passenger
                        </Link>

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/cd" 
                            className="block hover:text-yellow-400 transition"
                        >
                            Driver / Conductor
                        </Link>

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/owner" 
                            className="block hover:text-yellow-400 transition"
                        >
                            Owner
                        </Link>

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/admin" 
                            className="block hover:text-yellow-400 transition"
                        >
                            Admin
                        </Link>

                        <button 
                            onClick={handleLogout}
                            className="w-full mt-4 px-4 py-2 rounded-xl 
                                border border-yellow-600/40 
                                text-yellow-500 font-semibold
                                bg-black/60 backdrop-blur-md
                                hover:bg-yellow-500 hover:text-black 
                                transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                        >
                            Logout
                        </button>
                </div>
            )}

            {/* 💎 Animations */}
            <style>
                {`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                `}
            </style>

        </nav>
    );
};

export default Navbar;
