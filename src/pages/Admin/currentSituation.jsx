import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaTrash,
  FaEdit,
  FaArrowLeft,
  FaExclamationTriangle
} from "react-icons/fa";
import { currentSituationAPI, busAPI, routeAPI, routeStopAPI } from "../../services/api";
import ThemeLayout from "../../components/common/Layout/ThemeLayout";

const CurrentSituation = ({
  passengerView = false,
  preselectedBus = null,
  initialMode = 'view',
  userId = null,
  busId = null,
  routeNo = null,
  routeName = null,
  ownerView = false,
  ownerId = null
}) => {
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

  // Helper functions for Sri Lanka timezone
  const toSriLankaDate = (utcDate) => {
      if (!utcDate) return null;
      const date = new Date(utcDate);
      const sriLankaTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
      return sriLankaTime.toISOString().split('T')[0];
  };

  const getTodaySriLanka = () => {
      const now = new Date();
      const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      return sriLankaTime.toISOString().split('T')[0];
  };

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

  // Load situations for owner view (all situations for owner's buses, today's ongoing trips only)
  useEffect(() => {
      if (ownerView && ownerId) {
          console.log("Owner view mode - loading situations for owner:", ownerId);
          setMode(null);
          loadSituationsForOwner();
      }
  }, [ownerView, ownerId]);

  const loadSituationsForOwner = async () => {
      try {
          setLoading(true);
          console.log("Loading situations for owner:", ownerId);
          
          // First get all buses belonging to this owner
          const busesRes = await busAPI.getAllBuses();
          const allBuses = busesRes.data?.data || [];
          const ownerBuses = allBuses.filter(bus => bus.owner_id === parseInt(ownerId));
          const ownerBusNumbers = ownerBuses.map(bus => bus.bus_number);
          
          console.log("Owner's buses:", ownerBusNumbers);
          
          // Get all situations
          const res = await currentSituationAPI.getAll();
          let allSituations = res?.data?.data || [];
          console.log("Total situations:", allSituations.length);
          
          // Filter by owner's buses
          let ownerSituations = allSituations.filter(sit => 
              ownerBusNumbers.includes(sit.bus_number)
          );
          console.log(`Filtered to ${ownerSituations.length} situations for owner's buses`);
          
          // Further filter for today's ongoing trips only
          const todaySriLanka = getTodaySriLanka();
          const ongoingTrips = await getOngoingTripsForBuses(ownerBusNumbers);
          const ongoingBusNumbers = ongoingTrips.map(trip => trip.bus_number);
          
          // Keep only situations for buses that have ongoing trips today
          ownerSituations = ownerSituations.filter(sit => 
              ongoingBusNumbers.includes(sit.bus_number)
          );
          
          console.log(`Filtered to ${ownerSituations.length} situations for today's ongoing trips`);
          
          setResults(ownerSituations);
          setShowResults(true);
          
      } catch (error) {
          console.error("Failed to load situations for owner:", error);
          setError("Failed to load situations");
      } finally {
          setLoading(false);
      }
  };

  const getOngoingTripsForBuses = async (busNumbers) => {
      try {
          const tripsRes = await tripAPI.getAllTrips();
          const allTrips = tripsRes.data?.data || [];
          const todaySriLanka = getTodaySriLanka();
          
          return allTrips.filter(trip => 
              busNumbers.includes(trip.bus_number) &&
              trip.status === 'ongoing' &&
              toSriLankaDate(trip.date) === todaySriLanka
          );
      } catch (error) {
          console.error("Failed to get ongoing trips:", error);
          return [];
      }
  };

  // Load data when component mounts (for passenger view)
  useEffect(() => {
      if (passengerView) {
          console.log("Passenger view mode - loading data for bus:", preselectedBus);
          setMode(null);
          loadSituationsForBus();
          
          if (preselectedBus && routeNo && routeName) {
              setForm(prev => ({
                  ...prev,
                  bus_no: preselectedBus,
                  route_no: routeNo,
              }));
              loadStopsByRouteNo(routeNo);
              setSelectedRouteName(routeName);
              const route = routes.find(r => r.route_no === routeNo);
              if (route) {
                  const routeBuses = buses.filter(b => b.route_id === route.route_id);
                  setAvailableBuses(routeBuses);
              }
          }
      }
  }, [passengerView, preselectedBus, routeNo, routeName, buses, routes]);

  // Debug form changes
  useEffect(() => {
      console.log("Form updated:", form);
      console.log("Stops available:", stops.length);
  }, [form, stops]);

  // Load stops when route_no changes
  useEffect(() => {
      if (form.route_no) {
          console.log("Route changed to:", form.route_no);
          loadStopsByRouteNo(form.route_no);
      } else {
          setStops([]);
      }
  }, [form.route_no]);

  // Load buses when route is selected
  useEffect(() => {
    const loadBusesForRoute = async () => {
      if (form.route_no) {
        try {
          const route = routes.find(r => r.route_no === form.route_no);
          if (route) {
            const routeBuses = buses.filter(bus => bus.route_id === route.route_id);
            setAvailableBuses(routeBuses);
            setSelectedRouteName(route.route_name || "");
          } else {
            setAvailableBuses([]);
            setSelectedRouteName("");
          }
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

  // main useEffect for passenger view 
  useEffect(() => {
    if (passengerView) {
        console.log("🟢 CurrentSituation received props:", {
            preselectedBus,
            routeNo,
            routeName,
            busId,
            userId
        });
        
        if (preselectedBus && routeNo && routeName) {
            setForm(prev => ({
                ...prev,
                bus_no: preselectedBus,
                route_no: routeNo,
                user_id: userId || ''
            }));
            
            if (routeNo) {
                loadStopsByRouteNo(routeNo);
            }
            setSelectedRouteName(routeName);
        }
        
        if (preselectedBus) {
            loadSituationsForBus();
        }
    }
  }, [passengerView, preselectedBus, routeNo, routeName, busId, userId]);

   // Load stops using route number
  const loadStopsByRouteNo = async (routeNo) => {
      try {
          console.log("Loading stops for route number:", routeNo);

          if (!routeNo) {
              setStops([]);
              return;
          }

          const res = await routeStopAPI.getByRouteNo(routeNo);
          console.log("Stops response:", res);

          const stopsData = res?.data?.data || [];
          console.log("Stops loaded:", stopsData.length, stopsData);
          
          setStops(stopsData);
          
          if (stopsData.length > 0 && mode === "add") {
                 setForm(prev => ({ ...prev, current_stop: stopsData[0].stop_name }));
          }

      } catch (error) {
          console.error("Stop load failed:", error);
          setStops([]);
      }
  };

  // Load all situations for the selected bus (passenger view)
  const loadSituationsForBus = async () => {
      try {
          setLoading(true);
          console.log("Loading situations for bus:", preselectedBus);
          
          const res = await currentSituationAPI.getAll();
          console.log("All situations:", res);
          
          let allSituations = res?.data?.data || [];
          console.log("Total situations:", allSituations.length);
          
          if (preselectedBus) {
              allSituations = allSituations.filter(sit => 
                  sit.bus_number === preselectedBus
              );
              console.log(`Filtered to ${allSituations.length} situations for bus ${preselectedBus}`);
          }
          
          setResults(allSituations);
          setShowResults(true);
          
      } catch (error) {
          console.error("Failed to load situations:", error);
          setError("Failed to load situations");
      } finally {
          setLoading(false);
      }
  };

  // Handle bus selection
  const handleBusChange = async (e) => {
    const selectedBusNo = e.target.value;
    
    setForm({
      ...form,
      bus_no: selectedBusNo,
      current_stop: ""
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

  const handleSubmit = () => {
    if (mode === "add") addCurrentSituation();
    else if (mode === "find") findCurrentSituation();
    else if (mode === "delete") deleteCurrentSituation();
    else if (mode === "edit") updateCurrentSituation();  
  };

  // When user clicks "Add" button
  const handleAddClick = () => {
    setMode("add");
    
    if (passengerView && preselectedBus && routeNo) {
        console.log("Pre-filling form for bus:", preselectedBus);
        
        setForm(prev => ({
            ...prev,
            bus_no: preselectedBus,
            route_no: routeNo,
            user_id: userId || '',
            current_stop: ""
        }));
        
        if (routeNo) {
            console.log("Loading stops for route:", routeNo);
            loadStopsByRouteNo(routeNo);
        }
    }
 };

    const addCurrentSituation = async () => {
        if (passengerView) {
            if (!routeNo || !preselectedBus || !userId || !form.current_stop || !form.avg_passengers) {
                console.log("Validation failed - passenger view:", {
                    routeNo,
                    preselectedBus,
                    userId,
                    current_stop: form.current_stop,
                    avg_passengers: form.avg_passengers
                });
                alert("Please fill all fields");
                return;
            }
        } else {
            if (!form.route_no || !form.bus_no || !form.user_id || !form.current_stop || !form.avg_passengers) {
                console.log("Validation failed - admin view:", form);
                alert("Please fill all fields");
                return;
            }
        }

        try {
            setLoading(true);
            setError("");

            const situationData = {
                bus_no: passengerView ? preselectedBus : form.bus_no,
                route_no: passengerView ? routeNo : form.route_no,
                user_id: passengerView ? userId : form.user_id,
                current_stop: form.current_stop,
                avg_passengers: parseInt(form.avg_passengers)
            };

            console.log("Adding situation:", situationData);

            await currentSituationAPI.create(situationData);
            
            alert("✅ Current Situation added successfully");
            
            setForm({
                cr_id: "",
                bus_no: passengerView ? preselectedBus : "",
                route_no: passengerView ? routeNo : "",
                user_id: passengerView ? userId : "",
                current_stop: "",
                avg_passengers: ""
            });
            
            setMode(null);
            
            if (passengerView) {
                await loadSituationsForBus();
            }
            
        } catch (error) {
            console.error("Add Failed: ", error);     
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to add";
            setError(errorMsg);
            alert("Failed to add: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Update current situation
    const updateCurrentSituation = async () => {
        if (!form.cr_id || !form.current_stop || !form.avg_passengers) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const updateData = {
                current_stop: form.current_stop,
                avg_passengers: parseInt(form.avg_passengers)
            };

            console.log("Updating situation:", form.cr_id, updateData);

            await currentSituationAPI.update(form.cr_id, updateData);
            
            alert("✅ Situation updated successfully");
            
            setMode(null);
            setForm({
                cr_id: "",
                bus_no: passengerView ? preselectedBus : "",
                route_no: passengerView ? routeNo : "",
                user_id: passengerView ? userId : "",
                current_stop: "",
                avg_passengers: ""
            });
            
            if (passengerView) {
                await loadSituationsForBus();
            }
            
        } catch (error) {
            console.error("Update Failed: ", error);     
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to update";
            setError(errorMsg);
            alert("Failed to update: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete situation
    const handleDeleteSituation = async (id) => {
        if (!window.confirm("Are you sure you want to delete this situation?")) return;
        
        try {
            setLoading(true);
            await currentSituationAPI.delete(id);
            alert("✅ Situation deleted successfully");
            
            if (passengerView) {
                await loadSituationsForBus();
            } else {
                if (searchType === "all") {
                    const res = await currentSituationAPI.getAll();
                    setResults(res?.data?.data || []);
                }
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("❌ Failed to delete situation");
        } finally {
            setLoading(false);
        }
    };

    // Handle edit situation (for passenger view)
    const handleEditSituation = (situation) => {
        setForm({
            cr_id: situation.cr_id,
            bus_no: situation.bus_number,
            route_no: situation.route_no,
            user_id: situation.user_id,
            current_stop: situation.current_stop,
            avg_passengers: situation.avg_passengers
        });
        setMode("edit");
        loadStopsByRouteNo(situation.route_no);
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

  return (
    <ThemeLayout>

        <button
        type="button"
        onClick={() => {
            if (mode) {
                setMode(null);
            } else {
                navigate(-1);
            }
        }}
        className="fixed top-6 z-50 flex items-center gap-2 mt-15
        bg-black/60 backdrop-blur-md border border-yellow-600
        text-yellow-400 px-4 py-2 rounded-full 
        shadow-[0_0_20px_rgba(255,215,0,0.25)]
        hover:bg-yellow-500 hover:text-black transition duration-300"
    >
        <FaArrowLeft />
        <span className="font-semibold text-sm">{mode ? "Cancel" : "Back"}</span>
    </button>

      {/* Error Display */}
      {error && (
        <div className="mt-20 max-w-xl mx-auto bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl">
          Error: {error}
        </div>
      )}

      {/* Action Buttons - Hide for owners (read-only) */}
      {!mode && !passengerView && !ownerView && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlusCircle />} text="Add Current Situation" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Current Situation" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaTrash />} text="Delete Current Situation" onClick={() => setMode("delete")} />
        </div>
      )}

      {/* For passengers, show only Add button */}
      {!mode && passengerView && !ownerView && (
          <div className="mt-35 mb-6 flex justify-center">
              <button
                  onClick={() => setMode("add")}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition"
              >
                  <FaPlusCircle /> Report Current Situation
              </button>
          </div>
      )}

      {/* For owners - show only results, no action buttons */}
      {!mode && ownerView && (
          <div className="mt-10">
              {/* Results will show below */}
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
                    {/* User ID - Auto-fill for passengers */}
                    {passengerView ? (
                        <input
                            value={userId || ''}
                            readOnly
                            placeholder="User ID (Auto-filled)"
                            className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                        />
                    ) : (
                        <input
                            value={form.user_id}
                            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                            placeholder="User ID"
                            className="w-full p-3 mb-3 bg-black border border-yellow-600 rounded-xl text-white"
                            disabled={loading}
                        />
                    )}

                    {/* Route Number Selection - Auto-filled for passengers */}
                    {passengerView ? (
                        <input
                            value={routeNo || ''}
                            readOnly
                            placeholder="Route Number (Auto-filled)"
                            className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                        />
                    ) : (
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
                    )}

                    {/* Bus Number Selection - Auto-filled for passengers */}
                    {passengerView ? (
                        <input
                            value={preselectedBus || ''}
                            readOnly
                            placeholder="Bus Number (Auto-filled)"
                            className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                        />
                    ) : (
                        form.route_no && (
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
                        )
                    )}

                    {/* Route Name Display */}
                    <input
                        value={passengerView ? routeName : selectedRouteName}
                        readOnly
                        placeholder="Route Name"
                        className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                    />

                    {/* Current Stop Selection */}
                    {form.route_no && (
                        <div className="mb-3">
                            <label className="text-yellow-400 block mb-1 text-sm">Current Stop</label>
                            <select
                                value={form.current_stop}
                                onChange={(e) => setForm({ ...form, current_stop: e.target.value })}
                                className="w-full p-3 bg-black border border-yellow-600 rounded-xl text-white"
                                disabled={loading || stops.length === 0}
                                required
                            >
                                <option value="">Select Stop</option>
                                {stops.map(s => (
                                    <option key={s.stop_order_id || s.stop_id} value={s.stop_name}>
                                        {s.stop_name}
                                    </option>
                                ))}
                            </select>
                            {stops.length === 0 && form.route_no && (
                                <p className="text-red-400 text-xs mt-1">No stops found for this route</p>
                            )}
                        </div>
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
                  mode === "add" ? "Add Situation" :
                  mode === "edit" ? "Update Situation" :
                  mode === "delete" ? "Delete Situation" :
                  mode === "find" ? "Search" : "Submit"}
              </button>

              {/* Edit mode form */}
              {mode === "edit" && (
                  <>
                      <input
                          value={form.cr_id}
                          readOnly
                          placeholder="CR ID"
                          className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                      />
                      
                      <input
                          value={form.bus_no}
                          readOnly
                          placeholder="Bus Number"
                          className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                      />
                      
                      <input
                          value={form.route_no}
                          readOnly
                          placeholder="Route Number"
                          className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                      />
                      
                      <input
                          value={selectedRouteName}
                          readOnly
                          placeholder="Route Name"
                          className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                      />
                      
                      <input
                          value={form.user_id}
                          readOnly
                          placeholder="User ID"
                          className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                      />

                      {/* Current Stop Selection */}
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

              <button
                onClick={() => {
                    if (passengerView) {
                        navigate('/passenger/dashboard');
                    } else if (ownerView) {
                        navigate('/owner');
                    } else {
                        navigate('/admin');
                    }
                }}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Results - Owner View (Read-Only, No Edit/Delete) */}
      {showResults && results.length > 0 && (
        <div className="max-w-4xl mx-auto bg-black/70 border border-yellow-600/40 rounded-2xl p-6 mt-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-yellow-400">
                    {ownerView 
                        ? `Current Situations for My Buses (Today's Ongoing Trips)` 
                        : passengerView 
                            ? `Current Situations for Bus ${preselectedBus}` 
                            : "Results"} 
                    <span className="ml-2 text-sm text-gray-400">({results.length})</span>
                </h2>
            </div>

            <div className="space-y-4">
                {results.map(r => (
                    <div key={r.cr_id} className="p-4 rounded-xl border border-yellow-600/30 bg-black/60 relative">
                        {/* Edit/Delete buttons - ONLY for passenger's own entries, NOT for owners */}
                        {passengerView && !ownerView && r.user_id === userId && (
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => handleEditSituation(r)}
                                    className="text-blue-400 hover:text-blue-300 transition p-2"
                                    title="Edit"
                                >
                                    <FaEdit className="text-xl" />
                                </button>
                                <button
                                    onClick={() => handleDeleteSituation(r.cr_id)}
                                    className="text-red-400 hover:text-red-300 transition p-2"
                                    title="Delete"
                                >
                                    <FaTrash className="text-xl" />
                                </button>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 pr-20">
                            <p className="text-white"><span className="text-yellow-400">CR ID:</span> {r.cr_id}</p>
                            <p className="text-white"><span className="text-yellow-400">Bus:</span> {r.bus_number}</p>
                            <p className="text-white"><span className="text-yellow-400">Route No:</span> {r.route_no}</p>
                            <p className="text-white"><span className="text-yellow-400">Route:</span> {r.route_name}</p>
                            <p className="text-white"><span className="text-yellow-400">Stop:</span> {r.current_stop}</p>
                            <p className="text-white"><span className="text-yellow-400">Passengers:</span> {r.avg_passengers}</p>
                            <p className="text-white"><span className="text-yellow-400">User ID:</span> {r.user_id}</p>
                            <p className="text-white"><span className="text-yellow-400">User:</span> {r.user_name || 'Unknown'}</p>
                        </div>
                        
                        {/* Show timestamps */}
                        {(r.created_at || r.updated_at) && (
                            <div className="mt-3 text-xs text-gray-400 border-t border-yellow-600/20 pt-2">
                                {r.created_at && (
                                    <span>Created: {new Date(r.created_at).toLocaleString()}</span>
                                )}
                                {r.updated_at && r.updated_at !== r.created_at && (
                                    <span className="ml-4">Updated: {new Date(r.updated_at).toLocaleString()}</span>
                                )}
                            </div>
                        )}
                        
                        {/* Show user badge for own entries (passenger only) */}
                        {passengerView && !ownerView && r.user_id === userId && (
                            <div className="absolute bottom-4 right-4">
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                    Your Report
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}

    {/* Empty state for owners */}
    {ownerView && showResults && results.length === 0 && (
        <div className="max-w-4xl mx-auto bg-black/70 border border-yellow-600/40 rounded-2xl p-12 mt-10 text-center">
            <FaExclamationTriangle className="text-6xl text-yellow-400/30 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">No Situations Reported</h3>
            <p className="text-gray-400">No current situations reported for your buses' ongoing trips today.</p>
        </div>
    )}

    {/* Empty state for passengers */}
    {passengerView && !ownerView && showResults && results.length === 0 && (
        <div className="max-w-4xl mx-auto bg-black/70 border border-yellow-600/40 rounded-2xl p-12 mt-10 text-center">
            <FaExclamationTriangle className="text-6xl text-yellow-400/30 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">No Situations Reported</h3>
            <p className="text-gray-400 mb-6">Be the first to report a situation for this bus</p>
            <button
                onClick={() => setMode("add")}
                className="px-6 py-3 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 inline-flex items-center gap-2"
            >
                <FaPlusCircle /> Report Situation
            </button>
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