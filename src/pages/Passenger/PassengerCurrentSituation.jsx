import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CurrentSituation from '../Admin/currentSituation';

const PassengerCurrentSituation = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [busData, setBusData] = useState(null);
    
    console.log("=== PassengerCurrentSituation Mounted ===");
    console.log("📌 Full URL:", window.location.href);
    
    // Get ALL data from URL parameters
    const busId = searchParams.get('busId');
    const busNumber = searchParams.get('busNumber');
    const routeNo = searchParams.get('routeNo');
    const routeName = searchParams.get('routeName');
    const seatCapacity = searchParams.get('seatCapacity');
    
    console.log("📌 From URL - busId:", busId);
    console.log("📌 From URL - busNumber:", busNumber);
    console.log("📌 From URL - routeNo:", routeNo);
    console.log("📌 From URL - routeName:", routeName);
    console.log("📌 From URL - seatCapacity:", seatCapacity);

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
        
        // Check if we have required bus data
        if (!busId || !busNumber) {
            console.error("❌ Missing bus data in URL");
            console.error("busId:", busId, "busNumber:", busNumber);
            alert("Bus information missing. Please select a bus first.");
            navigate('/passenger/bus');
            return;
        }
        
        // Create bus object from URL parameters
        const bus = {
            bus_id: parseInt(busId),
            bus_number: busNumber,
            route_no: routeNo || '',
            route_name: routeName ? decodeURIComponent(routeName) : 'Unknown Route',
            seat_capacity: seatCapacity ? parseInt(seatCapacity) : 0
        };
        
        console.log("✅ Created bus object:", bus);
        setBusData(bus);
        setLoading(false);
        
    }, [navigate, busId, busNumber, routeNo, routeName, seatCapacity]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-yellow-400">Loading bus information...</p>
                </div>
            </div>
        );
    }

    if (!busData || !currentUserId) {
        return null;
    }

    console.log("✅ Rendering CurrentSituation with props:", {
        busNumber: busData.bus_number,
        routeNo: busData.route_no,
        routeName: busData.route_name
    });

    return (
        <div className="min-h-screen bg-black">
            <CurrentSituation 
                passengerView={true}
                preselectedBus={busData.bus_number}
                initialMode="view"
                userId={currentUserId}
                busId={busData.bus_id}
                routeNo={busData.route_no}
                routeName={busData.route_name}
            />
        </div>
    );
};

export default PassengerCurrentSituation;