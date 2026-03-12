import React from 'react';
import { useNavigate } from 'react-router-dom';
import Bus from '../Admin/bus';

const PassengerBus = () => {
    const navigate = useNavigate();

    const handleBusSelect = (bus) => {
        console.log("Selected bus:", bus); // Debug log
        
        // Store the COMPLETE bus data
        sessionStorage.setItem('selectedBusData', JSON.stringify({
            bus_id: bus.bus_id,
            bus_number: bus.bus_number,
            route_name: bus.route_name,
            route_no: bus.route_no,
            seat_capacity: bus.seat_capacity
        }));
        
        // Also store just the bus ID separately if needed
        sessionStorage.setItem('busId', bus.bus_id);
        
        navigate('/passenger/feedback');
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