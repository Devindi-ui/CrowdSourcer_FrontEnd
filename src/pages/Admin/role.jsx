import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaUserTag
} from "react-icons/fa";
import { roleAPI } from "../../services/api";
import ThemeLayout from "../../components/common/Layout/ThemeLayout";
import ActionBtn from "../../components/common/Layout/ActionBtn";

const Role = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    role_name: "",
  });

  const [roles, setRoles] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  }, []);

  const resetAll = () => {
    setMode(null);
    setRoles([]);
    setShowResults(false);
    setEditLoaded(false);
    setError("");
    setForm({
      id: "",
      role_name: "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const populateFormFromRole = (r) => {
    setForm({
      id: r.role_id,
      role_name: r.role_name,
    });
    setEditLoaded(true);
  };

  // add
  const addRole = async () => {
    if (!form.role_name.trim()) {
      alert("Please enter role name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await roleAPI.createRole({
        role_name: form.role_name
      });

      alert("✅ Role added successfully");
      resetAll();
    } catch (err) {
      console.error("Add failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Failed to add role";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  //get all
  const getAllRoles = async () => {
    try {
      setLoading(true);
      setRoles([]);
      setShowResults(false);
      setError("");

      console.log("Getting all roles");
      const res = await roleAPI.getAllRoles();
      const data = res.data?.data || [];
      
      if (data.length > 0) {
        setRoles(data);
        setShowResults(true);
      } else {
        alert("No roles found");
      }
      
    } catch (err) {
      console.error("Get all failed:", err);
      setError("Failed to fetch roles");
      alert("❌ Failed to fetch roles");
      setRoles([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // load for edit
  const loadRoleForEdit = async () => {
    if (!form.id) {
      alert("Enter Role ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await roleAPI.getRoleById(form.id);
      
      if (res.data?.data) {
        const role = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        populateFormFromRole(role);
        setRoles([role]);
        setShowResults(true);
      } else {
        alert("Role not found");
      }
    } catch (error) {
      console.error("Load failed:", error);
      setError("Role not found");
      alert("❌ Role not found");
    } finally {
      setLoading(false);
    }
  };

  // update
  const updateRole = async () => {
    if (!form.role_name.trim()) {
      alert("Please enter role name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await roleAPI.updateRole(form.id, {
        role_name: form.role_name
      });

      alert("✅ Role updated successfully");

      const res = await roleAPI.getRoleById(form.id);
      if (res.data?.data) {
        const role = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        setRoles([role]);
        setShowResults(true);
      }
    } catch (err) {
      console.error("Update failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Update failed";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // delete
  const deleteRole = async () => {
    if (!form.id) {
      alert("Enter Role ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await roleAPI.deleteRole(form.id);
      alert("✅ Role deleted successfully");

      // Refresh the list after delete
      const res = await roleAPI.getAllRoles();
      setRoles(res.data?.data || []);
      setShowResults(true);
      
      setForm({ ...form, id: "" });
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Delete failed");
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addRole();
    else if (mode === "find") getAllRoles();
    else if (mode === "edit" && !editLoaded) loadRoleForEdit();
    else if (mode === "edit" && editLoaded) updateRole();
    else if (mode === "delete") deleteRole();
  };

  return (
    <ThemeLayout>

      {/* Error Display */}
      {error && (
        <div className="mt-20 max-w-xl mx-auto bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl">
          Error: {error}
        </div>
      )}

      <button 
        type="button"
        onClick={() => {
          if (mode) {
            resetAll();
          } else {
            navigate("/admin");
          }
        }}
        className="fixed top-6 z-50 flex items-center gap-2 mt-15
          bg-black/60 backdrop-blur-md border border-yellow-600
          text-yellow-400 px-4 py-2 rounded-full 
          shadow-[0_0_20px_rgba(255,215,0,0.25)]
          hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaArrowLeft className="text-yellow-400"/>
        <span className="font-semibold text-sm">Back</span>
      </button>     

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlusCircle />} text="Add Role" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="View All Roles" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Role" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Role" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center h-full mt-20 overflow-hidden">
        <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] p-6 backdrop-blur-md">

          <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">{mode} Role</h2>

          {mode === "edit" && !editLoaded && (
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="Enter Role ID"
              className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              disabled={loading}
            />
          )}

          {(mode === "add" || (mode === "edit" && editLoaded)) && (
            <>
              <input 
                name="role_name" 
                value={form.role_name} 
                onChange={handleChange}
                placeholder="Role Name"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            </>
          )}

          {mode === "find" && (
            <div className="text-center p-4 mb-3 bg-yellow-900/20 border border-yellow-600/30 rounded-xl">
              <p className="text-yellow-300">Click Submit to view all roles</p>
            </div>
          )}

          {mode === "delete" && (
            <input 
              name="id" 
              value={form.id} 
              onChange={handleChange}
              placeholder="Role ID"
              className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              disabled={loading}
            />
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)] disabled:opacity-50"
            >
              {loading ? "Please wait..." : 
                mode === "edit" && !editLoaded ? "Load" : 
                mode === "edit" && editLoaded ? "Update" :
                mode === "delete" ? "Delete" : 
                mode === "find" ? "View All" : "Submit"}
            </button>

            <button
              onClick={resetAll}
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

        </div>
        </div>
      )}

      {showResults && roles.length > 0 && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10 backdrop-blur-md">

          <h2 className="text-xl font-bold mb-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            🔍 Roles List ({roles.length})
          </h2>

          <div className="space-y-4">
            {roles.map((r) => (
              <div key={r.role_id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-600/30 
                  bg-black/60 hover:bg-black/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-black flex items-center justify-center font-bold text-lg shadow-[0_0_8px_rgba(255,215,0,0.4)]">
                    <FaUserTag />
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-white">{r.role_name}</p>
                    <p className="text-sm text-yellow-300">Role ID: {r.role_id}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-yellow-400 block mb-1">
                    {r.status === 1 ? 'Active' : 'Inactive'}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        r.role_name === "Admin"
                          ? "bg-red-500/20 text-red-400"
                          : r.role_name === "Owner"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }
                    `}
                  >
                    {r.role_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ThemeLayout>
  );
};

export default Role;