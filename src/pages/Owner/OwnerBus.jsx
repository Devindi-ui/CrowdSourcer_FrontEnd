import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Bus from '../Admin/bus';
import toast from 'react-hot-toast';

const OwnerBus = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [ownerId, setOwnerId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        const role = sessionStorage.getItem('role');
        
        console.log("OwnerBus - userId:", userId, "role:", role);
        
        if (!userId) {
            toast.error('Please log in first');
            navigate('/login');
            return;
        }
        
        setOwnerId(parseInt(userId));
        setLoading(false);
        
        // Show success message if coming from add bus
        if (location.state?.busAdded) {
            toast.success('✅ Bus added successfully!');
            // Clear the state
            window.history.replaceState({}, document.title);
        }
    }, [navigate, location]);

    const handleBusSuccess = () => {
        toast.success('✅ Bus added successfully!');
        navigate('/owner/buses', { state: { busAdded: true }, replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-yellow-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Bus 
                ownerView={true}
                ownerId={ownerId}
                role="owner"
                onSuccess={handleBusSuccess}
            />
        </div>
    );
};

export default OwnerBus;