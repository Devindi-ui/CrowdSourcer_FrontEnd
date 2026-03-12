import React from 'react';
import FavouriteRoute from '../Admin/favRoute';

const PassengerFavRoute = () => {
    return (
        <div className="min-h-screen bg-black">
            <FavouriteRoute passengerView={true} />
        </div>
    );
};

export default PassengerFavRoute;