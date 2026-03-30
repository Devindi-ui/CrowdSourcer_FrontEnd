import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaBus,
  FaRoute,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaInfoCircle,
  FaChartLine,
  FaCalendarWeek,
  FaCalendarDay,
  FaHistory,
  FaChevronLeft
} from "react-icons/fa";

import { crowdReportAPI, busAPI, routeAPI } from "../../services/api";

const CrowdReport = () => {

  const navigate = useNavigate();

  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);

  const [form, setForm] = useState({
    report_id: "",
    route_no: "",
    bus_no: "",
    current_count: "",
    crowd_status: "Medium"
  });

  // Date range state
  const [dateRange, setDateRange] = useState({
    from_date: "",
    to_date: "",
    preset: "all" // all, week, month, year, custom
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [reports, setReports] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const [error, setError] = useState("");

  const [routes, setRoutes] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [tripData, setTripData] = useState({
    trips: [],
    summary: {
      total_trips: 0,
      days_with_data: 0,
      total_sum: 0,
      overall_average: 0,
      from_date: "",
      to_date: ""
    }
  });
  const [showTripBox, setShowTripBox] = useState(false);

  // Debug effect
  useEffect(() => {
    console.log("Current Form Values:", {
      route_no: form.route_no,
      bus_no: form.bus_no,
      current_count: form.current_count,
      crowd_status: form.crowd_status,
      dateRange: dateRange
    });
  }, [form, dateRange]);

  // Crowd status options
  const crowdStatusOptions = [
    { value: "Low", label: "Low", color: "green", icon: "😊", bgClass: "bg-green-500/20 text-green-400 border-green-500/30" },
    { value: "Medium", label: "Medium", color: "yellow", icon: "😐", bgClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    { value: "High", label: "High", color: "orange", icon: "😟", bgClass: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { value: "Full", label: "Full", color: "red", icon: "😫", bgClass: "bg-red-500/20 text-red-400 border-red-500/30" }
  ];

  const datePresets = [
    { value: "all", label: "All Time", icon: <FaHistory className="mr-1" /> },
    { value: "week", label: "This Week", icon: <FaCalendarWeek className="mr-1" /> },
    { value: "month", label: "This Month", icon: <FaCalendarAlt className="mr-1" /> },
    { value: "year", label: "This Year", icon: <FaCalendarDay className="mr-1" /> },
    { value: "custom", label: "Custom Range", icon: <FaCalendarAlt className="mr-1" /> }
  ];

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const routeRes = await routeAPI.getAllRoutes();
      setRoutes(routeRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load routes:", err);
    }
  };

  const setDatePreset = (preset) => {
    const today = new Date();
    const to_date = today.toISOString().split('T')[0];
    let from_date = "";

    if (preset === "all") {
      from_date = "2000-01-01";
    } else if (preset === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      from_date = weekAgo.toISOString().split('T')[0];
    } else if (preset === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      from_date = monthAgo.toISOString().split('T')[0];
    } else if (preset === "year") {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      from_date = yearAgo.toISOString().split('T')[0];
    }

    setDateRange({
      from_date,
      to_date,
      preset
    });
  };

  // Load buses when route is selected
  useEffect(() => {
    const loadBusesForRoute = async () => {
      if (form.route_no) {
        try {
          setLoading(true);
          console.log("Loading buses for route:", form.route_no);
          const res = await crowdReportAPI.getBusesByRouteNo(form.route_no);
          console.log("Buses response:", res.data);
          setAvailableBuses(res.data?.data || []);
          setForm(prev => ({ ...prev, bus_no: "" }));
          setTripData({ trips: [], summary: {} });
          setShowTripBox(false);
        } catch (err) {
          console.error("Failed to load buses:", err);
          setAvailableBuses([]);
        } finally {
          setLoading(false);
        }
      } else {
        setAvailableBuses([]);
        setForm(prev => ({ ...prev, bus_no: "" }));
        setTripData({ trips: [], summary: {} });
        setShowTripBox(false);
      }
    };
    loadBusesForRoute();
  }, [form.route_no]);

  useEffect(() => {
    const loadTripsWithDateRange = async () => {
      if (form.route_no && form.bus_no && dateRange.from_date && dateRange.to_date) {
        try {
          setLoadingTrips(true);
          console.log("Loading trips for bus:", form.bus_no, "route:", form.route_no, 
                      "from:", dateRange.from_date, "to:", dateRange.to_date);
          
          const res = await crowdReportAPI.getTripsInDateRange(
            form.bus_no, 
            form.route_no, 
            dateRange.from_date, 
            dateRange.to_date
          );
          
          console.log("Trips response:", res.data);
          
          setTripData(res.data?.data || { trips: [], summary: {} });
          setShowTripBox(true);
        } catch (err) {
          console.error("Failed to load trips:", err);
          setTripData({ trips: [], summary: {} });
          setShowTripBox(false);
        } finally {
          setLoadingTrips(false);
        }
      } else {
        setTripData({ trips: [], summary: {} });
        setShowTripBox(false);
      }
    };
    loadTripsWithDateRange();
  }, [form.bus_no, form.route_no, dateRange.from_date, dateRange.to_date]);

  const resetAll = () => {
    setMode(null);
    setSearchType("id");
    setSearchText("");
    setReports([]);
    setShowResults(false);
    setEditLoaded(false);
    setError("");
    setAvailableBuses([]);
    setTripData({ trips: [], summary: {} });
    setShowTripBox(false);
    setDateRange({
      from_date: "",
      to_date: "",
      preset: "all"
    });
    setForm({
      report_id: "",
      route_no: "",
      bus_no: "",
      current_count: "",
      crowd_status: "Medium"
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value, preset: "custom" }));
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const startTime = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);
    const diff = (endTime - startTime) / (1000 * 60);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const addReport = async () => {
    if (!form.route_no || !form.bus_no) {
      alert("❌ Please select Route and Bus");
      return;
    }
    
    const countStr = form.current_count ? form.current_count.toString().trim() : "";
    if (countStr === "") {
      alert("❌ Please enter Current Passenger Count");
      return;
    }
    
    const countNum = parseInt(form.current_count);
    if (isNaN(countNum) || countNum < 0) {
      alert("❌ Please enter a valid positive number for passenger count");
      return;
    }
    
    if (!form.crowd_status) {
      alert("❌ Please select a Crowd Status");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const requestData = {
        bus_no: form.bus_no,
        route_no: form.route_no,
        current_count: parseInt(form.current_count),
        crowd_status: form.crowd_status
      };

      console.log("Sending data to API:", requestData);

      const response = await crowdReportAPI.createCrowdReport(requestData);
      console.log("API Response:", response);

      if (response.data?.success) {
        alert("✅ Crowd Report added successfully");
        resetAll();
      } else {
        throw new Error(response.data?.msg || "Failed to add");
      }

    } catch (err) {
      console.error("Add failed:", err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || err.message || "Failed to add Crowd Report";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const findReport = async () => {
    try {
      setLoading(true);
      setReports([]);
      setShowResults(false);
      setError("");

      if (searchType === "id") {
        if (!form.report_id) {
          alert("Enter Report ID");
          setLoading(false);
          return;
        }

        const res = await crowdReportAPI.getCrowdReportById(form.report_id);

        if (res.data?.success && res.data?.data) {
          setReports([res.data.data]);
          setShowResults(true);
        } else {
          alert("Report not found");
        }
      }

      if (searchType === "all") {
        const res = await crowdReportAPI.getAllCrowdReports();
        if (res.data?.success && res.data?.data) {
          setReports(res.data.data);
          setShowResults(true);
        } else {
          setReports(res.data?.data || []);
          setShowResults(true);
        }
      }

      if (searchType === "text") {
        if (!searchText.trim()) {
          alert("Enter text to search");
          setLoading(false);
          return;
        }

        const res = await crowdReportAPI.getCrowdReportByText(searchText);

        if (res.data?.success && res.data?.data) {
          setReports(res.data.data);
          setShowResults(true);
        } else {
          setReports(res.data?.data || []);
          setShowResults(true);
        }
      }

    } catch (err) {
      console.error("Find failed:", err);
      setError("Crowd Report not found");
      alert("❌ Crowd Report not found");
      setReports([]);
      setShowResults(false); 
    } finally {
      setLoading(false);
    }
  };

  const loadReportForEdit = async () => {
    if (!form.report_id) {
      alert("Enter Report ID");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await crowdReportAPI.getCrowdReportById(form.report_id);

      if (res.data?.success && res.data?.data) {
        const r = res.data.data;

        setForm({
          report_id: r.report_id,
          route_no: r.route_no,
          bus_no: r.bus_number,
          current_count: r.current_count,
          crowd_status: r.crowd_status
        });

        const busesRes = await crowdReportAPI.getBusesByRouteNo(r.route_no);
        setAvailableBuses(busesRes.data?.data || []);
        
        setEditLoaded(true);
        setReports([r]);
        setShowResults(true);
      } else {
        alert("Report not found");
      }

    } catch (err) {
      console.error("Load failed:", err);
      setError("Crowd Report not found");
      alert("❌ Crowd Report not found");
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async () => {
    try {
      setLoading(true);
      setError("");

      await crowdReportAPI.updateCrowdReport(form.report_id, {
        bus_no: form.bus_no,
        route_no: form.route_no,
        current_count: parseInt(form.current_count),
        crowd_status: form.crowd_status
      });

      alert("✅ Crowd Report updated");

      const res = await crowdReportAPI.getCrowdReportById(form.report_id);

      if (res.data?.success && res.data?.data) {
        setReports([res.data.data]);
        setShowResults(true);
      }

      setEditLoaded(false);

    } catch (err) {
      console.error("Update failed:", err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || "Update failed";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async () => {
    if (!form.report_id) {
      alert("Enter Report ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await crowdReportAPI.deleteCrowdReport(form.report_id);
      alert("✅ Crowd Report deleted");
      resetAll();

    } catch (err) {
      console.error("Delete failed:", err);
      setError("Delete failed");
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addReport();
    else if (mode === "find") findReport();
    else if (mode === "edit" && !editLoaded) loadReportForEdit();
    else if (mode === "edit" && editLoaded) updateReport();
    else if (mode === "delete") deleteReport();
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* Error Display */}
      {error && (
        <div className="mt-20 max-w-xl mx-auto bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl">
          Error: {error}
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 p-6">

      <button
        type="button"
        onClick={() => {
          if (mode) setMode(null);
          else navigate("/admin");
        }}
        className="mt-18 fixed top-6 z-50 flex items-center gap-2 mt-15
        bg-black/60 backdrop-blur-md text-yellow-400 px-4 py-2 rounded-full 
        shadow-[0_0_20px_rgba(255,215,0,0.25)]
        hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaChevronLeft />
      </button>

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlus />} text="Add Crowd Report" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Crowd Report" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Crowd Report" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Crowd Report" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-start mt-10">
          <div className="max-w-2xl w-full bg-black/70 backdrop-blur-xl border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.15)] p-6">

            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">
              {mode} Crowd Report
            </h2>

            {mode === "edit" && !editLoaded && (
              <input
                name="report_id"
                value={form.report_id}
                onChange={handleChange}
                placeholder="Enter Report ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                {/* Route Selection */}
                <div className="mb-4">
                  <label className="text-yellow-400 block mb-2 text-sm font-medium">
                    <FaRoute className="inline mr-2" /> Select Route Number
                  </label>
                  <select
                    name="route_no"
                    value={form.route_no}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  >
                    <option value="">Choose a route...</option>
                    {routes.map((r) => (
                      <option key={r.route_id} value={r.route_no}>
                        {r.route_no} - {r.route_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bus Selection */}
                {form.route_no && (
                  <div className="mb-4">
                    <label className="text-yellow-400 block mb-2 text-sm font-medium">
                      <FaBus className="inline mr-2" /> Select Bus Number
                    </label>
                    <select
                      name="bus_no"
                      value={form.bus_no}
                      onChange={handleChange}
                      className="w-full p-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                      disabled={loading || availableBuses.length === 0}
                    >
                      <option value="">Choose a bus...</option>
                      {availableBuses.map((b) => (
                        <option key={b.bus_id} value={b.bus_number}>
                          {b.bus_number}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {form.bus_no && (
                  <div className="mb-4 p-4 bg-black/40 border border-yellow-600/20 rounded-xl">
                    <label className="text-yellow-400 block mb-3 text-sm font-medium">
                      <FaCalendarAlt className="inline mr-2" /> Select Date Range
                    </label>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                      {datePresets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setDatePreset(preset.value)}
                          className={`flex items-center justify-center px-2 py-1.5 rounded-full text-xs font-medium transition
                            ${dateRange.preset === preset.value
                              ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                              : 'bg-black/40 text-gray-400 border border-gray-700 hover:border-yellow-500'
                            }`}
                        >
                          {preset.icon}
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Date Range */}
                    {(dateRange.preset === "custom" || dateRange.preset === "all") && (
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">From Date</label>
                          <input
                            type="date"
                            name="from_date"
                            value={dateRange.from_date}
                            onChange={handleDateChange}
                            className="w-full p-2 bg-black/60 border border-yellow-600/40 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                            disabled={loading || dateRange.preset === "all"}
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">To Date</label>
                          <input
                            type="date"
                            name="to_date"
                            value={dateRange.to_date}
                            onChange={handleDateChange}
                            className="w-full p-2 bg-black/60 border border-yellow-600/40 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                            disabled={loading || dateRange.preset === "all"}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trip Details Box */}
                {showTripBox && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-yellow-900/20 to-black/60 border-2 border-yellow-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <FaInfoCircle className="text-yellow-400 text-lg" />
                      <h3 className="text-yellow-400 font-semibold">
                        {dateRange.preset === "all" ? "All Time Trip History" : "Trip History for Selected Range"}
                      </h3>
                      {loadingTrips && (
                        <span className="text-xs text-yellow-400 ml-2 animate-pulse">Loading...</span>
                      )}
                    </div>
                    
                    {/* Summary Card */}
                    {tripData.summary && tripData.summary.total_trips > 0 && (
                      <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-gray-400 text-xs">Date Range</p>
                            <p className="text-yellow-300 text-sm font-medium">
                              {formatDate(tripData.summary.from_date)} - {formatDate(tripData.summary.to_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Total Trips</p>
                            <p className="text-white text-sm font-medium">{tripData.summary.total_trips}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Days with Data</p>
                            <p className="text-white text-sm font-medium">{tripData.summary.days_with_data}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Total Sum</p>
                            <p className="text-yellow-300 text-sm font-medium">{tripData.summary.total_sum}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-400 text-xs">Overall Average</p>
                            <p className="text-yellow-400 text-lg font-bold">{tripData.summary.overall_average}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!loadingTrips && tripData.trips.length === 0 ? (
                      <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-xl text-center">
                        <p className="text-gray-400">No trips found for this date range</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {tripData.trips.map((trip) => (
                          <div
                            key={trip.trip_id}
                            className="p-3 rounded-lg border border-yellow-600/20 bg-black/40"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-yellow-400 text-xs font-mono">
                                Trip #{trip.trip_id} - {formatDate(trip.date)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Time:</span>
                                <span className="text-white ml-1">
                                  {trip.start_time?.substring(0,5)} - {trip.end_time?.substring(0,5)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Duration:</span>
                                <span className="text-white ml-1">{trip.duration}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-400">Avg Passengers:</span>
                                <span className="text-yellow-300 font-medium ml-1">
                                  {trip.avg_passengers} (from {trip.total_updates} updates)
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Passenger Count Input */}
                <div className="mb-4">
                  <label className="text-yellow-400 block mb-2 text-sm font-medium">
                    <FaUsers className="inline mr-2" /> Current Passenger Count (Manual Input)
                  </label>
                  <input
                    name="current_count"
                    type="number"
                    value={form.current_count}
                    onChange={handleChange}
                    placeholder="Enter your estimated passenger count"
                    className="w-full p-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                    min="0"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-yellow-400 block mb-3 text-sm font-medium">
                    Crowd Status
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {crowdStatusOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                          ${form.crowd_status === option.value
                            ? option.bgClass
                            : 'bg-black/40 border-gray-700 text-gray-400 hover:border-yellow-500'
                          }`}
                      >
                        <input
                          type="radio"
                          name="crowd_status"
                          value={option.value}
                          checked={form.crowd_status === option.value}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span className="text-lg mr-1">{option.icon}</span>
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
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}
                >
                  <option value="id">Find by ID</option>
                  <option value="all">Get All Reports</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input
                    name="report_id"
                    value={form.report_id}
                    onChange={handleChange}
                    placeholder="Report ID"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by bus number, route, status..."
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}
              </>
            )}

            {mode === "delete" && (
              <input
                name="report_id"
                value={form.report_id}
                onChange={handleChange}
                placeholder="Report ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            )}

            <div className="flex gap-3 mt-4">
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

      {showResults && reports.length > 0 && (
        <div className="bg-black/70 backdrop-blur-xl border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">
            🔍 Search Results ({reports.length})
          </h2>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {reports.map((r) => {
              const statusOption = crowdStatusOptions.find(opt => opt.value === r.crowd_status) || crowdStatusOptions[1];
              
              return (
                <div
                  key={r.report_id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-600/30 bg-black/60 hover:bg-black/50 transition-all duration-200"
                >
                  <div>
                    <p className="text-sm text-yellow-400 mb-1">Report ID: {r.report_id}</p>
                    <p className="text-yellow-300 text-sm">Bus: {r.bus_number}</p>
                    <p className="text-yellow-300 text-sm">Route: {r.route_no} ({r.route_name})</p>
                    <p className="text-yellow-300 text-sm">Passengers: {r.current_count}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusOption.bgClass}`}
                  >
                    <span className="mr-1">{statusOption.icon}</span>
                    {r.crowd_status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

const ActionBtn = ({ icon, text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-2 flex items-center gap-3 p-5 bg-black/70 border border-yellow-600/40 rounded-3xl 
      shadow-[0_0_20px_rgba(255,215,0,0.15)] hover:bg-black/50 hover:scale-105 transition text-white"
  >
    <span className="text-yellow-400 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

export default CrowdReport;