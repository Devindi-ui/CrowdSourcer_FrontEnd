import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";

import {
  busAssignmentAPI,
  busAPI,
  routeAPI,
  userAPI
} from "../../services/api";

const BusAssignment = () => {

  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    bus_id: "",
    user_id: "",
    route_id: "",
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

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [users, setUsers] = useState([]);

  /* LOAD FK DATA */
  useEffect(() => {
    const loadData = async () => {
      try {
        const busRes = await busAPI.getAllBuses();
        const routeRes = await routeAPI.getAllRoutes();
        const userRes = await userAPI.getAllUsers();

        setBuses(busRes.data.data);
        setRoutes(routeRes.data.data);
        setUsers(userRes.data.data);

      } catch {
        console.log("Failed loading FK data");
      }
    };
    loadData();
  }, []);

  /* RESET */
  const resetAll = () => {
    setMode(null);
    setAssignments([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);

    setForm({
      id: "",
      bus_id: "",
      user_id: "",
      route_id: "",
      assigned_place: "",
      assigned_date: "",
      assigned_time: "",
      status: 1
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* CREATE */
  const createAssignment = async () => {
    try {
      setLoading(true);
      await busAssignmentAPI.createAssignment(form);
      alert("✅ Assignment created");
      resetAll();
    } catch {
      alert("❌ Create failed");
    } finally {
      setLoading(false);
    }
  };

  /* FIND */
  const findAssignment = async () => {
    try {
      setLoading(true);
      setAssignments([]);
      setShowResults(false);

      if (searchType === "id") {
        if (!form.id) return alert("Enter Assignment ID");
        const res = await busAssignmentAPI.getAssignmentById(form.id);
        setAssignments([res.data.data]);
      }

      if (searchType === "all") {
        const res = await busAssignmentAPI.getAllAssignments();
        setAssignments(res.data.data);
      }

      if (searchType === "text") {
        if (!searchText.trim()) return alert("Enter search text");
        const res = await busAssignmentAPI.getAssignmentByText(searchText);
        setAssignments(res.data.data || []);
        setShowResults(true);
      }

      setShowResults(true);

    } catch {
      alert("❌ Not found");
    } finally {
      setLoading(false);
    }
  };

  /* LOAD FOR EDIT */
  const loadForEdit = async () => {
    if (!form.id) return alert("Enter Assignment ID");

    try {
      setLoading(true);
      const res = await busAssignmentAPI.getAssignmentById(form.id);
      const a = res.data.data;

      setForm({
        id: a.assignment_id,
        bus_id: a.bus_id,
        user_id: a.user_id,
        route_id: a.route_id,
        assigned_place: a.assigned_place,
        assigned_date: a.assigned_date?.split("T")[0],
        assigned_time: a.assigned_time,
        status: a.status
      });

      setAssignments([a]);
      setShowResults(true);
      setEditLoaded(true);

    } catch {
      alert("❌ Assignment not found");
    } finally {
      setLoading(false);
    }
  };

  /* UPDATE */
  const updateAssignment = async () => {
    try {
      setLoading(true);
      await busAssignmentAPI.updateAssignment(form.id, form);
      alert("✅ Updated");
      const res = await busAssignmentAPI.getAssignmentById(form.id);
      setAssignments([res.data.data]);
      setShowResults(true);
    } catch {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* DELETE */
  const deleteAssignment = async () => {
    try {
      setLoading(true);
      await busAssignmentAPI.deleteAssignment(form.id);
      alert("✅ Deleted");
      const res = await busAssignmentAPI.getAllAssignments();
      setAssignments(res.data.data);
      setShowResults(true);
    } catch {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") createAssignment();
    if (mode === "find") findAssignment();
    if (mode === "edit" && !editLoaded) loadForEdit();
    else if (mode === "edit") updateAssignment();
    if (mode === "delete") deleteAssignment();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1f3a] to-[#1e3a8a] p-6 text-gray-100">

      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => mode ? setMode(null) : navigate("/admin")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
        bg-[#0b1f3a]/80 backdrop-blur-md text-white px-4 py-2 rounded-full 
        shadow-lg border border-blue-500 hover:bg-blue-600 hover:scale-105 transition"
      >
        <FaArrowLeft className="text-blue-400"/>
        <span className="font-semibold text-sm">Back</span>
      </button>

      <h1 className="text-3xl font-bold text-blue-300 mb-8 tracking-wide">
        Bus Assignment Management
      </h1>

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
          <div className="max-w-xl w-full bg-[#0b1f3a] border border-blue-700 rounded-2xl shadow-2xl p-6">

            <h2 className="text-xl font-bold mb-4 capitalize text-blue-300">
              {mode} Assignment
            </h2>

            {mode === "edit" && !editLoaded && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Enter Assignment ID"
                className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none"
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <select name="bus_id" value={form.bus_id} onChange={handleChange}
                  className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none">
                  <option value="">Select Bus</option>
                  {buses.map(b => (
                    <option key={b.bus_id} value={b.bus_id}>{b.bus_number}</option>
                  ))}
                </select>

                <select name="user_id" value={form.user_id} onChange={handleChange}
                  className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none">
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name}</option>
                  ))}
                </select>

                <select name="route_id" value={form.route_id} onChange={handleChange}
                  className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none">
                  <option value="">Select Route</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_id}>{r.route_name}</option>
                  ))}
                </select>

                <input name="assigned_place" value={form.assigned_place} onChange={handleChange}
                  placeholder="Assigned Place"
                  className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none"/>

                <input type="date" name="assigned_date" value={form.assigned_date}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none"/>

                <input type="time" name="assigned_time" value={form.assigned_time}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none"/>
              </>
            )}

            {mode === "find" && (
              <>
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none">
                  <option value="id">Find by ID</option>
                  <option value="all">Get All</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input name="id" value={form.id} onChange={handleChange}
                    placeholder="Assignment ID"
                    className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none"/>
                )}

                {searchType === "text" && (
                  <input value={searchText} onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search..."
                    className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none"/>
                )}
              </>
            )}

            {mode === "delete" && (
              <input name="id" value={form.id} onChange={handleChange}
                placeholder="Assignment ID"
                className="w-full p-3 mb-3 bg-[#132c52] border border-blue-600 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none"/>
            )}

            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition">
                {loading ? "Please wait..." : "Submit"}
              </button>

              <button onClick={resetAll}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showResults && assignments.length > 0 && (
        <div className="bg-[#0b1f3a] border border-blue-700 rounded-2xl shadow-xl p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-blue-300">
            🔍 Results
          </h2>

          <div className="space-y-4">
            {assignments.map(a => (
              <div key={a.assignment_id}
                className="flex justify-between p-4 rounded-xl border border-blue-700 bg-[#132c52] hover:bg-[#1e3a8a] transition-all duration-200">
                <div>
                  <p className="font-semibold text-white">
                    {a.bus_number} → {a.route_name}
                  </p>
                  <p className="text-blue-200">User ID: {a.user_id}</p>
                  <p className="text-blue-200">Place: {a.assigned_place}</p>
                  <p className="text-blue-200">
                    Date: {a.assigned_date
                      ? new Date(a.assigned_date).toISOString().split("T")[0]
                      : ""}
                  </p>
                  <p className="text-blue-200">Time: {a.assigned_time}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-blue-300 block">
                    AID-{a.assignment_id}
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
    className="mt-2 flex items-center gap-3 p-5 bg-[#0b1f3a] border border-blue-700 rounded-3xl 
    shadow-lg hover:bg-blue-700 hover:scale-105 transition text-white"
  >
    <span className="text-blue-400 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

export default BusAssignment;
