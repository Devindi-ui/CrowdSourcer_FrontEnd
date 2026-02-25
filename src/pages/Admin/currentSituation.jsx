import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";
import { currentSituationAPI, busAPI, routeStopAPI } from "../../services/api";
import ThemeLayout from "../../components/Layout/ThemeLayout";

const CurrentSituation = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    cr_id: "",
    bus_id: "",
    bus_number: "",
    user_id: "",
    route_id: "",
    route_name: "",
    current_stop: "",
    avg_passengers: ""
  });

  const [searchType, setSearchType] = useState("id");
  const [results, setResults] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const busRes = await busAPI.getAllBuses();
      console.log("Buses response:", busRes);
      setBuses(busRes?.data?.data || []);
    } catch (error) {
      console.error("Failed to load initial data", error);
    }
  };

  const loadStopsByRoute = async (route_id) => {
    try {
      console.log("Loading stops for route:", route_id);

      if (!route_id) {
        setStops([]);
        return;
      }

      const res = await routeStopAPI.getByRouteId(route_id);
      console.log("Stops response:", res);

      const stopsData = res?.data?.data || [];
      setStops(stopsData);

    } catch (error) {
      console.error("Stop load failed:", error);
      setStops([]);
    }
  };

  const handleBusNumberChange = async (e) => {
    const selectedBusNumber = e.target.value;

    const selectedBus = buses.find(
      (bus) => bus.bus_number === selectedBusNumber
    );

    console.log("Selected Bus:", selectedBus);

    if (selectedBus) {
      setForm({
        ...form,
        bus_number: selectedBus.bus_number,
        bus_id: selectedBus.bus_id,
        route_id: selectedBus.route_id,
        route_name: selectedBus.route_name || "",
        current_stop: ""
      });

      if (selectedBus.route_id) {
        await loadStopsByRoute(selectedBus.route_id);
      } else {
        setStops([]);
      }
    } else {
      setForm({
        ...form,
        bus_number: selectedBusNumber,
        bus_id: "",
        route_id: "",
        route_name: "",
        current_stop: ""
      });
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
    setForm({
      cr_id: "",
      bus_id: "",
      bus_number: "",
      user_id: "",
      route_id: "",
      route_name: "",
      current_stop: "",
      avg_passengers: ""
    });
  };

  const addCurrentSituation = async () => {
    if (!form.bus_id || !form.user_id || !form.current_stop || !form.avg_passengers) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await currentSituationAPI.create({
        bus_id: form.bus_id,
        user_id: form.user_id,
        route_id: form.route_id,
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
      
      // Refresh the list if we're in "all" mode
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

            {/* Show CR ID input for delete mode only */}
            {mode === "delete" && (
              <input
                value={form.cr_id}
                onChange={(e) => setForm({ ...form, cr_id: e.target.value })}
                placeholder="Enter CR ID"
                className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                disabled={loading}
              />
            )}

            {/* Find mode with dropdown for ID/All */}
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

                <select
                  value={form.bus_number}
                  onChange={handleBusNumberChange}
                  className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                  disabled={loading}
                >
                  <option value="">Select Bus Number</option>
                  {buses.map(bus => (
                    <option key={bus.bus_id} value={bus.bus_number}>
                      {bus.bus_number} - {bus.route_name || 'No Route'}
                    </option>
                  ))}
                </select>

                <input
                  value={form.route_name}
                  readOnly
                  placeholder="Route (Auto-filled)"
                  className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                />

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