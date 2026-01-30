import React, { useEffect, useState } from "react";
import {
  FaUserPlus,
  FaUserCheck,
  FaUserEdit,
  FaUserTimes,
} from "react-icons/fa";
import { userAPI, roleAPI } from "../../services/api";

const User = () => {
  /* ===================== STATE ===================== */
  const [mode, setMode] = useState(null); // add | find | edit | delete
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    role_name: "",
  });

  const [searchType, setSearchType] = useState("id"); // id | all | text
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);

  const [roles, setRoles] = useState([]);

  const [showResults, setShowResults] = useState(false);

  /* ===================== LOAD ROLES ===================== */
  useEffect(() => {
    const loadRoles = async () => {
        try {
            const res = await roleAPI.getAllRoles();
            setRoles(res.data.data);
        } catch (error) {
            console.error("Failed to load roles");
        }
    };
    loadRoles();
  }, []);

  /* ===================== HELPERS ===================== */
  const resetAll = () => {
    setMode(null);
    setUsers([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setForm({
      id: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      role_name: "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===================== API ACTIONS ===================== */

  // ➕ ADD
  const addUser = async () => {
    try {
      setLoading(true);
      await userAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role_name: form.role_name,
      });
      alert("✅ User added successfully");
      resetAll();
    } catch (err) {
      alert("❌ Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 FIND
  const findUser = async () => {
    try {
      setLoading(true);
      setUsers([]);
      setShowResults(false);
      setMode("find");

      if (searchType === "id") {
        if (!form.id)return alert("Enter user ID");

        const res = await userAPI.getUserById(form.id);
        setUsers([res.data.data]); //data arrives
        setShowResults(true);
      }

      if (searchType === "all") {
        const res = await userAPI.getAllUsers();
        setUsers(res.data.data);
        setShowResults(true);
      }

      if (searchType === "text") {
        if (!searchText.trim()) {
          alert("Enter text to search");
          return;
        }

        const res = await userAPI.getUserByText(searchText);
        setUsers(res.data.data || []);
        setShowResults(true);
      }
      
    } catch (err) {
      alert("❌ User not found");
      setUsers([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ UPDATE
  const updateUser = async () => {
    try {
      if (!form.id) {
        alert("User ID is required");
        return;
      }

      setLoading(true);

      //build payload
      const payload = {};
      
      if (form.name) payload.name = form.name;
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      if (form.role_name) payload.role_name = form.role_name;

      await userAPI.updateUser(Number(form.id), payload);
      
      alert("✅ User updated");
      resetAll();
    } catch (err) {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ❌ DELETE
  const deleteUser = async () => {
    try {
      setLoading(true);
      await userAPI.deleteUser(form.id);
      alert("✅ User deleted");
      resetAll();
    } catch (err) {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== SUBMIT ===================== */
  const handleSubmit = () => {
    if (mode === "add") addUser();
    if (mode === "find") findUser();
    if (mode === "edit") updateUser();
    if (mode === "delete") deleteUser();
  };

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-600 p-6">
      <h1 className="text-3xl font-bold text-white mb-8">
        User Management
      </h1>

      {/* ===================== ACTION BUTTONS ===================== */}
      {!mode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <ActionBtn icon={<FaUserPlus />} text="Add User" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaUserCheck />} text="Find User" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaUserEdit />} text="Update User" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaUserTimes />} text="Delete User" onClick={() => setMode("delete")} />
        </div>
      )}

      {/* ===================== FORMS ===================== */}
      {mode && (
        <div className="max-w-xl bg-white rounded-3xl shadow-xl p-6 mb-10">
          <h2 className="text-xl font-bold mb-4 capitalize">{mode} User</h2>

          {/* FIND MODE */}
          {mode === "find" && (
            <>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full p-3 mb-3 border rounded-xl"
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
                  className="w-full p-3 mb-3 border rounded-xl"
                />
              )}

              {searchType === "text" && (
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search name / email / phone"
                  className="w-full p-3 mb-3 border rounded-xl"
                />
              )}
            </>
          )}

          {/* ADD / EDIT / DELETE */}
          {mode !== "find" && (
            <>
              {mode !== "add" && (
                <input
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  placeholder="User ID"
                  className="w-full p-3 mb-3 border rounded-xl"
                />
              )}

              {mode !== "delete" && (
                <>
                  <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full p-3 mb-3 border rounded-xl" />
                  <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-3 mb-3 border rounded-xl" />
                  {mode === "add" && (
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full p-3 mb-3 border rounded-xl" />
                  )}
                  <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full p-3 mb-3 border rounded-xl" />

                  {/* Role Dropdown */}
                  <select 
                    name="role_name" 
                    value={form.role_name} 
                    onChange={handleChange} 
                    className="w-full p-3 mb-3 border rounded-xl"
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                        <option key={r.role_id} value={r.role_name}>
                            {r.role_name}
                        </option>
                    ))}
                  </select>
                </>
              )}
            </>
          )}

          <div className="flex gap-3">
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="bg-sky-600 text-white px-6 py-2 rounded-xl"
            >
              {loading ? "Please wait..." : "Submit"}
            </button>
            <button 
              onClick={resetAll} 
              className="bg-gray-500 text-white px-6 py-2 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===================== RESULTS ===================== */}
      {showResults && users.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Search Results</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.user_id} className={i % 2 ? "bg-gray-50" : ""}>
                    <td className="p-3 font-semibold">#{u.user_id}</td>
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.phone}</td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full bg-indigo-100 
                        text-indigo-700 text-sm"
                      >
                        {u.role_name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===================== SMALL COMPONENT ===================== */
const ActionBtn = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-5 bg-white rounded-2xl shadow hover:scale-105 transition"
  >
    <span className="text-sky-600 text-2xl">{icon}</span>
    <span className="font-semibold">{text}</span>
  </button>
);

export default User;
