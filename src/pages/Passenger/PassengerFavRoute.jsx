import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FavouriteRoute from '../Admin/favRoute';

const PassengerFavRoute = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    
    console.log("=== PassengerFavRoute Mounted ===");
    
    // Get route data from URL parameters
    const routeNo = searchParams.get('routeNo');
    const routeName = searchParams.get('routeName');
    
    console.log("📌 From URL - routeNo:", routeNo);
    console.log("📌 From URL - routeName:", routeName);

    useEffect(() => {
        // Get userId from sessionStorage
        const userId = sessionStorage.getItem('userId');
        console.log("📌 userId from sessionStorage:", userId);
        
        if (!userId) {
            alert("Please log in first");
            navigate('/login');
            return;
        }
        
        setCurrentUserId(parseInt(userId));
        setLoading(false);
        
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-yellow-400">Loading...</p>
                </div>
            </div>
        );
    }

    console.log("✅ Rendering FavouriteRoute with props:", {
        passengerView: true,
        userId: currentUserId,
        preselectedRouteNo: routeNo,
        preselectedRouteName: routeName
    });

    return (
        <div className="min-h-screen bg-black">
            <FavouriteRoute 
                passengerView={true}
                userId={currentUserId}
                preselectedRouteNo={routeNo}
                preselectedRouteName={routeName}
            />
        </div>
    );
};

export default PassengerFavRoute;