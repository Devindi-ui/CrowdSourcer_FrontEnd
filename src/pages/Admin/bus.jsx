// src/pages/Bus.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBus,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaArrowLeft
} from "react-icons/fa";
import { busAPI, routeAPI } from "../../services/api";
import ThemeLayout from "../../components/Layout/ThemeLayout";
import ActionBtn from "../../components/Layout/ActionBtn";

const Bus = () => {

  const navigate = useNavigate();

  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    bus_number: "",
    seat_capacity: "",
    route_no: "",        // 🔴 Changed from route_id to route_no
    status: "active"
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const [error, setError] = useState("");

  /* LOAD ROUTES */
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await routeAPI.getAllRoutes();
        setRoutes(res.data.data || []);
      } catch (err) {
        console.error("Failed to load routes");
      }
    };
    loadRoutes();
  }, []);

  /* HELPERS */

  const resetAll = () => {
    setMode(null);
    setBuses([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);
    setError("");
    setForm({
      id: "",
      bus_number: "",
      seat_capacity: "",
      route_no: "",
      status: "active"
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const populateFormFromBus = (b) => {
    setForm({
      id: b.bus_id,
      bus_number: b.bus_number,
      seat_capacity: b.seat_capacity,
      route_no: b.route_no || "",  // 🔴 Use route_no
      status: b.status
    });
    setEditLoaded(true);
  };

  /* API ACTIONS */

  const addBus = async () => {
    // Validation
    if (!form.bus_number || !form.seat_capacity || !form.route_no || !form.status) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await busAPI.createBus({
        bus_number: form.bus_number,
        seat_capacity: parseInt(form.seat_capacity),
        route_no: form.route_no,  // 🔴 Send route_no
        status: form.status
      });

      alert("✅ Bus added successfully");
      resetAll();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || "Failed to add bus";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const findBus = async () => {
    try {
      setLoading(true);
      setBuses([]);
      setShowResults(false);
      setError("");

      if (searchType === "id") {
        if (!form.id) {
          alert("Enter Bus ID");
          setLoading(false);
          return;
        }
        const res = await busAPI.getBusById(form.id);
        if (res.data?.success && res.data?.data) {
          setBuses([res.data.data]);
          setShowResults(true);
        } else {
          alert("Bus not found");
        }
      }

      if (searchType === "all") {
        const res = await busAPI.getAllBuses();
        if (res.data?.success && res.data?.data) {
          setBuses(res.data.data);
          setShowResults(true);
        } else {
          setBuses(res.data?.data || []);
          setShowResults(true);
        }
      }

      if (searchType === "route") {  // 🔴 NEW search by route number
        if (!form.route_no) {
          alert("Enter Route Number");
          setLoading(false);
          return;
        }
        const res = await busAPI.getBusesByRouteNo(form.route_no);
        if (res.data?.success && res.data?.data) {
          setBuses(res.data.data);
          setShowResults(true);
        } else {
          alert("No buses found for this route");
        }
      }

      if (searchType === "text") {
        if (!searchText.trim()) {
          alert("Enter text to search");
          setLoading(false);
          return;
        }
        
        const res = await busAPI.getBusByText(searchText);
        if (res.data?.success && res.data?.data) {
          setBuses(res.data.data);
          setShowResults(true);
        } else {
          setBuses(res.data?.data || []);
          setShowResults(true);
        }
      }

    } catch (err) {
      console.error("Find failed:", err);
      setError(err.message);
      alert("❌ Bus not found");
    } finally {
      setLoading(false);
    }
  };

  const loadBusForEdit = async () => {
    if (!form.id) {
      alert("Enter Bus ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await busAPI.getBusById(form.id);
      
      if (res.data?.success && res.data?.data) {
        populateFormFromBus(res.data.data);
        setBuses([res.data.data]);
        setShowResults(true);
      } else {
        alert("Bus not found");
      }
    } catch {
      setError("Bus not found");
      alert("❌ Bus not found");
    } finally {
      setLoading(false);
    }
  };

  const updateBus = async () => {
    try {
      setLoading(true);
      setError("");

      await busAPI.updateBus(form.id, {
        bus_number: form.bus_number,
        seat_capacity: parseInt(form.seat_capacity),
        route_no: form.route_no,  // 🔴 Send route_no
        status: form.status
      });

      alert("✅ Bus updated");

      const res = await busAPI.getBusById(form.id);
      if (res.data?.success && res.data?.data) {
        setBuses([res.data.data]);
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

  const deleteBus = async () => {
    if (!form.id) {
      alert("Enter Bus ID");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete bus ${form.bus_number || form.id}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await busAPI.deleteBus(form.id);
      alert("✅ Bus deleted");

      if (searchType === "all") {
        const res = await busAPI.getAllBuses();
        setBuses(res.data?.data || []);
        setShowResults(true);
      } else {
        setBuses([]);
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
    if (mode === "add") addBus();
    else if (mode === "find") findBus();
    else if (mode === "edit" && !editLoaded) loadBusForEdit();
    else if (mode === "edit" && editLoaded) updateBus();
    else if (mode === "delete") deleteBus();
  };

  return (
    <ThemeLayout pageTitle="Bus Management">
      {/* Error Display */}
      {error && (
        <div className="mt-20 max-w-xl mx-auto bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl">
          Error: {error}
        </div>
      )}

      <button
        onClick={() => mode ? resetAll() : navigate("/admin")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
        bg-black/60 backdrop-blur-md text-yellow-400 px-4 py-2 rounded-full 
        shadow-[0_0_20px_rgba(255,215,0,0.25)]
        hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaArrowLeft className="text-yellow-400" />
        <span className="font-semibold text-sm">Back</span>
      </button>

      {!mode && (
        <div className="mt-6 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlus />} text="Add Bus" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Bus" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Bus" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrashAlt />} text="Delete Bus" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center h-full mt-10 overflow-hidden">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] p-6 backdrop-blur-md">

            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">{mode} Bus</h2>

            {mode === "edit" && !editLoaded && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Enter Bus ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <input
                  name="bus_number"
                  value={form.bus_number}
                  onChange={handleChange}
                  placeholder="Bus Number"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}
                />

                <input
                  name="seat_capacity"
                  type="number"
                  value={form.seat_capacity}
                  onChange={handleChange}
                  placeholder="Seat Capacity"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}
                  min="0"
                />

                {/* 🔴 Changed from route_id to route_no */}
                <select
                  name="route_no"
                  value={form.route_no}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}
                >
                  <option value="">Select Route Number</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_no}>
                      {r.route_no} - {r.route_name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-6 mb-3 text-yellow-300">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={form.status === "active"}
                      onChange={handleChange}
                      className="accent-yellow-500"
                      disabled={loading}
                    />
                    Active
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={form.status === "inactive"}
                      onChange={handleChange}
                      className="accent-yellow-500"
                      disabled={loading}
                    />
                    Inactive
                  </label>
                </div>
              </>
            )}

            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}
                >
                  <option value="id">Find by ID</option>
                  <option value="all">Get All Buses</option>
                  <option value="route">Find by Route Number</option> {/* 🔴 NEW */}
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="Bus ID"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}

                {searchType === "route" && (  // 🔴 NEW
                  <input
                    name="route_no"
                    value={form.route_no}
                    onChange={handleChange}
                    placeholder="Route Number"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search bus number / route"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}
              </>
            )}

            {mode === "delete" && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Bus ID"
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
                  mode === "delete" ? "Delete" : "Submit"}
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

      {showResults && buses.length > 0 && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10 backdrop-blur-md">

          <h2 className="text-xl font-bold mb-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            🚌 Bus Results ({buses.length})
          </h2>

          <div className="space-y-4">
            {buses.map(b => (
              <div
                key={b.bus_id}
                className="flex justify-between items-center p-4 rounded-xl border border-yellow-600/30 bg-black/60 hover:bg-black/50 transition-all duration-200"
              >
                <div>
                  <p className="font-semibold text-lg text-white">{b.bus_number}</p>
                  <p className="text-sm text-yellow-300">Seats: {b.seat_capacity}</p>
                  <p className="text-sm text-yellow-300">
                    Route: {b.route_name} {b.route_no && `(${b.route_no})`}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-yellow-400 block mb-1">BID-{b.bus_id}</span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${b.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                      }`}
                  >
                    {b.status}
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

export default Bus;