import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = ({onLogout}) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate("/");
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/90 
            backdrop-blur-md shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between 
                items-center">

                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-sky-400">
                    PublicPilot
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-slate-200">
                    <Link className="hover:text-sky-400 transition" to="/">Home</Link>
                    <Link className="hover:text-sky-400 transition" to="/user">Passenger</Link>
                    <Link className="hover:text-sky-400 transition" to="/cd">Drivers</Link>
                    <Link className="hover:text-sky-400 transition" to="/owner">Owner</Link>
                    <Link className="hover:text-sky-400 transition" to="/admin">Admin</Link>

                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-sky-500 text-white 
                        hover:bg-sky-400 transition"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-sky-400 text-2xl"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    { isOpen ? <FaTimes/> : <FaBars/> }
                </button>

            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-900/95 px-6 pb-6 
                    space-y-4 text-slate-200">

                        <Link onClick={() => setIsOpen(false)} to="/" className="block hover:text-sky-400">Home</Link>
                        <Link onClick={() => setIsOpen(false)} to="/user" className="block hover:text-sky-400">Passenger</Link>
                        <Link onClick={() => setIsOpen(false)} to="/cd" className="block hover:text-sky-400">Driver / Conductor</Link>
                        <Link onClick={() => setIsOpen(false)} to="/owner" className="block hover:text-sky-400">Owner</Link>
                        <Link onClick={() => setIsOpen(false)} to="/admin" className="block hover:text-sky-400">Admin</Link>

                        <button className="w-full mt-4 px-4 py-2 rounded-lg 
                            bg-sky-500 text-white hover:bg-sky-400 transition"
                        >
                            Logout
                        </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;