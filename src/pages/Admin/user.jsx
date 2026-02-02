import React, { useEffect, useState } from "react";
import {
  FaUserPlus,
  FaUserCheck,
  FaUserEdit,
  FaUserTimes,
  FaArrowLeft
} from "react-icons/fa";
import { userAPI, roleAPI } from "../../services/api";

const User = () => {
  /*  STATE  */
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

    setTimeout(() => setMode(null), 0);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  //fill form after ID fetch
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

  //  ADD
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
      console.error("User adding failed", err.message);
      
      alert("❌ Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  // FIND
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

  //Load user by ID
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

  //  UPDATE
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

  // DELETE
  const deleteUser = async () => {
    try {
      setLoading(true);
      await userAPI.deleteUser(form.id);
      alert("✅ User deleted");

      //load users after delete
      const res = await userAPI.getAllUsers();
      setUsers(res.data.data);
      setShowResults(true);

     } catch (err) {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /*  SUBMIT  */
  const handleSubmit = () => {
    if (mode === "add") addUser();
    if (mode === "find") findUser();
    if (mode === "edit" && !editLoaded) loadUserForEdit();
    else if (mode === "edit") updateUser();
    if (mode === "delete") deleteUser();
  };


  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-600 p-6">

      <h1 className="text-3xl font-bold text-white mb-8">
        User Management
      </h1>

      {/* ACTION BUTTONS */}
      {!mode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <ActionBtn icon={<FaUserPlus />} text="Add User" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaUserCheck />} text="Find User" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaUserEdit />} text="Update User" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaUserTimes />} text="Delete User" onClick={() => setMode("delete")} />
        </div>
      )}

      {/*  FORM  */}
      {mode && (
        <div className="flex justify-center items-center h-100vh mt-30 overflow-hidden">

        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 capitalize">{mode} User</h2>

          {/* UPDATE STEP 1 – ID ONLY */}
          {mode === "edit" && !editLoaded && (
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="Enter User ID"
              className="w-full p-3 mb-3 border rounded-xl"
            />
          )}

          {/* FULL FORM (ADD or EDIT after ID) */}
          {(mode === "add" || (mode === "edit" && editLoaded)) && (
            <>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-3 mb-3 border rounded-xl"
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 mb-3 border rounded-xl"
              />

              {mode === "add" && (
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-3 mb-3 border rounded-xl"
                />
              )}

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full p-3 mb-3 border rounded-xl"
              />

              <select
                name="role_name"
                value={form.role_name}
                onChange={handleChange}
                className="w-full p-3 mb-3 border rounded-xl"
              >
                <option value="">Select Role</option>
                {roles.map(r => (
                  <option key={r.role_id} value={r.role_name}>
                    {r.role_name}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* FIND MODE ONLY */}
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

          {/* DELETE MODE */}
          {mode === "delete" && (
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="User ID"
              className="w-full p-3 mb-3 border rounded-xl"
            />
          )}

          {/* ACTION BUTTONS */}
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
        </div>
      )}

      {/* RESULTS */}
      {showResults && users.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            🔍 Search Results
          </h2>

          <div className="space-y-4">
            {users.map((u) => (
              <div
                key={u.user_id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {u.name}
                    </p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <p className="text-sm text-gray-500">{u.phone}</p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <span className="text-xs text-gray-400 block mb-1">
                    ID #{u.user_id}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        u.role_name === "Admin"
                          ? "bg-red-100 text-red-700"
                          : u.role_name === "Owner"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-green-100 text-green-700"
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

  /*  SMALL COMPONENT  */
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
