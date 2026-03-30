import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrentSituation from '../Admin/currentSituation';

const OwnerCurrentSituation = () => {
    const navigate = useNavigate();
    const [ownerId, setOwnerId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        const role = sessionStorage.getItem('role');
        
        console.log("OwnerCurrentSituation - userId:", userId, "role:", role);
        
        if (!userId) {
            alert('Please log in first');
            navigate('/login');
            return;
        }
        
        // Check if user has owner role (case insensitive)
        if (role && role.toLowerCase() !== 'owner') {
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
            <CurrentSituation 
                ownerView={true}
                ownerId={ownerId}
            />
        </div>
    );
};

export default OwnerCurrentSituation;