import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import { routeAPI, routeStopAPI } from "../../services/api";
import ThemeLayout from "../../components/Layout/ThemeLayout";

const RouteStop = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    route_id: "",
    route_name: "",
    stop_name: ""
  });

  const [searchType, setSearchType] = useState("routeId");
  const [searchText, setSearchText] = useState("");
  const [routes, setRoutes] = useState([]);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // For add mode - multiple stops
  const [localStops, setLocalStops] = useState([]);
  
  // For update mode
  const [editLoaded, setEditLoaded] = useState(false);
  const [editStops, setEditStops] = useState([]);
  const [routeName, setRouteName] = useState("");

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const res = await routeAPI.getAllRoutes();
      setRoutes(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to load routes", error);
    }
  };

  const resetAll = () => {
    setMode(null);
    setLocalStops([]);
    setEditStops([]);
    setEditLoaded(false);
    setRouteName("");
    setResults([]);
    setShowResults(false);
    setSearchText("");
    setSearchType("routeId");
    setError("");
    setForm({
      id: "",
      route_id: "",
      route_name: "",
      stop_name: ""
    });
  };

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ==================== ADD MULTIPLE STOPS ====================
  const addLocalStop = () => {
    if (!form.stop_name.trim()) {
      alert("Enter stop name");
      return;
    }
    setLocalStops([...localStops, form.stop_name.trim()]);
    setForm({ ...form, stop_name: "" });
  };

  const removeLocalStop = (index) => {
    const updated = localStops.filter((_, i) => i !== index);
    setLocalStops(updated);
  };

  const saveBulkStops = async () => {
    if (!form.route_id) {
      alert("Select a route");
      return;
    }
    if (localStops.length === 0) {
      alert("Add at least one stop");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await routeStopAPI.bulkCreate({
        route_id: form.route_id,
        stops: localStops
      });

      alert("Route stops added successfully");
      resetAll();
    } catch (error) {
      console.error("Add failed:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to add";
      setError(errorMsg);
      alert("Failed to add: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FIND STOPS ====================
  const findStops = async () => {
    try {
      setLoading(true);
      setResults([]);
      setShowResults(false);
      setError("");

      if (searchType === "routeId") {
        if (!form.route_id) {
          alert("Enter Route ID");
          setLoading(false);
          return;
        }

        console.log("Finding by Route ID:", form.route_id);
        
        // First get all stops
        const res = await routeStopAPI.getAllRouteStops();
        const allStops = res?.data?.data || [];
        
        // Filter by route_id
        const filtered = allStops.filter(
          stop => String(stop.route_id) === String(form.route_id)
        );

        if (filtered.length > 0) {
          setResults(filtered);
          setShowResults(true);
        } else {
          alert("No stops found for this route");
        }
      }

      if (searchType === "routeName") {
        if (!searchText.trim()) {
          alert("Enter Route Name");
          setLoading(false);
          return;
        }

        console.log("Finding by Route Name:", searchText);
        
        const res = await routeStopAPI.getAllRouteStops();
        const allStops = res?.data?.data || [];
        
        const filtered = allStops.filter(
          stop => stop.route_name && 
          stop.route_name.toLowerCase().includes(searchText.toLowerCase())
        );

        if (filtered.length > 0) {
          setResults(filtered);
          setShowResults(true);
        } else {
          alert("No stops found with this route name");
        }
      }

      if (searchType === "all") {
        console.log("Getting all stops");
        const res = await routeStopAPI.getAllRouteStops();
        const data = res?.data?.data || [];
        
        if (data.length > 0) {
          setResults(data);
          setShowResults(true);
        } else {
          alert("No stops found");
        }
      }

    } catch (error) {
      console.error("Find failed:", error);
      let errorMessage = "Failed to find stops";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setError(errorMessage);
      alert("❌ " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOAD FOR UPDATE ====================
  const loadRouteForEdit = async () => {
    if (!form.route_id) {
      alert("Enter Route ID");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await routeStopAPI.getAllRouteStops();
      const allStops = res?.data?.data || [];
      
      const filtered = allStops.filter(
        stop => String(stop.route_id) === String(form.route_id)
      );

      if (filtered.length === 0) {
        alert("No stops found for this route");
        return;
      }

      const sorted = filtered.sort((a, b) => a.stop_order - b.stop_order);
      
      setRouteName(sorted[0].route_name);
      setEditStops(sorted);
      setEditLoaded(true);
      
      setResults(sorted);
      setShowResults(true);

    } catch (error) {
      console.error("Load failed:", error);
      setError("Failed to load route");
      alert("Failed to load route");
    } finally {
      setLoading(false);
    }
  };

  // ==================== UPDATE HELPERS ====================
  const changeStopName = (index, value) => {
    const updated = [...editStops];
    updated[index].stop_name = value;
    setEditStops(updated);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...editStops];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setEditStops(updated);
  };

  const moveDown = (index) => {
    if (index === editStops.length - 1) return;
    const updated = [...editStops];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    setEditStops(updated);
  };

  // 🔴 FIXED: Add new stop with proper structure
  const addEditStop = () => {
    if (!form.stop_name.trim()) {
      alert("Enter stop name");
      return;
    }

    // Create new stop object - WITHOUT stop_order_id for new stops
    const newStop = {
      // Don't include stop_order_id for new stops - backend will create it
      route_id: form.route_id,
      route_name: routeName,
      stop_name: form.stop_name.trim(),
      // stop_order will be set by backend based on position
      status: 1
    };

    setEditStops([...editStops, newStop]);
    setForm({ ...form, stop_name: "" });
  };

  const removeEditStop = (index) => {
    if (!window.confirm("Remove this stop?")) return;
    const updated = editStops.filter((_, i) => i !== index);
    setEditStops(updated);
  };

  // 🔴 FIXED: Update now properly handles new stops
  const saveUpdatedRoute = async () => {
    try {
      setLoading(true);
      setError("");

      // Prepare stops with updated order
      const stopsToUpdate = editStops.map((stop, index) => ({
        // Only include stop_order_id if it exists (existing stops)
        ...(stop.stop_order_id && { stop_order_id: stop.stop_order_id }),
        stop_name: stop.stop_name,
        stop_order: index + 1
      }));

      console.log("Sending update:", { route_id: form.route_id, stops: stopsToUpdate });

      const response = await routeStopAPI.bulkUpdate({
        route_id: form.route_id,
        stops: stopsToUpdate
      });

      console.log("Update response:", response);

      alert("Route updated successfully");
      
      // Set results with the updated data from response
      if (response?.data?.data) {
        const updatedStops = response.data.data;
        const sorted = updatedStops.sort((a, b) => a.stop_order - b.stop_order);
        setResults(sorted);
        setEditStops(sorted);
        setShowResults(true);
      } else {
        // Fallback: reload the data
        const res = await routeStopAPI.getAllRouteStops();
        const allStops = res?.data?.data || [];
        const filtered = allStops.filter(
          stop => String(stop.route_id) === String(form.route_id)
        );
        const sorted = filtered.sort((a, b) => a.stop_order - b.stop_order);
        setResults(sorted);
        setEditStops(sorted);
        setShowResults(true);
      }

    } catch (error) {
      console.error("Update failed:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Update failed";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ==================== DELETE BY ROUTE ID ONLY ====================
  // 🔴 FIXED: Delete entire route (status=0) - no single stop deletion
  const deleteRoute = async () => {
    if (!form.route_id) {
      alert("Enter Route ID (e.g., 200,8)");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ALL stops for route ${form.route_id}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 🔴 Using the deleteByRoute endpoint
      const response = await routeStopAPI.deleteRouteStopsByRouteId(form.route_id);
      console.log("Delete response:", response);
      
      alert(`All stops for route ${form.route_id} deleted successfully`);
      
      setForm({ ...form, route_id: "" });
      setResults([]);
      setShowResults(false);
      
    } catch (error) {
      console.error("Delete by route failed:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Delete failed";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") saveBulkStops();
    else if (mode === "find") findStops();
    else if (mode === "update" && !editLoaded) loadRouteForEdit();
    else if (mode === "update" && editLoaded) saveUpdatedRoute();
    else if (mode === "delete") deleteRoute(); // 🔴 Only delete route now
  };

  // Group results by route for display
  const groupedResults = results.reduce((acc, stop) => {
    if (!acc[stop.route_id]) {
      acc[stop.route_id] = {
        route_id: stop.route_id,
        route_name: stop.route_name,
        stops: []
      };
    }
    acc[stop.route_id].stops.push({
      stop_order_id: stop.stop_order_id,
      stop_name: stop.stop_name,
      stop_order: stop.stop_order
    });
    return acc;
  }, {});

  return (
    <ThemeLayout pageTitle="Route Stop Management">
      {/* Back Button */}
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

      {/* Mode Selection */}
      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlusCircle />} text="Add Route Stops" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Route Stops" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Route Stops" onClick={() => setMode("update")} />
          <ActionBtn icon={<FaTrash />} text="Delete Route Stops" onClick={() => setMode("delete")} />
        </div>
      )}

      {/* Form Section */}
      {mode && (
        <div className="flex justify-center mt-20">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">
              {mode} Route Stop
            </h2>

            {/* ADD MODE */}
            {mode === "add" && (
              <>
                <select
                  name="route_id"
                  value={form.route_id}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                  disabled={loading}
                >
                  <option value="">Select Route</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.route_name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 mb-3">
                  <input
                    name="stop_name"
                    value={form.stop_name}
                    onChange={handleChange}
                    placeholder="Enter Stop Name"
                    className="flex-1 p-3 bg-black border border-yellow-600 rounded-xl text-white"
                    disabled={loading}
                  />
                  <button
                    onClick={addLocalStop}
                    disabled={loading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl font-semibold"
                  >
                    Add
                  </button>
                </div>

                {localStops.length > 0 && (
                  <div className="mb-3 max-h-40 overflow-y-auto">
                    {localStops.map((stop, i) => (
                      <div key={i} className="flex justify-between items-center text-white mb-2 p-2 bg-black/60 border border-yellow-600/30 rounded-xl">
                        <span>{i + 1}. {stop}</span>
                        <button onClick={() => removeLocalStop(i)} className="text-red-400 hover:text-red-300">
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* FIND MODE */}
            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                  disabled={loading}
                >
                  <option value="routeId">Find by Route ID</option>
                  <option value="routeName">Find by Route Name</option>
                  <option value="all">Get All Stops</option>
                </select>

                {searchType === "routeId" && (
                  <input
                    name="route_id"
                    value={form.route_id}
                    onChange={handleChange}
                    placeholder="Enter Route ID"
                    className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                    disabled={loading}
                  />
                )}

                {searchType === "routeName" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Enter Route Name"
                    className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                    disabled={loading}
                  />
                )}
              </>
            )}

            {/* UPDATE MODE - Load Route */}
            {mode === "update" && !editLoaded && (
              <>
                <input
                  name="route_id"
                  value={form.route_id}
                  onChange={handleChange}
                  placeholder="Enter Route ID"
                  className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                  disabled={loading}
                />
              </>
            )}

            {/* UPDATE MODE - Edit Stops */}
            {mode === "update" && editLoaded && (
              <>
                <div className="text-yellow-400 mb-4 font-semibold">
                  Route: {routeName} (ID: {form.route_id})
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    name="stop_name"
                    value={form.stop_name}
                    onChange={handleChange}
                    placeholder="Add New Stop"
                    className="flex-1 p-3 bg-black border border-yellow-600 rounded-xl text-white"
                    disabled={loading}
                  />
                  <button
                    onClick={addEditStop}
                    disabled={loading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto mb-3">
                  {editStops.map((stop, index) => (
                    <div
                      key={stop.stop_order_id}
                      className="flex items-center gap-2 mb-2 p-2 bg-black/60 border border-yellow-600/30 rounded-xl"
                    >
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="text-yellow-400 hover:text-yellow-300 disabled:opacity-30">
                        <FaArrowUp />
                      </button>
                      <button onClick={() => moveDown(index)} disabled={index === editStops.length - 1} className="text-yellow-400 hover:text-yellow-300 disabled:opacity-30">
                        <FaArrowDown />
                      </button>
                      <span className="text-yellow-400 w-8">{index + 1}.</span>
                      <input
                        value={stop.stop_name}
                        onChange={(e) => changeStopName(index, e.target.value)}
                        className="flex-1 bg-transparent text-white outline-none border-b border-yellow-600/30 focus:border-yellow-400"
                      />
                      <button onClick={() => removeEditStop(index)} className="text-red-400 hover:text-red-300">
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 🔴 NEW: DELETE MODE - Only route deletion */}
            {mode === "delete" && (
              <input
                name="route_id"
                value={form.route_id}
                onChange={handleChange}
                placeholder="Enter Route ID (e.g., 200,8)"
                className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                disabled={loading}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {loading ? "Please wait..." : 
                  mode === "update" && !editLoaded ? "Load Route" : 
                  mode === "update" && editLoaded ? "Save Changes" :
                  mode === "delete" ? "Delete Route" : "Submit"}
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

      {/* Results Display */}
      {showResults && Object.keys(groupedResults).length > 0 && (
        <div className="max-w-4xl mx-auto bg-black/70 border border-yellow-600/40 rounded-2xl p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">
            Results ({results.length} stops)
          </h2>

          {Object.values(groupedResults).map(route => (
            <div key={route.route_id} className="mb-6 last:mb-0">
              <h3 className="text-yellow-400 text-lg font-semibold mb-2">
                Route {route.route_id}: {route.route_name}
              </h3>
              <div className="bg-black/40 border border-yellow-600/20 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {route.stops
                    .sort((a, b) => a.stop_order - b.stop_order)
                    .map(stop => (
                      <div key={stop.stop_order_id} className="text-white">
                        <span className="text-yellow-400">{stop.stop_order}.</span> {stop.stop_name}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
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

export default RouteStop;