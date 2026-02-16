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
            bg-[#0b1f3a]/95 backdrop-blur-md 
            shadow-lg border-b border-blue-800">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between 
                items-center">

                {/* Logo */}
                <Link 
                    to="/" 
                    className="text-2xl font-bold 
                        bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 
                        bg-clip-text text-transparent 
                        tracking-wide hover:scale-105 transition duration-300"
                >
                    PublicPilot
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-blue-100">

                    <Link 
                        className="hover:text-blue-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-blue-400 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all"
                        to="/main"
                    >
                        Home
                    </Link>

                    <Link 
                        className="hover:text-blue-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-blue-400 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all"
                        to="/passenger"
                    >
                        Passenger
                    </Link>

                    <Link 
                        className="hover:text-blue-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-blue-400 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all"
                        to="/cd"
                    >
                        Drivers
                    </Link>

                    <Link 
                        className="hover:text-blue-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-blue-400 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all"
                        to="/owner"
                    >
                        Owner
                    </Link>

                    <Link 
                        className="hover:text-blue-400 relative after:absolute 
                        after:w-0 after:h-[2px] after:bg-blue-400 
                        after:left-0 after:-bottom-1 
                        hover:after:w-full after:transition-all"
                        to="/admin"
                    >
                        Admin
                    </Link>

                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl 
                            bg-gradient-to-r from-blue-600 to-indigo-600 
                            text-white font-semibold
                            hover:from-blue-500 hover:to-indigo-500 
                            shadow-md hover:shadow-blue-500/30 
                            transition duration-300"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-blue-400 text-2xl hover:text-blue-300 transition"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    { isOpen ? <FaTimes/> : <FaBars/> }
                </button>

            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden 
                    bg-[#0b1f3a]/95 backdrop-blur-md 
                    border-t border-blue-800 
                    px-6 pb-6 pt-4 
                    space-y-4 text-blue-100">

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/main" 
                            className="block hover:text-blue-400 transition"
                        >
                            Home
                        </Link>

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/passenger" 
                            className="block hover:text-blue-400 transition"
                        >
                            Passenger
                        </Link>

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/cd" 
                            className="block hover:text-blue-400 transition"
                        >
                            Driver / Conductor
                        </Link>

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/owner" 
                            className="block hover:text-blue-400 transition"
                        >
                            Owner
                        </Link>

                        <Link 
                            onClick={() => setIsOpen(false)} 
                            to="/admin" 
                            className="block hover:text-blue-400 transition"
                        >
                            Admin
                        </Link>

                        <button 
                            onClick={handleLogout}
                            className="w-full mt-4 px-4 py-2 rounded-xl 
                                bg-gradient-to-r from-blue-600 to-indigo-600 
                                text-white font-semibold
                                hover:from-blue-500 hover:to-indigo-500 
                                transition duration-300 shadow-md"
                        >
                            Logout
                        </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
