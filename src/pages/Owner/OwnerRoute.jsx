import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoutePage from '../Admin/route';

const OwnerRoute = () => {
    const navigate = useNavigate();
    const [ownerId, setOwnerId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        const role = sessionStorage.getItem('role');
        
        if (!userId) {
            alert('Please log in first');
            navigate('/login');
            return;
        }
        
        if (role !== 'owner' && role !== 'Owner') {
            alert('Access denied. Owner only.');
            navigate('/');
            return;
        }
        
        setOwnerId(parseInt(userId));
        setLoading(false);
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-yellow-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <RoutePage 
                ownerView={true}
                ownerId={ownerId}
            />
        </div>
    );
};

export default OwnerRoute;