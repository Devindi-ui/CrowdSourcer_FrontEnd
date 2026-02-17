import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus,
  FaUserCheck,
  FaUserEdit,
  FaUserTimes,
  FaArrowLeft
} from "react-icons/fa";
import { userAPI, roleAPI } from "../../services/api";

const User = () => {
  // State
  const navigate = useNavigate();
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
  const [editLoaded, setEditLoaded] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [searchTypeDropdownOpen, setSearchTypeDropdownOpen] = useState(false);

  /*  LOAD ROLES  */
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

  /*  HELPERS  */
  const resetAll = () => {
    setMode(null);
    setUsers([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);
    setForm({
      id: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      role_id: "",
    });
    setRoleDropdownOpen(false);
    setSearchTypeDropdownOpen(false);
    setTimeout(() => setMode(null), 0);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const populateFormFromUser = (u) => {
    setForm({
      id: u.user_id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role_name: u.role_name,
      password: "",
    });
    setEditLoaded(true);
  };

  /*  API ACTIONS  */
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

  const findUser = async () => {
    try {
      setLoading(true);
      setUsers([]);
      setShowResults(false);
      setMode("find");

      if (searchType === "id") {
        if (!form.id)return alert("Enter user ID");
        const res = await userAPI.getUserById(form.id); 
        setUsers([res.data.data]);
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

  const loadUserForEdit = async () => {
    if (!form.id) return alert("Enter User ID");
    try {
      setLoading(true);
      const res = await userAPI.getUserById(form.id);
      populateFormFromUser(res.data.data);
      setUsers([res.data.data]);
      setShowResults(true);  
    } catch (error) {
      alert("❌ User Not Found");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async () => {
    try {
      setLoading(true);

      await userAPI.updateUser(form.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role_name: form.role_name
      });

      alert("✅ User updated");

      const res = await userAPI.getUserById(form.id);
      setUsers([res.data.data]);
      setShowResults(true);

    } catch (err) {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    try {
      setLoading(true);
      await userAPI.deleteUser(form.id);
      alert("✅ User deleted");

      const res = await userAPI.getAllUsers();
      setUsers(res.data.data);
      setShowResults(true);

     } catch (err) {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addUser();
    if (mode === "find") findUser();
    if (mode === "edit" && !editLoaded) loadUserForEdit();
    else if (mode === "edit") updateUser();
    if (mode === "delete") deleteUser();
  };

  return (
    <div className="min-h-screen bg-black/90 text-white p-6 font-sans">

      {/* Back Button */}
      <button 
        type="button"
        onClick={() => {
          if (mode) {
            setMode(null);
          } else {
            navigate("/admin");
          }
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
          bg-black/60 backdrop-blur-md border border-yellow-600
          text-yellow-400 px-4 py-2 rounded-full 
          shadow-[0_0_20px_rgba(255,215,0,0.25)]
          hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaArrowLeft className="text-yellow-400"/>
        <span className="font-semibold text-sm">Back</span>
      </button>     

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 tracking-wide text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
        User Management
      </h1>

      {/* Action Buttons */}
      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaUserPlus />} text="Add User" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaUserCheck />} text="Find User" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaUserEdit />} text="Update User" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaUserTimes />} text="Delete User" onClick={() => setMode("delete")} />
        </div>
      )}

      {/* Form Section */}
      {mode && (
        <div className="flex justify-center items-center h-full mt-20 overflow-hidden">
        <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] p-6 backdrop-blur-md">

          <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">{mode} User</h2>

          {mode === "edit" && !editLoaded && (
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="Enter User ID"
              className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
            />
          )}

          {(mode === "add" || (mode === "edit" && editLoaded)) && (
            <>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Name"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              />

              <input name="email" value={form.email} onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              />

              {mode === "add" && (
                <input name="password" type="password" value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />
              )}

              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="Phone"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              />

              {/* Custom Role Dropdown */}
              <div className="relative w-full mb-3">
                <div
                  className="p-3 bg-black/60 border border-yellow-600 rounded-xl cursor-pointer flex justify-between items-center text-white"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                >
                  {form.role_name || "Select Role"}
                  <span className="text-yellow-400">▼</span>
                </div>
                {roleDropdownOpen && (
                  <ul className="absolute w-full bg-black/70 border border-yellow-600 rounded-xl mt-1 max-h-44 overflow-y-auto z-50">
                    {roles.map((r) => (
                      <li
                        key={r.role_id}
                        className="p-3 hover:bg-yellow-500 hover:text-black cursor-pointer"
                        onClick={() => {
                          setForm({ ...form, role_name: r.role_name });
                          setRoleDropdownOpen(false);
                        }}
                      >
                        {r.role_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {/* Custom Search Type Dropdown */}
          {mode === "find" && (
            <>
              <div className="relative w-full mb-3">
                <div
                  className="p-3 bg-black/60 border border-yellow-600 rounded-xl cursor-pointer flex justify-between items-center text-white"
                  onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)}
                >
                  {searchType === "id" ? "Find by ID" : searchType === "all" ? "Get All Users" : "Search by Text"}
                  <span className="text-yellow-400">▼</span>
                </div>
                {searchTypeDropdownOpen && (
                  <ul className="absolute w-full bg-black/70 border border-yellow-600 rounded-xl mt-1 max-h-44 overflow-y-auto z-50">
                    <li className="p-3 hover:bg-yellow-500 hover:text-black cursor-pointer"
                      onClick={() => { setSearchType("id"); setSearchTypeDropdownOpen(false); }}
                    >Find by ID</li>
                    <li className="p-3 hover:bg-yellow-500 hover:text-black cursor-pointer"
                      onClick={() => { setSearchType("all"); setSearchTypeDropdownOpen(false); }}
                    >Get All Users</li>
                    <li className="p-3 hover:bg-yellow-500 hover:text-black cursor-pointer"
                      onClick={() => { setSearchType("text"); setSearchTypeDropdownOpen(false); }}
                    >Search by Text</li>
                  </ul>
                )}
              </div>

              {searchType === "id" && (
                <input name="id" value={form.id} onChange={handleChange}
                  placeholder="User ID"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />
              )}

              {searchType === "text" && (
                <input value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search name / email / phone"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />
              )}
            </>
          )}

          {mode === "delete" && (
            <input name="id" value={form.id} onChange={handleChange}
              placeholder="User ID"
              className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
            />
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)]"
            >
              {loading ? "Please wait..." : "Submit"}
            </button>

            <button
              onClick={resetAll}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition"
            >
              Cancel
            </button>
          </div>

        </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && users.length > 0 && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10 backdrop-blur-md">

          <h2 className="text-xl font-bold mb-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            🔍 Search Results
          </h2>

          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.user_id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-600/30 
                  bg-black/60 hover:bg-black/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-black flex items-center justify-center font-bold text-lg shadow-[0_0_8px_rgba(255,215,0,0.4)]">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-white">{u.name}</p>
                    <p className="text-sm text-yellow-300">{u.email}</p>
                    <p className="text-sm text-yellow-300">{u.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-yellow-400 block mb-1">
                    UID-{u.user_id}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        u.role_name === "Admin"
                          ? "bg-red-500/20 text-red-400"
                          : u.role_name === "Owner"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }
                    `}
                  >
                    {u.role_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ActionBtn = ({ icon, text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-2 flex items-center gap-3 p-5 bg-black/70 border border-yellow-600 rounded-3xl 
      shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:bg-black/50 hover:scale-105 transition text-white"
  >
    <span className="text-yellow-400 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

export default User;
