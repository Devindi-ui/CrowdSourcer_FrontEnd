import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FaUserPlus,
    FaUserCheck,
    FaUserEdit,
    FaUserTimes
 } from "react-icons/fa";
 import { userAPI } from "../../services/api";

const User = () => {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState(null);
    const [form, setForm] = useState({
        id: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        role_name: ""
    });

    const roles = ["Admin", "Owner", "Driver", "Passenger"];

    const handleChange = (e) => {
        setForm({ ...form, 
            [e.target.name]: e.target.value 
        });
    };

    const resetForm = () => {
        setForm({ 
            id: "", 
            name: "", 
            email: "",
            password: "",
            phone: "",
            role_name: ""
        });
        setMode(null);
    };

    //API FUNCTIONS

    //Add user
    const addUser = async () => {
        try {
            setLoading(true);
            await userAPI.register({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                role_name: form.role_name
            });
            alert("✅User added successfully");
            resetForm();
        } catch (error) {
            alert("❌Failed to add user");
        } finally {
            setLoading(false);
        }
    };

    //find user
    const findUser = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getUserById(form.id);
            setForm({
                id: res.data.id,
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone,
                role_name: res.data.role_name,
                password: ""
            });
        } catch (error) {
            alert("❌User not found");
        } finally {
            setLoading(false);
        }
    };

    //Update user
    const updateUser = async () => {
        try {
            setLoading(true);
            await userAPI.updateUser(form.id, {
                name: form.name,
                email: form.email ,
                phone: form.phone,
                role_name: form.role_name 
            });
        } catch (error) {
            alert("❌Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    //Delete user
    const deleteUser = async () => {
        try {
            setLoading(true);
            await userAPI.deleteUser(form.id);
            alert("✅User deleted successfully");
            resetForm();
        } catch (error) {
            alert("❌ Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    //Decide which function to call
    const handleSubmit = () => {
        if (mode === "add") addUser();
        if (mode === "find") findUser();
        if (mode === "edit") updateUser();
        if (mode === "delete") deleteUser();
    };

    return(
        <div className="min-h-screen bg-gradient-to-br from-slate-900 
            to-sky-500 p-6">
            <h2 className="text-3xl font-bold text-white mb-6">
                User Management
            </h2>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
                gap-4 mb-8">

                <button 
                    onClick={() => setMode("add")}
                    className="flex items-center gap-3 p-5 rounded-2xl
                        bg-white/80 backdrop-blur shadow-md hover:scale-105
                        hover:shadow-xl transition" 
                >
                    <FaUserPlus className="text-2xl text-sky-600"/> 
                    <span className="font-semibold text-slate-800">
                        Add User
                    </span> 
                </button>

                <button 
                    onClick={() => setMode("find")}
                    className="flex items-center gap-3 p-5 rounded-2xl
                        bg-white/80 backdrop-blur shadow-md hover:scale-105
                        hover:shadow-xl transition" 
                >
                    <FaUserCheck className="text-2xl text-sky-600"/> 
                    <span className="font-semibold text-slate-800">
                        Find User
                    </span> 
                </button>

                <button 
                    onClick={() => setMode("edit")}
                    className="flex items-center gap-3 p-5 rounded-2xl
                        bg-white/80 backdrop-blur shadow-md hover:scale-105
                        hover:shadow-xl transition" 
                >
                    <FaUserEdit className="text-2xl text-sky-600"/> 
                    <span className="font-semibold text-slate-800">
                        Update User
                    </span> 
                </button>

                <button 
                    onClick={() => setMode("delete")}
                    className="flex items-center gap-3 p-5 rounded-2xl
                        bg-white/80 backdrop-blur shadow-md hover:scale-105
                        hover:shadow-xl transition" 
                >
                    <FaUserTimes className="text-2xl text-sky-600"/> 
                    <span className="font-semibold text-slate-800">
                        Delete User
                    </span> 
                </button>           

            </div>

            {/* Forms */}
            {mode && (
                <div className="max-w-xl bg-white/90 backdrop-blur
                    rounded-3xl shadow-lg p-6">

                    <h3 className="text-xl font-bold text-sky-900 mb-4">
                        {mode.toUpperCase()} USER
                    </h3>

                    {(mode === "find" || mode === "edit" || mode === "delete") && (
                        <input 
                            name="id" 
                            placeholder="User ID"
                            value={form.id}
                            onChange={handleChange}
                            className="w-full p-3 mb-3 rounded-xl 
                                border border-gray-300 focus:outline-none
                                focus:ring-2 focus:ring-sky-400"    
                        />
                    )}

                    {(mode === "add" || mode === "edit") && (
                        <>
                            <input 
                                name="name" 
                                placeholder="Name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full p-3 mb-3 rounded-xl
                                    border border-gray-300 focus:outline-none
                                    focus:ring-2 focus:ring-sky-400"    
                            />
                            <input 
                                name="email" 
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full p-3 mb-3 rounded-xl
                                    border border-gray-300 focus:outline-none
                                    focus:ring-2 focus:ring-sky-400"    
                            />

                            {/* Password for ADD */}
                            {mode === "add" && (
                                <input 
                                    name="password" 
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full p-3 mb-3 rounded-xl
                                        border border-gray-300 focus:outline-none
                                        focus:ring-2 focus:ring-sky-400"    
                                />
                            )}

                            <input 
                                name="phone" 
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Phone"
                                className="w-full p-3 mb-3 rounded-xl
                                    border border-gray-300 focus:outline-none
                                    focus:ring-2 focus:ring-sky-400"    
                            />

                            {/* Role Selector */}
                            <select 
                                name="role_name"
                                value={form.role_name}
                                onChange={handleChange}
                                className="w-full p-3 mb-3 rounded-xl
                                    border border-gray-300 focus:outline-none
                                    focus:ring-2 focus:ring-sky-400" 
                            >
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="passenger">Passenger</option>
                                <option value="owner">Owner</option>
                                <option value="driver">Driver</option>
                                <option value="conductor">Conductor</option>
                            </select>
                        </>
                    )}

                    {/* Form Buttons */}
                    <div className="flex gap-4 mt-4">
                        <button 
                            onClick={handleSubmit}
                            className="px-6 py-2 rounded-xl bg-sky-600
                                text-white font-semibold hover:bg-sky-700
                                transition" 
                        >
                            Submit
                        </button>

                        <button 
                            onClick={() => setMode(null)}
                            className="px-6 py-2 rounded-xl bg-gray-400
                                text-white font-semibold hover:bg-gray-500
                                transition" 
                        >
                            Cancel
                        </button>                                      
                    </div>
                </div>
            )}
        </div>
    );
 }

 export default User;