import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaRoad,
  FaFlag,
  FaRuler,
  FaGlobeAsia
} from "react-icons/fa";
import ThemeLayout from "../../components/common/Layout/ThemeLayout";
import ActionBtn from "../../components/common/Layout/ActionBtn";
import { routeAPI } from "../../services/api";

const RoutePage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    route_no: "",       
    route_name: "",
    start_point: "",
    end_point: "",
    total_stops: "",
    distance: "",
    status: "1" 
  });

  const [searchType, setSearchType] = useState("route_no");
  const [searchText, setSearchText] = useState("");
  const [routes, setRoutes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const [error, setError] = useState("");

  const resetAll = () => {
    setMode(null);
    setRoutes([]);
    setSearchText("");
    setSearchType("route_no");
    setShowResults(false);
    setEditLoaded(false);
    setError("");
    setForm({
      route_no: "",
      route_name: "",
      start_point: "",
      end_point: "",
      total_stops: "",
      distance: "",
      status: "1"
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleStatusChange = (value) => {
    setForm({ ...form, status: value });
  };

  const formatDistance = (distance) => {
    if (!distance) return "0.0 Km";
    const num = parseFloat(distance);
    return isNaN(num) ? distance : num.toFixed(1) + " Km";
  };

  const addRoute = async () => {
    // Validation
    if (!form.route_no || !form.route_name || !form.start_point || !form.end_point || !form.total_stops || !form.distance) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const requestData = {
        route_no: form.route_no,
        route_name: form.route_name,
        start_point: form.start_point,
        end_point: form.end_point,
        total_stops: parseInt(form.total_stops),
        distance: parseFloat(form.distance),
        status: parseInt(form.status),
        status_d: 1
      };

      console.log("Sending data:", requestData);

      const response = await routeAPI.createRoute(requestData);

      if (response.data?.success) {
        alert("✅ Route added successfully");
        resetAll();
      } else {
        throw new Error(response.data?.msg || "Failed to add");
      }

    } catch (error) {
      console.error("Add Failed:", error);
      setError(error.message);
      alert("❌ Failed to add route: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const findRoutes = async () => {
    try {
      setLoading(true);
      setRoutes([]);
      setShowResults(false);
      setError("");

      if (searchType === "route_no") {
        if (!form.route_no) {
          alert("Enter Route Number");
          setLoading(false);
          return;
        }

        console.log("Finding by Route Number:", form.route_no);
        
        const response = await routeAPI.getRouteByNumber(form.route_no);
        
        if (response.data?.success && response.data?.data) {
          setRoutes([response.data.data]);
          setShowResults(true);
        } else {
          alert("No route found with this Route Number");
        }
      }

      if (searchType === "all") {
        console.log("Getting all routes");
        const response = await routeAPI.getAllRoutes();
        
        if (response.data?.success && response.data?.data) {
          if (response.data.data.length > 0) {
            setRoutes(response.data.data);
            setShowResults(true);
          } else {
            alert("No routes found");
          }
        } else {
          setRoutes(response.data?.data || []);
          setShowResults(true);
        }
      }

      if (searchType === "text") {
        if (!searchText.trim()) {
          alert("Enter text to search");
          setLoading(false);
          return;
        }

        console.log("Searching by text:", searchText);
        const response = await routeAPI.getRouteByText(searchText);
        
        if (response.data?.success && response.data?.data) {
          if (response.data.data.length > 0) {
            setRoutes(response.data.data);
            setShowResults(true);
          } else {
            alert("No routes found matching your search");
          }
        } else {
          setRoutes(response.data?.data || []);
          setShowResults(true);
        }
      }

    } catch (error) {
      console.error("Find failed:", error);
      setError(error.message);
      alert("❌ Failed to find routes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRouteForEdit = async () => {
    if (!form.route_no) {
      alert("Enter Route Number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Use the new API method
      const response = await routeAPI.getRouteByNumber(form.route_no);

      if (response.data?.success && response.data?.data) {
        const route = response.data.data;
        
        // Convert status number to string for the radio buttons
        const statusValue = route.status !== undefined ? route.status.toString() : "1";
        
        setForm({
          route_no: route.route_no,
          route_name: route.route_name,
          start_point: route.start_point,
          end_point: route.end_point,
          total_stops: route.total_stops,
          distance: route.distance,
          status: statusValue
        });
        
        setEditLoaded(true);
        setRoutes([route]);
        setShowResults(true);
      } else {
        alert("Route not found");
      }

    } catch (error) {
      console.error("Load failed:", error);
      setError("Route not found");
      alert("❌ Route Not Found");
    } finally {
      setLoading(false);
    }
  };

  const updateRoute = async () => {
    try {
      setLoading(true);
      setError("");

      const requestData = {
        route_name: form.route_name,
        start_point: form.start_point,
        end_point: form.end_point,
        total_stops: parseInt(form.total_stops),
        distance: parseFloat(form.distance),
        status: parseInt(form.status)
      };

      console.log("Updating route:", form.route_no, "Data:", requestData);

      const response = await routeAPI.updateRouteByNumber(form.route_no, requestData);

      if (response.data?.success) {
        alert("✅ Route updated successfully");

        // Fetch updated route
        const updatedResponse = await routeAPI.getRouteByNumber(form.route_no);
        
        if (updatedResponse.data?.success && updatedResponse.data?.data) {
          setRoutes([updatedResponse.data.data]);
          setShowResults(true);
        }
      } else {
        throw new Error(response.data?.msg || "Update failed");
      }

    } catch (error) {
      console.error("Update failed:", error);
      setError(error.message);
      alert("❌ Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoute = async () => {
    if (!form.route_no) {
      alert("Enter Route Number");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete route ${form.route_no}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await routeAPI.deleteRouteByNumber(form.route_no);

      if (response.data?.success) {
        alert("✅ Route deleted successfully");
        
        setForm({ ...form, route_no: "" });
        
        if (searchType === "all") {
          const allResponse = await routeAPI.getAllRoutes();
          setRoutes(allResponse.data?.data || []);
          setShowResults(true);
        } else {
          setRoutes([]);
          setShowResults(false);
        }
      } else {
        throw new Error(response.data?.msg || "Delete failed");
      }

    } catch (error) {
      console.error("Delete failed:", error);
      setError(error.message);
      alert("❌ Delete failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addRoute();
    else if (mode === "find") findRoutes();
    else if (mode === "edit" && !editLoaded) loadRouteForEdit();
    else if (mode === "edit" && editLoaded) updateRoute();
    else if (mode === "delete") deleteRoute();
  };

  return (
    <ThemeLayout>
      {/* Back Button */}
      <button
        type="button"
        onClick={() => {
          if (mode) resetAll();
          else navigate("/admin");
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

      {/* Error Display */}
      {error && (
        <div className="mt-20 max-w-xl mx-auto bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl shadow-[0_0_15px_rgba(255,0,0,0.2)]">
          Error: {error}
        </div>
      )}

      {/* Mode Selection */}
      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlusCircle />} text="Add Route" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Route" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Route" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Route" onClick={() => setMode("delete")} />
        </div>
      )}

      {/* Form Section */}
      {mode && (
        <div className="flex justify-center items-center h-full mt-20 overflow-hidden">
          <div className="max-w-xl w-full bg-black/70 backdrop-blur-xl border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.15)] p-6">
            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">
              {mode} Route
            </h2>

            {/* Show Route Number input for edit/delete modes */}
            {(mode === "edit" && !editLoaded) && (
              <input
                name="route_no"
                value={form.route_no}
                onChange={handleChange}
                placeholder="Enter Route Number (e.g., 900/1)"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            )}

            {mode === "delete" && (
              <input
                name="route_no"
                value={form.route_no}
                onChange={handleChange}
                placeholder="Enter Route Number (e.g., 900/1)"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            )}

            {/* FIND MODE */}
            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}
                >
                  <option value="route_no">Find by Route Number</option>
                  <option value="all">Get All Routes</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "route_no" && (
                  <input
                    name="route_no"
                    value={form.route_no}
                    onChange={handleChange}
                    placeholder="Enter Route Number"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by name, start point, end point..."
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}
              </>
            )}

            {/* ADD/EDIT Form Fields */}
            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <input
                  name="route_no"
                  value={form.route_no}
                  onChange={handleChange}
                  placeholder="Route Number (e.g., 900/1)"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading || (mode === "edit" && editLoaded)}
                />

                <input
                  name="route_name"
                  value={form.route_name}
                  onChange={handleChange}
                  placeholder="Route Name"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                    <input
                      name="start_point"
                      value={form.start_point}
                      onChange={handleChange}
                      placeholder="Start Point"
                      className="w-full p-3 pl-10 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <FaFlag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                    <input
                      name="end_point"
                      value={form.end_point}
                      onChange={handleChange}
                      placeholder="End Point"
                      className="w-full p-3 pl-10 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="relative">
                    <FaRoad className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                    <input
                      type="number"
                      name="total_stops"
                      value={form.total_stops}
                      onChange={handleChange}
                      placeholder="Total Stops"
                      className="w-full p-3 pl-10 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                      disabled={loading}
                      min="0"
                    />
                  </div>

                  <div className="relative">
                    <FaRuler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                    <input
                      type="number"
                      step="0.1"
                      name="distance"
                      value={form.distance}
                      onChange={handleChange}
                      placeholder="Distance (Km)"
                      className="w-full p-3 pl-10 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                      disabled={loading}
                      min="0"
                    />
                  </div>
                </div>

                <div className="mt-4 mb-2">
                  <label className="text-yellow-400 block mb-3 font-medium">
                    Select Route Type:
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-white cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        value="1"
                        checked={form.status === "1"}
                        onChange={() => handleStatusChange("1")}
                        className="form-radio text-yellow-500 focus:ring-yellow-500 focus:ring-offset-black"
                      />
                      <span className="group-hover:text-yellow-400 transition">
                        <span className="text-green-400 font-medium">Longitude Route</span>
                        <span className="text-xs text-gray-400 ml-2">(longer distances)</span>
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        value="0"
                        checked={form.status === "0"}
                        onChange={() => handleStatusChange("0")}
                        className="form-radio text-yellow-500 focus:ring-yellow-500 focus:ring-offset-black"
                      />
                      <span className="group-hover:text-yellow-400 transition">
                        <span className="text-blue-400 font-medium">Latitude Route</span>
                        <span className="text-xs text-gray-400 ml-2">(shorter distances)</span>
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)] disabled:opacity-50"
              >
                {loading ? "Please wait..." : 
                  mode === "edit" && !editLoaded ? "Load Route" : 
                  mode === "edit" && editLoaded ? "Update" :
                  mode === "delete" ? "Delete" : "Submit"}
              </button>

              <button
                onClick={resetAll}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {showResults && routes.length > 0 && (
        <div className="bg-black/70 backdrop-blur-xl border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">
            🔍 Search Results
          </h2>

          <div className="space-y-4">
            {routes.map((route) => {
              // Convert status number to display text
              const routeType = route.status === 0 || route.status === "0" ? "Latitude" : "Longitude";
              const isLongitude = route.status === 1 || route.status === "1";
              
              return (
                <div
                  key={route.route_id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-600/30 bg-black/60 hover:bg-black/50 transition-all duration-200"
                >
                  <div>
                    <p className="text-sm font-semibold text-yellow-400 mb-1">Route No: {route.route_no}</p>
                    <p className="text-yellow-300 text-sm">Route: {route.route_name}</p>
                    <p className="text-yellow-300 text-sm">From: {route.start_point} → To: {route.end_point}</p>
                    <p className="text-yellow-300 text-sm">Stops: {route.total_stops} | Distance: {formatDistance(route.distance)}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        isLongitude
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400"
                      }
                    `}
                  >
                    {routeType}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ThemeLayout>
  );
};

export default RoutePage;