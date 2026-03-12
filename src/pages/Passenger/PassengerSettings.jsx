import React from 'react';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PassengerSettings = () => {
    const navigate = useNavigate();
    
    return (
        <div className="text-center py-12">
            <FaUser className="text-6xl text-yellow-400/30 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">Account Settings</h3>
            <p className="text-gray-400">Manage your preferences and notifications</p>
            <button 
                onClick={() => navigate('/passenger/dashboard')}
                className="mt-4 px-6 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition"
            >
                Back to Home
            </button>
        </div>
    );
};

export default PassengerSettings;