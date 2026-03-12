import React from 'react';
import { FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PassengerAnalytics = () => {
    const navigate = useNavigate();
    
    return (
        <div className="text-center py-12">
            <FaEye className="text-6xl text-yellow-400/30 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">Travel Analytics</h3>
            <p className="text-gray-400">View your travel patterns and statistics</p>
            <button 
                onClick={() => navigate('/passenger/dashboard')}
                className="mt-4 px-6 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition"
            >
                Back to Home
            </button>
        </div>
    );
};

export default PassengerAnalytics;