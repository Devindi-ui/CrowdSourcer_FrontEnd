import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaChevronLeft
} from "react-icons/fa";

import {
  busAssignmentAPI,
  busAPI,
  routeAPI,
  userAPI
} from "../../services/api";

import ThemeLayout from "../../components/common/Layout/ThemeLayout";

const BusAssignment = () => {

  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    bus_no: "",          
    user_id: "",
    route_no: "",       
    assigned_place: "",
    assigned_date: "",
    assigned_time: "",
    status: 1
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const [error, setError] = useState("");

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const busRes = await busAPI.getAllBuses();
        const routeRes = await routeAPI.getAllRoutes();
        const userRes = await userAPI.getAllUsers();

        setBuses(busRes.data?.data || []);
        setRoutes(routeRes.data?.data || []);
        setUsers(userRes.data?.data || []);

      } catch (err) {
        console.log("Failed loading FK data", err);
      }
    };
    loadData();
  }, []);

  const resetAll = () => {
    setMode(null);
    setAssignments([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);
    setError("");

    setForm({
      id: "",
      bus_no: "",
      user_id: "",
      route_no: "",
      assigned_place: "",
      assigned_date: "",
      assigned_time: "",
      status: 1
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createAssignment = async () => {
    // Validation
    if (!form.bus_no || !form.user_id || !form.route_no || !form.assigned_place || !form.assigned_date || !form.assigned_time) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await busAssignmentAPI.createAssignment(form);
      alert("✅ Assignment created");
      resetAll();
    } catch (err) {
      console.error("Create failed:", err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || "Create failed";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const findAssignment = async () => {
    try {
      setLoading(true);
      setAssignments([]);
      setShowResults(false);
      setError("");

      if (searchType === "id") {
        if (!form.id) {
          alert("Enter Assignment ID");
          setLoading(false);
          return;
        }
        const res = await busAssignmentAPI.getAssignmentById(form.id);
        if (res.data?.success && res.data?.data) {
          setAssignments([res.data.data]);
          setShowResults(true);
        } else {
          alert("Assignment not found");
        }
      }

      if (searchType === "all") {
        const res = await busAssignmentAPI.getAllAssignments();
        if (res.data?.success && res.data?.data) {
          setAssignments(res.data.data);
          setShowResults(true);
        } else {
          setAssignments(res.data?.data || []);
          setShowResults(true);
        }
      }

      if (searchType === "text") {
        if (!searchText.trim()) {
          alert("Enter search text");
          setLoading(false);
          return;
        }
        const res = await busAssignmentAPI.getAssignmentByText(searchText);
        if (res.data?.success && res.data?.data) {
          setAssignments(res.data.data);
          setShowResults(true);
        } else {
          setAssignments(res.data?.data || []);
          setShowResults(true);
        }
      }

    } catch (err) {
      console.error("Find failed:", err);
      setError("Assignment not found");
      alert("❌ Not found");
    } finally {
      setLoading(false);
    }
  };

  const loadForEdit = async () => {
    if (!form.id) {
      alert("Enter Assignment ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await busAssignmentAPI.getAssignmentById(form.id);
      
      if (res.data?.success && res.data?.data) {
        const a = res.data.data;

        setForm({
          id: a.assignment_id,
          bus_no: a.bus_number,        
          user_id: a.user_id,
          route_no: a.route_no,        
          assigned_place: a.assigned_place,
          assigned_date: a.assigned_date?.split("T")[0],
          assigned_time: a.assigned_time,
          status: a.status
        });

        setAssignments([a]);
        setShowResults(true);
        setEditLoaded(true);
      } else {
        alert("Assignment not found");
      }

    } catch (err) {
      console.error("Load failed:", err);
      setError("Assignment not found");
      alert("❌ Assignment not found");
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      await busAssignmentAPI.updateAssignment(form.id, form);
      alert("✅ Updated");
      
      const res = await busAssignmentAPI.getAssignmentById(form.id);
      if (res.data?.success && res.data?.data) {
        setAssignments([res.data.data]);
        setShowResults(true);
      }
    } catch (err) {
      console.error("Update failed:", err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || "Update failed";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async () => {
    if (!form.id) {
      alert("Enter Assignment ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await busAssignmentAPI.deleteAssignment(form.id);
      alert("✅ Deleted");
      
      if (searchType === "all") {
        const res = await busAssignmentAPI.getAllAssignments();
        setAssignments(res.data?.data || []);
        setShowResults(true);
      } else {
        setAssignments([]);
        setShowResults(false);
      }
      
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
    if (mode === "add") createAssignment();
    else if (mode === "find") findAssignment();
    else if (mode === "edit" && !editLoaded) loadForEdit();
    else if (mode === "edit" && editLoaded) updateAssignment();
    else if (mode === "delete") deleteAssignment();
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
        onClick={() => mode ? resetAll() : navigate("/admin")}
        className="mx-2 fixed top-6 z-50 flex items-center gap-2 mt-15
              bg-black/60 backdrop-blur-md border border-yellow-600
              text-yellow-400 px-4 py-2 rounded-full 
              shadow-[0_0_20px_rgba(255,215,0,0.25)]
              hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaChevronLeft />
      </button>

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 [&>button]:w-72">
          <ActionBtn icon={<FaPlus />} text="Add Assignment" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Assignment" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Assignment" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Assignment" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center mt-30">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] p-6 backdrop-blur-md">

            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">
              {mode} Assignment
            </h2>

            {mode === "edit" && !editLoaded && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Enter Assignment ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <select name="bus_no" value={form.bus_no} onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}>
                  <option value="">Select Bus Number</option>
                  {buses.map(b => (
                    <option key={b.bus_id} value={b.bus_number}>{b.bus_number}</option>
                  ))}
                </select>

                <select name="user_id" value={form.user_id} onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}>
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name}</option>
                  ))}
                </select>

                <select name="route_no" value={form.route_no} onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}>
                  <option value="">Select Route Number</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_no}>
                      {r.route_no} - {r.route_name}
                    </option>
                  ))}
                </select>

                <input name="assigned_place" value={form.assigned_place} onChange={handleChange}
                  placeholder="Assigned Place"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}/>

                <input type="date" name="assigned_date" value={form.assigned_date}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}/>

                <input type="time" name="assigned_time" value={form.assigned_time}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}/>
              </>
            )}

            {mode === "find" && (
              <>
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}>
                  <option value="id">Find by ID</option>
                  <option value="all">Get All</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input name="id" value={form.id} onChange={handleChange}
                    placeholder="Assignment ID"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}/>
                )}

                {searchType === "text" && (
                  <input value={searchText} onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by bus number, route, place..."
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}/>
                )}
              </>
            )}

            {mode === "delete" && (
              <input name="id" value={form.id} onChange={handleChange}
                placeholder="Assignment ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}/>
            )}

            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)] disabled:opacity-50">
                {loading ? "Please wait..." : 
                  mode === "edit" && !editLoaded ? "Load" : 
                  mode === "edit" && editLoaded ? "Update" :
                  mode === "delete" ? "Delete" : "Submit"}
              </button>

              <button onClick={resetAll} disabled={loading}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showResults && assignments.length > 0 && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">
            🔍 Results ({assignments.length})
          </h2>

          <div className="space-y-4">
            {assignments.map(a => (
              <div key={a.assignment_id}
                className="flex justify-between p-4 rounded-xl border border-yellow-600/30 bg-black/60 hover:bg-black/50 transition-all duration-200">
                <div>
                  <p className="font-semibold text-white">
                    Bus {a.bus_number} → Route {a.route_no} ({a.route_name})
                  </p>
                  <p className="text-yellow-300">User: {a.user_name || a.user_id}</p>
                  <p className="text-yellow-300">Place: {a.assigned_place}</p>
                  <p className="text-yellow-300">
                    Date: {a.assigned_date
                      ? new Date(a.assigned_date).toISOString().split("T")[0]
                      : ""}
                  </p>
                  <p className="text-yellow-300">Time: {a.assigned_time}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-yellow-400 block">
                    AID-{a.assignment_id}
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

const ActionBtn = ({ icon, text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-2 flex items-center gap-3 p-5 bg-black/70 border border-yellow-600/40 rounded-3xl 
    shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:bg-black/50 hover:scale-105 transition text-white"
  >
    <span className="text-yellow-400 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

export default BusAssignment;