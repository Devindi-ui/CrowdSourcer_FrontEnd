import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FaUserPlus,
    FaUserCheck,
    FaUserEdit,
    FaUserTimes
 } from "react-icons/fa";

const User = () => {
    const [mode, setMode] = useState(null);
    const [form, setForm] = useState({
        id: "",
        name: "",
        email: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({ id: "", name: "", email: "" });
    };

    const handleSubmit = () => {
        alert(`${mode.toUpperCase()} USER\n` + JSON.stringify(form, null, 2));
        resetForm();
        setMode(null);
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
                    <FaUserPlus className="text-2xl text-sky-600"/> 
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
                    <FaUserPlus className="text-2xl text-sky-600"/> 
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
                    <FaUserPlus className="text-2xl text-sky-600"/> 
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