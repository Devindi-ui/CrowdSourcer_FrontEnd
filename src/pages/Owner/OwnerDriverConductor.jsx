import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaPlus, FaEdit, FaTrash, FaUserTie, FaUsers,
    FaEnvelope, FaPhone, FaSearch, FaTimes
} from 'react-icons/fa';
import { ownerAPI } from '../../services/api';
import toast from 'react-hot-toast';

const OwnerDriverConductor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('drivers');
    const [staff, setStaff] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role_id: 5
    });

    useEffect(() => {
        fetchStaff();
    }, [activeTab]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const ownerId = sessionStorage.getItem('userId');
            const roleId = activeTab === 'drivers' ? 5 : 6;
            const res = await ownerAPI.getMyStaff(roleId, ownerId);
            if (res.data?.success) {
                setStaff(res.data.data || []);
                console.log(`Fetched ${res.data.data?.length || 0} ${activeTab}`);
            }
        } catch (error) {
            console.error("Failed to fetch staff", error);
            toast.error("Failed to load staff");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ADD NEW STAFF
    const handleAdd = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            toast.error('Please fill all fields');
            return;
        }
        
        try {
            const ownerId = sessionStorage.getItem('userId');
            const data = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role_id: activeTab === 'drivers' ? 5 : 6,
                owner_id: ownerId
            };
            
            await ownerAPI.createStaff(data);
            toast.success('Staff member added successfully');
            
            // Reset and close form
            setShowForm(false);
            setEditingStaff(null);
            setFormData({ name: '', email: '', password: '', phone: '', role_id: activeTab === 'drivers' ? 5 : 6 });
            
            // Refresh the list
            await fetchStaff();
            
        } catch (error) {
            console.error("Failed to add staff", error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to add staff member';
            toast.error('❌ ' + errorMsg);
        }
    };

    // UPDATE EXISTING STAFF
    const handleUpdate = async () => {
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error('Please fill all required fields');
            return;
        }
        
        try {
            const ownerId = sessionStorage.getItem('userId');
            const data = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role_id: activeTab === 'drivers' ? 5 : 6,
                owner_id: ownerId
            };
            
            // Only include password if provided
            if (formData.password && formData.password.trim() !== '') {
                data.password = formData.password;
            }
            
            console.log("Updating staff:", editingStaff.user_id, data);
            
            await ownerAPI.updateStaff(editingStaff.user_id, data);
            toast.success('Staff member updated successfully');
            
            // Reset and close form
            setShowForm(false);
            setEditingStaff(null);
            setFormData({ name: '', email: '', password: '', phone: '', role_id: activeTab === 'drivers' ? 5 : 6 });
            
            // Refresh the list
            await fetchStaff();
            
        } catch (error) {
            console.error("Failed to update staff", error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update staff member';
            toast.error('❌ ' + errorMsg);
        }
    };

    // Handle form submission (decides between add and update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (editingStaff) {
            await handleUpdate();
        } else {
            await handleAdd();
        }
    };

    const handleEdit = (staffMember) => {
        setEditingStaff(staffMember);
        setFormData({
            name: staffMember.name,
            email: staffMember.email,
            password: '',  // Password field empty for edit
            phone: staffMember.phone,
            role_id: activeTab === 'drivers' ? 5 : 6
        });
        setShowForm(true);
    };

    const handleDelete = async (staffMember) => {
        if (!window.confirm(`Are you sure you want to delete ${staffMember.name}?`)) return;
        
        try {
            const ownerId = sessionStorage.getItem('userId');
            
            // Send owner_id in the request body
            await ownerAPI.deleteStaff(staffMember.user_id, { owner_id: ownerId });
            toast.success('Staff member deleted successfully');
            await fetchStaff();
            
        } catch (error) {
            console.error("Failed to delete staff", error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to delete staff member';
            toast.error('❌ ' + errorMsg);
        }
    };

    const filteredStaff = staff.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && staff.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-yellow-400 animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-black/40 backdrop-blur-xl border border-yellow-600/30 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></span>
                    {activeTab === 'drivers' ? 'Drivers' : 'Conductors'}
                </h1>
                <p className="text-gray-400 mt-1">
                    {activeTab === 'drivers' 
                        ? 'Manage your drivers - add, edit, or remove' 
                        : 'Manage your conductors - add, edit, or remove'}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-yellow-600/20">
                <button
                    onClick={() => {
                        setActiveTab('drivers');
                        setShowForm(false);
                        setEditingStaff(null);
                    }}
                    className={`px-6 py-3 rounded-t-xl transition-all duration-300 flex items-center gap-2 ${
                        activeTab === 'drivers'
                            ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <FaUserTie /> Drivers ({staff.filter(s => s.role_id === 5).length})
                </button>
                <button
                    onClick={() => {
                        setActiveTab('conductors');
                        setShowForm(false);
                        setEditingStaff(null);
                    }}
                    className={`px-6 py-3 rounded-t-xl transition-all duration-300 flex items-center gap-2 ${
                        activeTab === 'conductors'
                            ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <FaUsers /> Conductors ({staff.filter(s => s.role_id === 6).length})
                </button>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/60 border border-yellow-600/30 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingStaff(null);
                        setFormData({ name: '', email: '', password: '', phone: '', role_id: activeTab === 'drivers' ? 5 : 6 });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition"
                >
                    <FaPlus /> Add {activeTab === 'drivers' ? 'Driver' : 'Conductor'}
                </button>
            </div>

            {/* Staff List with Edit/Delete Buttons */}
            {filteredStaff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStaff.map(staffMember => (
                        <div key={staffMember.user_id} className="bg-black/40 backdrop-blur-xl border border-yellow-600/20 rounded-xl p-4 hover:border-yellow-500/50 transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                                        {activeTab === 'drivers' ? 
                                            <FaUserTie className="text-yellow-400 text-xl" /> : 
                                            <FaUsers className="text-yellow-400 text-xl" />
                                        }
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">{staffMember.name}</h3>
                                        <p className="text-xs text-yellow-400">{staffMember.role_name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(staffMember)}
                                        className="text-blue-400 hover:text-blue-300 transition p-1"
                                        title="Edit"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(staffMember)}
                                        className="text-red-400 hover:text-red-300 transition p-1"
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-400 flex items-center gap-2">
                                    <FaEnvelope className="text-yellow-400/70" /> {staffMember.email}
                                </p>
                                <p className="text-gray-400 flex items-center gap-2">
                                    <FaPhone className="text-yellow-400/70" /> {staffMember.phone}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-black/40 backdrop-blur-xl rounded-2xl border border-yellow-600/20">
                    {activeTab === 'drivers' ? 
                        <FaUserTie className="text-6xl text-yellow-400/30 mx-auto mb-4" /> : 
                        <FaUsers className="text-6xl text-yellow-400/30 mx-auto mb-4" />
                    }
                    <h3 className="text-xl text-white mb-2">No {activeTab} found</h3>
                    <p className="text-gray-400 mb-4">Click the Add button to register a new {activeTab === 'drivers' ? 'driver' : 'conductor'}</p>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-900/90 backdrop-blur-xl border border-yellow-600/30 rounded-3xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                                {editingStaff ? 'Edit' : 'Add'} {activeTab === 'drivers' ? 'Driver' : 'Conductor'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingStaff(null);
                                }}
                                className="text-gray-400 hover:text-white transition"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-yellow-400 block mb-1 text-sm">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 bg-black/60 border border-yellow-600/30 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="text-yellow-400 block mb-1 text-sm">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 bg-black/60 border border-yellow-600/30 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="text-yellow-400 block mb-1 text-sm">
                                    {editingStaff ? 'Password (leave blank to keep current)' : 'Password *'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingStaff}
                                    className="w-full p-3 bg-black/60 border border-yellow-600/30 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="text-yellow-400 block mb-1 text-sm">Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 bg-black/60 border border-yellow-600/30 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-yellow-500 text-black rounded-xl font-semibold hover:bg-yellow-600 transition"
                                >
                                    {editingStaff ? 'Update' : 'Add'} {activeTab === 'drivers' ? 'Driver' : 'Conductor'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingStaff(null);
                                    }}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerDriverConductor;