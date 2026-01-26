import React, { useState } from "react";
import {
    FaUserPlus,
    FaUserCheck,
    FaUserEdit,
    FaUserTimes
} from "react-icons/fa";
import { userAPI } from "../../services/api";

const User = () => {
    const [showActions, setShowActions] = useState(true);

    /* ===================== STATE ===================== */
    const [mode, setMode] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        id: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        role_name: ""
    });

    // 🔶 FIND MODE STATES
    const [searchType, setSearchType] = useState("id"); // id | all | text
    const [searchText, setSearchText] = useState("");
    const [users, setUsers] = useState([]);

    /* ===================== HANDLERS ===================== */
    const handleChange = (e) => {
        setForm({
            ...form,
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
        setSearchText("");
        setUsers([]);
        setSearchType("id");
        setMode(null);
    };

    /* ===================== API FUNCTIONS ===================== */

    // ➕ ADD USER
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
            alert("✅ User added successfully");
            resetForm();
        } catch (error) {
            alert("❌ Failed to add user");
        } finally {
            setLoading(false);
        }
    };

    // 🔍 FIND USER (ID / ALL / TEXT)
    const findUser = async () => {
        try {
            setLoading(true);

            if (searchType === "id") {
                const res = await userAPI.getUserById(form.id);
                setUsers([res.data.data]);
            }

            if (searchType === "all") {
                const res = await userAPI.getAllUsers();
                setUsers(res.data.data);
            }

            if (searchType === "text") {
                const res = await userAPI.getUserByText(searchText);
                setUsers(res.data.data);
            }

            setShowActions(false);

        } catch (error) {
            alert("❌ User not found");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // ✏️ UPDATE USER
    const updateUser = async () => {
        try {
            setLoading(true);
            await userAPI.updateUser(form.id, {
                name: form.name,
                email: form.email,
                phone: form.phone,
                role_name: form.role_name
            });
            alert("✅ User updated successfully");
            resetForm();
        } catch (error) {
            alert("❌ Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    // ❌ DELETE USER
    const deleteUser = async () => {
        try {
            setLoading(true);
            await userAPI.deleteUser(form.id);
            alert("✅ User deleted successfully");
            resetForm();
        } catch (error) {
            alert("❌ Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    // 🔁 SUBMIT HANDLER
    const handleSubmit = () => {
        if (mode === "add") addUser();
        if (mode === "find") findUser();
        if (mode === "edit") updateUser();
        if (mode === "delete") deleteUser();
    };

    /* ===================== UI ===================== */
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-500 p-6">

            <h2 className="text-3xl font-bold text-white mb-6">
                User Management
            </h2>

            {/* ===================== ACTION BUTTONS ===================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                <button onClick={() => setMode("add")}
                    className="flex items-center gap-3 p-5 rounded-2xl bg-white/80 shadow hover:scale-105 transition">
                    <FaUserPlus className="text-2xl text-sky-600" />
                    Add User
                </button>

                <button onClick={() => setMode("find")}
                    className="flex items-center gap-3 p-5 rounded-2xl bg-white/80 shadow hover:scale-105 transition">
                    <FaUserCheck className="text-2xl text-sky-600" />
                    Find User
                </button>

                <button onClick={() => setMode("edit")}
                    className="flex items-center gap-3 p-5 rounded-2xl bg-white/80 shadow hover:scale-105 transition">
                    <FaUserEdit className="text-2xl text-sky-600" />
                    Update User
                </button>

                <button onClick={() => setMode("delete")}
                    className="flex items-center gap-3 p-5 rounded-2xl bg-white/80 shadow hover:scale-105 transition">
                    <FaUserTimes className="text-2xl text-sky-600" />
                    Delete User
                </button>

            </div>

            {/* ===================== ADD / EDIT / DELETE FORM ===================== */}
            {(mode === "add" || mode === "edit" || mode === "delete") && (
                <div className="max-w-xl bg-white/90 rounded-3xl shadow-lg p-6">

                    <h3 className="text-xl font-bold mb-4">
                        {mode.toUpperCase()} USER
                    </h3>

                    {(mode !== "add") && (
                        <input
                            name="id"
                            placeholder="User ID"
                            value={form.id}
                            onChange={handleChange}
                            className="w-full p-3 mb-3 border rounded-xl"
                        />
                    )}

                    {(mode !== "delete") && (
                        <>
                            <input name="name" placeholder="Name"
                                value={form.name} onChange={handleChange}
                                className="w-full p-3 mb-3 border rounded-xl" />

                            <input name="email" placeholder="Email"
                                value={form.email} onChange={handleChange}
                                className="w-full p-3 mb-3 border rounded-xl" />

                            {mode === "add" && (
                                <input name="password" type="password"
                                    placeholder="Password"
                                    value={form.password} onChange={handleChange}
                                    className="w-full p-3 mb-3 border rounded-xl" />
                            )}

                            <input name="phone" placeholder="Phone"
                                value={form.phone} onChange={handleChange}
                                className="w-full p-3 mb-3 border rounded-xl" />

                            <select name="role_name"
                                value={form.role_name} onChange={handleChange}
                                className="w-full p-3 mb-3 border rounded-xl">
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="passenger">Passenger</option>
                                <option value="owner">Owner</option>
                                <option value="driver">Driver</option>
                                <option value="conductor">Conductor</option>
                            </select>
                        </>
                    )}

                    <button onClick={handleSubmit}
                        className="bg-sky-600 text-white px-6 py-2 rounded-xl">
                        Submit
                    </button>

                </div>
            )}

            {/* ===================== FIND FORM ===================== */}

            {showActions && mode && (
                <div className="bg-white p-6 rounded-xl">
                    <h3 className="font-bold-mb-4">{mode.toUpperCase()}</h3>

                        {mode === "find" && (
                            <>
                                <select 
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className="w-full p-3 mb-3 border rounded"
                                >
                                    <option value="id">Find by ID</option>
                                    <option value="all">Get All Users</option>
                                    <option value="text">Search by Text</option>
                                </select>
            
                                {searchType === "id" && (
                                    <input 
                                        name="id" 
                                        value={form.id} 
                                        onChange={handleChange}
                                        placeholder="User ID"
                                        className="w-full p-3 mb-3 border rounded-xl" />
                                )}
            
                                {searchType === "text" && (
                                    <input placeholder="Search text"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className="w-full p-3 mb-3 border rounded-xl" />
                                )}
            
                                <button onClick={handleSubmit}
                                    className="bg-sky-600 text-white px-6 py-2 rounded-xl">
                                    Search
                                </button>
                            </>
                        )}
                </div>
            )}


            {/* ===================== RESULTS TABLE ===================== */}
            {users.length > 0 && (
                <div className="mt-8 bg-white/80 backdrop-blur rounded-3xl shadow-xl p-6">

                    {/* ✨ NEW UI HEADER */}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-sky-900">
                            Search Results ({users.length})
                        </h3>
                    </div>

                    {/* ✨ NEW UI GRID */}
                    <div className="grid gap-4">
                        {users.map((u) => (
                            <div
                                key={u.user_id}
                                className="flex items-center justify-between
                                bg-white rounded-2xl p-4 shadow hover:shadow-lg
                                transition hover:scale-[1.01]">

                                {/* Avatar */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full
                                        bg-sky-600 text-white flex items-center
                                        justify-center text-xl font-bold">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <p className="font-semibold">{u.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {u.email}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {u.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* Role Badge */}
                                <span className="px-4 py-1 rounded-full text-sm
                                    bg-sky-100 text-sky-700 font-semibold">
                                    {u.role_id}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default User;
