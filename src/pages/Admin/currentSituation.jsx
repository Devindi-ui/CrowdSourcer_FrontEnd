import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";
import { currentSituationAPI, busAPI, routeAPI, routeStopAPI } from "../../services/api";
import ThemeLayout from "../../components/common/Layout/ThemeLayout";

const CurrentSituation = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    cr_id: "",
    bus_no: "",
    route_no: "",
    user_id: "",
    current_stop: "",
    avg_passengers: ""
  });

  const [searchType, setSearchType] = useState("id");
  const [results, setResults] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  // For dynamic loading
  const [availableBuses, setAvailableBuses] = useState([]);
  const [selectedRouteName, setSelectedRouteName] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const busRes = await busAPI.getAllBuses();
      console.log("Buses response:", busRes);
      setBuses(busRes?.data?.data || []);
      
      const routeRes = await routeAPI.getAllRoutes();
      console.log("Routes response:", routeRes);
      setRoutes(routeRes?.data?.data || []);
    } catch (error) {
      console.error("Failed to load initial data", error);
    }
  };

  // Load buses when route is selected
  useEffect(() => {
    const loadBusesForRoute = async () => {
      if (form.route_no) {
        try {
          // Filter buses that have this route_no
          const route = routes.find(r => r.route_no === form.route_no);
          if (route) {
            const routeBuses = buses.filter(bus => bus.route_id === route.route_id);
            setAvailableBuses(routeBuses);
            setSelectedRouteName(route.route_name || "");
          } else {
            setAvailableBuses([]);
            setSelectedRouteName("");
          }
          // Reset bus and stops when route changes
          setForm(prev => ({ ...prev, bus_no: "", current_stop: "" }));
          setStops([]);
        } catch (error) {
          console.error("Failed to load buses for route:", error);
        }
      } else {
        setAvailableBuses([]);
        setSelectedRouteName("");
        setForm(prev => ({ ...prev, bus_no: "", current_stop: "" }));
        setStops([]);
      }
    };
    loadBusesForRoute();
  }, [form.route_no, routes, buses]);

  // Load stops using route number
  const loadStopsByRouteNo = async (routeNo) => {
    try {
      console.log("Loading stops for route number:", routeNo);

      if (!routeNo) {
        setStops([]);
        return;
      }

      // Use getByRouteNo instead of getByRouteId
      const res = await routeStopAPI.getByRouteNo(routeNo);
      console.log("Stops response:", res);

      const stopsData = res?.data?.data || [];
      setStops(stopsData);

    } catch (error) {
      console.error("Stop load failed:", error);
      setStops([]);
    }
  };

  // Handle bus selection
  const handleBusChange = async (e) => {
    const selectedBusNo = e.target.value;
    
    setForm({
      ...form,
      bus_no: selectedBusNo,
      current_stop: "" // Reset stop when bus changes
    });

    if (form.route_no) {
      await loadStopsByRouteNo(form.route_no);
    } else {
      setStops([]);
    }
  };

  const resetAll = () => {
    setMode(null);
    setStops([]);
    setResults([]);
    setShowResults(false);
    setSearchType("id");
    setError("");
    setAvailableBuses([]);
    setSelectedRouteName("");
    setForm({
      cr_id: "",
      bus_no: "",
      route_no: "",
      user_id: "",
      current_stop: "",
      avg_passengers: ""
    });
  };

  const addCurrentSituation = async () => {
    if (!form.route_no || !form.bus_no || !form.user_id || !form.current_stop || !form.avg_passengers) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await currentSituationAPI.create({
        bus_no: form.bus_no,
        route_no: form.route_no,
        user_id: form.user_id,
        current_stop: form.current_stop,
        avg_passengers: parseInt(form.avg_passengers)
      });

      alert("Current Situation added successfully");
      resetAll();
    } catch (error) {
      console.error("Add Failed: ", error);     
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to add";
      setError(errorMsg);
      alert("Failed to add: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const findCurrentSituation = async () => {
    try {
      setLoading(true);
      setResults([]);
      setShowResults(false);
      setError("");

      if (searchType === "id") {
        if (!form.cr_id) {
          alert("Enter CR ID");
          setLoading(false);
          return;
        }
        
        console.log("Finding by ID:", form.cr_id);
        const res = await currentSituationAPI.getById(form.cr_id);
        console.log("Get by ID response:", res);
        
        const record = res?.data?.data;
        if (record) {
          setResults([record]);
          setShowResults(true);
        } else {
          alert("No record found with this ID");
        }
      }

      if (searchType === "all") {
        console.log("Getting all records");
        const res = await currentSituationAPI.getAll();
        console.log("Get all response:", res);
        
        const data = res?.data?.data || [];
        
        if (data.length > 0) {
          setResults(data);
          setShowResults(true);
        } else {
          alert("No records found");
        }
      }
      
    } catch (error) {
      console.error("Find failed:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Failed to find record";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert("❌ " + errorMessage);
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const deleteCurrentSituation = async () => {
    if (!form.cr_id) {
      alert("Enter CR ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await currentSituationAPI.delete(form.cr_id);
      alert("Deleted successfully");
      
      setForm({ ...form, cr_id: "" });
      
      if (searchType === "all") {
        const res = await currentSituationAPI.getAll();
        setResults(res?.data?.data || []);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setError("Delete failed");
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addCurrentSituation();
    else if (mode === "find") findCurrentSituation();
    else if (mode === "delete") deleteCurrentSituation();
  };

  return (
    <ThemeLayout pageTitle="Current Situation Management">

      <button
        type="button"
        onClick={() => {
          if (mode) resetAll();
          else navigate("/admin");
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
          bg-black/60 backdrop-blur-md border border-yellow-600
          text-yellow-400 px-4 py-2 rounded-full
          shadow hover:bg-yellow-500 hover:text-black transition"
      >
        <FaArrowLeft />
        <span className="font-semibold text-sm">Back</span>
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-20 max-w-xl mx-auto bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl">
          Error: {error}
        </div>
      )}

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlusCircle />} text="Add Current Situation" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Current Situation" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaTrash />} text="Delete Current Situation" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center mt-20">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl p-6">

            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">
              {mode} Current Situation
            </h2>

            {mode === "delete" && (
              <input
                value={form.cr_id}
                onChange={(e) => setForm({ ...form, cr_id: e.target.value })}
                placeholder="Enter CR ID"
                className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                disabled={loading}
              />
            )}

            {/* Find mode*/}
            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                  disabled={loading}
                >
                  <option value="id">Find by ID</option>
                  <option value="all">Get All Records</option>
                </select>

                {searchType === "id" && (
                  <input
                    value={form.cr_id}
                    onChange={(e) => setForm({ ...form, cr_id: e.target.value })}
                    placeholder="Enter CR ID"
                    className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                    disabled={loading}
                  />
                )}
              </>
            )}

            {/* Add mode form */}
            {mode === "add" && (
              <>
                <input
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  placeholder="User ID"
                  className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                  disabled={loading}
                />

                {/* Route Number Selection */}
                <select
                  name="route_no"
                  value={form.route_no}
                  onChange={(e) => {
                    setForm({ ...form, route_no: e.target.value, bus_no: "", current_stop: "" });
                    setStops([]);
                  }}
                  className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                  disabled={loading}
                >
                  <option value="">Select Route Number</option>
                  {routes.map(route => (
                    <option key={route.route_id} value={route.route_no}>
                      {route.route_no} - {route.route_name}
                    </option>
                  ))}
                </select>

                {/* Bus Number Selection (filtered by route) */}
                {form.route_no && (
                  <select
                    name="bus_no"
                    value={form.bus_no}
                    onChange={handleBusChange}
                    className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                    disabled={loading || availableBuses.length === 0}
                  >
                    <option value="">Select Bus Number</option>
                    {availableBuses.map(bus => (
                      <option key={bus.bus_id} value={bus.bus_number}>
                        {bus.bus_number}
                      </option>
                    ))}
                  </select>
                )}

                {/* Route Name Display */}
                <input
                  value={selectedRouteName}
                  readOnly
                  placeholder="Route Name (Auto-filled)"
                  className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                />

                {/* Current Stop Selection */}
                {form.route_no && (
                  <select
                    value={form.current_stop}
                    onChange={(e) => setForm({ ...form, current_stop: e.target.value })}
                    className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                    disabled={loading || stops.length === 0}
                  >
                    <option value="">Select Stop</option>
                    {stops.map(s => (
                      <option key={s.stop_order_id} value={s.stop_name}>
                        {s.stop_name}
                      </option>
                    ))}
                  </select>
                )}

                <input
                  type="number"
                  value={form.avg_passengers}
                  onChange={(e) => setForm({ ...form, avg_passengers: e.target.value })}
                  placeholder="Average Passengers"
                  className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                  disabled={loading}
                  min="0"
                />
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {loading ? "Please wait..." : 
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

      {showResults && results.length > 0 && (
        <div className="max-w-4xl mx-auto bg-black/70 border border-yellow-600/40 rounded-2xl p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">Results ({results.length})</h2>

          <div className="space-y-4">
            {results.map(r => (
              <div key={r.cr_id} className="p-4 rounded-xl border border-yellow-600/30 bg-black/60">
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-white"><span className="text-yellow-400">CR ID:</span> {r.cr_id}</p>
                  <p className="text-white"><span className="text-yellow-400">Bus:</span> {r.bus_number}</p>
                  <p className="text-white"><span className="text-yellow-400">Route No:</span> {r.route_no}</p>
                  <p className="text-white"><span className="text-yellow-400">Route:</span> {r.route_name}</p>
                  <p className="text-white"><span className="text-yellow-400">Stop:</span> {r.current_stop}</p>
                  <p className="text-white"><span className="text-yellow-400">Passengers:</span> {r.avg_passengers}</p>
                  <p className="text-white"><span className="text-yellow-400">User ID:</span> {r.user_id}</p>
                </div>
                {(r.created_at || r.updated_at) && (
                  <p className="text-yellow-400 text-xs mt-2">
                    {r.created_at && `Created: ${new Date(r.created_at).toLocaleString()}`}
                    {r.updated_at && ` | Updated: ${new Date(r.updated_at).toLocaleString()}`}
                  </p>
                )}
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
    className="mt-2 flex items-center gap-3 p-5 bg-black/70 border border-yellow-600 rounded-3xl shadow hover:scale-105 transition text-white w-full"
  >
    <span className="text-yellow-400 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

export default CurrentSituation;