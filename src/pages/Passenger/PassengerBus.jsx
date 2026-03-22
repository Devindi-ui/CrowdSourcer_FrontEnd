import React from 'react';
import { useNavigate } from 'react-router-dom';
import Bus from '../Admin/bus';

const PassengerBus = () => {
    const navigate = useNavigate();

    const handleBusSelect = (bus) => {
        console.log("1️⃣ Bus selected in PassengerBus:", bus); 

        // Clear old data first
        sessionStorage.removeItem('selectedBus');
        sessionStorage.removeItem('selectedBusData');

        // Store new bus data
        sessionStorage.setItem('selectedBus', bus.bus_number);
        sessionStorage.setItem('selectedBusData', JSON.stringify({
            bus_id: bus.bus_id,
            bus_number: bus.bus_number,
            route_id: bus.route_id,
            route_no: bus.route_no,
            route_name: bus.route_name,
            seat_capacity: bus.seat_capacity
        }));

        // Verify it was stored
        const stored = sessionStorage.getItem('selectedBusData');
        console.log("2️⃣ Data stored in sessionStorage:", JSON.parse(stored)); 

        // Navigate
        navigate('/passenger/currentSituation');
    };

    return (
        <div className="min-h-screen bg-black">
            <Bus 
                passengerView={true} 
                onBusSelect={handleBusSelect}
            />
        </div>
    );
};

export default PassengerBus;