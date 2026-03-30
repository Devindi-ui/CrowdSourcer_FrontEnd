import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Trip from '../Admin/trip';

const OwnerTrip = () => {
    const navigate = useNavigate();
    const [ownerId, setOwnerId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        let role = sessionStorage.getItem('role');
        
        // Try to get from localStorage if sessionStorage is null
        if (!role) {
            const userFromStorage = localStorage.getItem('user');
            if (userFromStorage) {
                try {
                    const user = JSON.parse(userFromStorage);
                    role = user?.role_name || user?.role || user?.roleName;
                } catch (e) {}
            }
        }
        
        console.log("OwnerTrip - userId:", userId, "role:", role);
        
        if (!userId) {
            alert('Please log in first');
            navigate('/login');
            return;
        }
        
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
            <Trip 
                ownerView={true}
                ownerId={ownerId}
            />
        </div>
    );
};

export default OwnerTrip;