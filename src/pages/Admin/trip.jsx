import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaBus,
  FaRoute,
  FaClock,
  FaCalendarAlt,
  FaInfoCircle,
  FaPlayCircle,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import { tripAPI, busAPI, routeAPI } from "../../services/api";
import ThemeLayout from "../../components/Layout/ThemeLayout";
import ActionBtn from "../../components/Layout/ActionBtn";

const Trip = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    bus_no: "",           // Manual input
    route_no: "",         // Selected from dropdown
    start_time: "",
    end_time: "",
    date: "",
    status: "ongoing"     // Default status
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const [error, setError] = useState("");

  // Status options for radio buttons (ENUM values)
  const statusOptions = [
    { value: "ongoing", label: "Ongoing", icon: <FaPlayCircle />, color: "blue", bgClass: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "completed", label: "Completed", icon: <FaCheckCircle />, color: "green", bgClass: "bg-green-500/20 text-green-400 border-green-500/30" },
    { value: "cancelled", label: "Cancelled", icon: <FaTimesCircle />, color: "red", bgClass: "bg-red-500/20 text-red-400 border-red-500/30" }
  ];

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const res = await routeAPI.getAllRoutes();
      setRoutes(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load routes", error);
    }
  };

  const resetAll = () => {
    setMode(null);
    setTrips([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);
    setError("");
    setForm({
      id: "",
      bus_no: "",
      route_no: "",
      start_time: "",
      end_time: "",
      date: "",
      status: "ongoing"
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value) => {
    setForm({ ...form, status: value });
  };

  const populateFormFromTrip = (t) => {
    setForm({
      id: t.trip_id,
      bus_no: t.bus_number,
      route_no: t.route_no,
      start_time: t.start_time?.substring(0, 5),
      end_time: t.end_time?.substring(0, 5),
      date: t.date?.split('T')[0],
      status: t.status
    });
    setEditLoaded(true);
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return "N/A";
    return time.substring(0, 5);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status icon and class
  const getStatusInfo = (status) => {
    const option = statusOptions.find(opt => opt.value === status) || statusOptions[0];
    return option;
  };

  // ==================== ADD TRIP ====================
  const addTrip = async () => {
    if (!form.bus_no || !form.route_no || !form.start_time || !form.end_time || !form.date || !form.status) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await tripAPI.createTrip({
        bus_no: form.bus_no,
        route_no: form.route_no,
        start_time: form.start_time,
        end_time: form.end_time,
        date: form.date,
        status: form.status
      });

      alert("✅ Trip added successfully");
      resetAll();
    } catch (err) {
      console.error("Add failed:", err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || "Failed to add trip";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FIND TRIPS ====================
  const findTrip = async () => {
    try {
      setLoading(true);
      setTrips([]);
      setShowResults(false);
      setError("");

      if (searchType === "id") {
        if (!form.id) {
          alert("Enter Trip ID");
          setLoading(false);
          return;
        }

        const res = await tripAPI.getTripById(form.id);
        if (res.data?.success && res.data?.data) {
          setTrips([res.data.data]);
          setShowResults(true);
        } else {
          alert("Trip not found");
        }
      }

      if (searchType === "all") {
        const res = await tripAPI.getAllTrips();
        if (res.data?.success && res.data?.data) {
          setTrips(res.data.data);
          setShowResults(true);
        } else {
          setTrips(res.data?.data || []);
          setShowResults(true);
        }
      }

      if (searchType === "text") {
        if (!searchText.trim()) {
          alert("Enter text to search");
          setLoading(false);
          return;
        }

        const res = await tripAPI.getTripByText(searchText);
        if (res.data?.success && res.data?.data) {
          setTrips(res.data.data);
          setShowResults(true);
        } else {
          setTrips(res.data?.data || []);
          setShowResults(true);
        }
      }

    } catch (err) {
      console.error("Find failed:", err);
      setError("Trip not found");
      alert("❌ Trip not found");
      setTrips([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOAD FOR EDIT ====================
  const loadTripForEdit = async () => {
    if (!form.id) {
      alert("Enter Trip ID");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await tripAPI.getTripById(form.id);
      if (res.data?.success && res.data?.data) {
        populateFormFromTrip(res.data.data);
        setTrips([res.data.data]);
        setShowResults(true);
      } else {
        alert("Trip not found");
      }
    } catch (err) {
      console.error("Load failed:", err);
      setError("Trip not found");
      alert("❌ Trip not found");
    } finally {
      setLoading(false);
    }
  };

  // ==================== UPDATE TRIP ====================
  const updateTrip = async () => {
    try {
      setLoading(true);
      setError("");

      await tripAPI.updateTrip(form.id, {
        bus_no: form.bus_no,
        route_no: form.route_no,
        start_time: form.start_time,
        end_time: form.end_time,
        date: form.date,
        status: form.status
      });

      alert("✅ Trip updated");

      const res = await tripAPI.getTripById(form.id);
      if (res.data?.success && res.data?.data) {
        setTrips([res.data.data]);
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

  // ==================== DELETE TRIP ====================
  const deleteTrip = async () => {
    if (!form.id) {
      alert("Enter Trip ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this trip?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await tripAPI.deleteTrip(form.id);
      alert("✅ Trip deleted");

      if (searchType === "all") {
        const res = await tripAPI.getAllTrips();
        setTrips(res.data?.data || []);
        setShowResults(true);
      } else {
        setTrips([]);
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
    if (mode === "add") addTrip();
    else if (mode === "find") findTrip();
    else if (mode === "edit" && !editLoaded) loadTripForEdit();
    else if (mode === "edit" && editLoaded) updateTrip();
    else if (mode === "delete") deleteTrip();
  };

  return (
    <ThemeLayout pageTitle="Trip Management">

      <button
        type="button"
        onClick={() => {
          if (mode) resetAll();
          else navigate("/admin");
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
          bg-black/60 backdrop-blur-md border border-yellow-600
          text-yellow-400 px-4 py-2 rounded-full 
          shadow-[0_0_20px_rgba(255,215,0,0.25)]
          hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaArrowLeft className="text-yellow-400" />
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
          <ActionBtn icon={<FaPlusCircle />} text="Add Trip" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Trip" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Trip" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Trip" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center h-full mt-20 overflow-hidden">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] p-6 backdrop-blur-md">

            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">{mode} Trip</h2>

            {mode === "edit" && !editLoaded && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Enter Trip ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                {/* Bus Number - Manual Input */}
                <div className="mb-3">
                  <label className="text-yellow-400 block mb-1 text-sm">Bus Number (e.g., nb-1400)</label>
                  <input
                    name="bus_no"
                    value={form.bus_no}
                    onChange={handleChange}
                    placeholder="Enter Bus Number"
                    className="w-full p-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                </div>

                {/* Route Number - Dropdown */}
                <div className="mb-3">
                  <label className="text-yellow-400 block mb-1 text-sm">Select Route</label>
                  <select
                    name="route_no"
                    value={form.route_no}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  >
                    <option value="">Select Route Number</option>
                    {routes.map((r) => (
                      <option key={r.route_id} value={r.route_no}>
                        {r.route_no} - {r.route_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div className="mb-3">
                  <label className="text-yellow-400 block mb-1 text-sm">Trip Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                </div>

                {/* Start Time and End Time */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-yellow-400 block mb-1 text-sm">Start Time</label>
                    <input
                      type="time"
                      name="start_time"
                      value={form.start_time}
                      onChange={handleChange}
                      className="w-full p-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="text-yellow-400 block mb-1 text-sm">End Time</label>
                    <input
                      type="time"
                      name="end_time"
                      value={form.end_time}
                      onChange={handleChange}
                      className="w-full p-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Status Radio Buttons */}
                <div className="mb-3">
                  <label className="text-yellow-400 block mb-2 text-sm">Trip Status</label>
                  <div className="flex gap-4">
                    {statusOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all duration-200
                          ${form.status === option.value
                            ? option.bgClass
                            : 'bg-black/40 border-gray-700 text-gray-400 hover:border-yellow-500'
                          }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={form.status === option.value}
                          onChange={() => handleStatusChange(option.value)}
                          className="hidden"
                        />
                        <span className={`text-${option.color}-400`}>{option.icon}</span>
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
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
                  <option value="all">Get All Trips</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="Trip ID"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by bus, route, date..."
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
                placeholder="Trip ID"
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

      {/* Results Display - Beautiful User-Friendly Design */}
      {showResults && trips.length > 0 && (
        <div className="max-w-6xl mx-auto bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            🚌 Trip Results ({trips.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map((trip) => {
              const statusInfo = getStatusInfo(trip.status);
              
              return (
                <div
                  key={trip.trip_id}
                  className="bg-gradient-to-br from-black/80 to-black/60 border border-yellow-600/30 rounded-xl p-4 hover:border-yellow-500 transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Header with Trip ID and Status */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded">
                        Trip #{trip.trip_id}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.bgClass}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Bus and Route Info */}
                  <div className="mb-3 p-3 bg-black/40 rounded-xl border border-yellow-600/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FaBus className="text-yellow-400 text-sm" />
                      <span className="text-white font-medium">{trip.bus_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaRoute className="text-yellow-400 text-sm" />
                      <span className="text-yellow-300">{trip.route_no} - {trip.route_name}</span>
                    </div>
                  </div>

                  {/* Date and Time Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg">
                      <FaCalendarAlt className="text-yellow-400 text-xs" />
                      <div>
                        <p className="text-gray-400 text-xs">Date</p>
                        <p className="text-white text-sm">{formatDate(trip.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg">
                      <FaClock className="text-yellow-400 text-xs" />
                      <div>
                        <p className="text-gray-400 text-xs">Time</p>
                        <p className="text-white text-sm">{formatTime(trip.start_time)} - {formatTime(trip.end_time)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="mt-2 flex justify-end">
                    <span className="text-xs text-gray-500">
                      Duration: {
                        trip.start_time && trip.end_time 
                          ? `${Math.abs(
                              parseInt(trip.end_time?.split(':')[0]) - parseInt(trip.start_time?.split(':')[0])
                            )}h ${Math.abs(
                              parseInt(trip.end_time?.split(':')[1]) - parseInt(trip.start_time?.split(':')[1])
                            )}m`
                          : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ThemeLayout>
  );
};

export default Trip;