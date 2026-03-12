import React, { useEffect, useState } from 'react';
import Feedback from '../Admin/feedback';
import { useNavigate } from 'react-router-dom';

const PassengerFeedback = () => {
    const navigate = useNavigate();
    const [selectedBus, setSelectedBus] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        // Get data from sessionStorage
        const userId = sessionStorage.getItem('userId');
        const userName = sessionStorage.getItem('userName');
        const busData = sessionStorage.getItem('selectedBusData');
        
        console.log("%c=== PassengerFeedback Mounted ===", "color: magenta");
        console.log("userId from sessionStorage:", userId);
        console.log("userName from sessionStorage:", userName);
        console.log("busData from sessionStorage:", busData);
        
        // Check if userId exists
        if (!userId) {
            console.error("No userId found in sessionStorage");
            alert("User information missing. Please log in again.");
            navigate('/login');
            return;
        }
        
        // Convert to number and validate
        const userIdNum = parseInt(userId);
        if (isNaN(userIdNum)) {
            console.error("Invalid userId format:", userId);
            alert("Invalid user information. Please log in again.");
            navigate('/login');
            return;
        }
        
        setCurrentUserId(userIdNum);
        console.log("✅ Set currentUserId to:", userIdNum);
        
        // Check bus data
        if (!busData) {
            alert("No bus selected. Please select a bus first.");
            navigate('/passenger/bus');
            return;
        }
        
        try {
            const parsedBus = JSON.parse(busData);
            console.log("Parsed bus data:", parsedBus);
            
            if (!parsedBus?.bus_id) {
                alert("Invalid bus data. Please select a bus again.");
                navigate('/passenger/bus');
                return;
            }
            
            setSelectedBus(parsedBus);
            console.log("✅ Set selectedBus to:", parsedBus);
            
        } catch (e) {
            console.error("Failed to parse bus data", e);
            alert("Error loading bus information");
            navigate('/passenger/bus');
        }
    }, [navigate]);

    if (!selectedBus || !currentUserId) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-yellow-400">Loading...</p>
                </div>
            </div>
        );
    }

    console.log("%c=== Rendering Feedback Component ===", "color: magenta");
    console.log("Props being passed:", {
        passengerView: true,
        userId: currentUserId,
        busId: selectedBus.bus_id,
        busNumber: selectedBus.bus_number,
        routeId: selectedBus.route_id
    });

    return (
        <div className="min-h-screen bg-black">
            <Feedback 
                passengerView={true} 
                userId={currentUserId}
                busId={selectedBus.bus_id}
                busNumber={selectedBus.bus_number}
                routeId={selectedBus.route_id}
            />
        </div>
    );
};

export default PassengerFeedback;