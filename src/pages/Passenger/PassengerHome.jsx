import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaBus, FaHeart, FaCommentDots, FaExclamationTriangle,
    FaRoute, FaStar, FaClock, FaUsers
} from 'react-icons/fa';
import { busAPI, currentSituationAPI, favouriteRouteAPI, feedbackAPI } from '../../services/api';

const PassengerHome = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [liveBuses, setLiveBuses] = useState([]);
    const [recentSituations, setRecentSituations] = useState([]);
    const [favouriteRoutes, setFavouriteRoutes] = useState([]);
    const [recentFeedback, setRecentFeedback] = useState([]);
    const [warnings] = useState(1);
    
    const [userStats] = useState({
        totalTrips: 24,
        savedRoutes: 3,
        feedbackGiven: 8,
        warnings: 1
    });

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

    const goToCurrentSituations = (busNumber) => {
        sessionStorage.setItem('selectedBus', busNumber);
        sessionStorage.setItem('action', 'report');
        navigate('/passenger/currentSituation');
    };

    const goToFeedback = (bus) => {
        sessionStorage.setItem('selectedBus', bus.bus_number);
        sessionStorage.setItem('selectedBusData', JSON.stringify(bus));
        sessionStorage.setItem('action', 'feedback');
        navigate('/passenger/feedback');
    };

    const goToBuses = () => {
        navigate('/passenger/bus');
    };

    const goToFavouriteRoutes = () => {
        navigate('/passenger/favouriteRoute');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-yellow-400">Loading...</div>
            </div>
        );
    }

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
                                    Current Situation
                                </button>
                                <button
                                    onClick={() => goToFeedback(bus)}
                                    className="flex-1 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs hover:bg-gray-700 transition"
                                >
                                    Feedback
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
                            onClick={() => navigate('/passenger/currentSituation')}
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
                        onClick={() => navigate('/passenger/feedback')}
                        className="text-yellow-400 text-sm hover:underline"
                    >
                        Feedback
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
};

export default PassengerHome;