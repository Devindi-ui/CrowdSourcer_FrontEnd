import React from 'react';
import { useLocation } from 'react-router-dom';
import CurrentSituation from '../Admin/currentSituation';

const PassengerCurrentSituation = () => {
    const location = useLocation();
    const { preselectedBus, mode } = location.state || {};

    return (
        <div className="min-h-screen bg-black">
            <CurrentSituation 
                passengerView={true} 
                preselectedBus={preselectedBus}
                initialMode={mode || 'view'}
            />
        </div>
    );
};

export default PassengerCurrentSituation;0