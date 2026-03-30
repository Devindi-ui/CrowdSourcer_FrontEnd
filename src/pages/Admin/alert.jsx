import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FaPlusCircle, FaSearch, FaEdit, FaTrash, FaArrowLeft,
    FaExclamationTriangle, FaBell, FaUser, FaBus, FaChevronLeft
} from "react-icons/fa";
import ThemeLayout from "../../components/common/Layout/ThemeLayout";
import { alertAPI, busAPI, userAPI } from "../../services/api";

const Alert = ({ 
    passengerView = false,
    userId = null,
    busId = null,
    busNumber = null,
    routeNo = null,
    routeName = null
}) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [editLoaded, setEditLoaded] = useState(false);
    const [buses, setBuses] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchType, setSearchType] = useState("id");
    const [searchText, setSearchText] = useState("");

    const [form, setForm] = useState({
        alert_id: "",
        alert_type: "",
        description: "",
        bus_number: "",
        user_id: "",
        avg_passengers: ""
    });

    // Load buses and users for admin view
    useEffect(() => {
        if (!passengerView) {
            const loadData = async () => {
                try {
                    const busRes = await busAPI.getAllBuses();
                    setBuses(busRes.data.data);
                    const userRes = await userAPI.getAllUsers();
                    setUsers(userRes.data.data);
                } catch {}
            };
            loadData();
        }
    }, [passengerView]);

    // Auto-fill form for passenger view
    useEffect(() => {
        if (passengerView && busId && userId) {
            console.log("🟢 Alert received props:", {
                busId,
                busNumber,
                routeNo,
                routeName,
                userId
            });
            
            // Pre-fill the form with bus and user data
            setForm(prev => ({
                ...prev,
                bus_number: busNumber || '',
                user_id: userId
            }));
        }
    }, [passengerView, busId, busNumber, userId, routeNo, routeName]);

    // Load alerts for passenger view
    useEffect(() => {
        if (passengerView && busId) {
            console.log("🟢 Loading alerts for bus:", busId);
            loadAlertsForBus();
        }
    }, [passengerView, busId]);

    const resetAll = () => {
        setMode(null);
        setAlerts([]);
        setShowResults(false);
        setEditLoaded(false);
        setSearchText("");
        setForm({
            alert_id: "",
            alert_type: "",
            description: "",
            bus_number: passengerView ? (busNumber || '') : "",
            user_id: passengerView ? (userId || '') : "",
            avg_passengers: ""
        });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Load alerts filtered by bus (for passenger view)
    const loadAlertsForBus = async () => {
    try {
        setLoading(true);
        console.log("Loading alerts for bus number:", busNumber);
        
        const res = await alertAPI.getAllAlerts();
        console.log("All alerts response:", res);
        
        let allAlerts = res.data?.data || [];
        console.log("Total alerts:", allAlerts.length);
        
        // Filter by bus number
        if (busNumber) {
            allAlerts = allAlerts.filter(alert => alert.bus_number === busNumber);
            console.log(`Filtered to ${allAlerts.length} alerts for bus ${busNumber}`);
        }
        
        // Update state with new array to trigger re-render
        setAlerts([...allAlerts]);
        setShowResults(true);
        
        console.log("✅ Alerts state updated with", allAlerts.length, "items");
        
    } catch (error) {
        console.error("Failed to load alerts", error);
    } finally {
        setLoading(false);
    }
  };

    const createAlert = async () => {
      try {
          setLoading(true);
          
          // For passenger view, use props for validation
          if (passengerView) {
              if (!userId || !busNumber) {
                  alert("Missing user or bus information");
                  return;
              }
              if (!form.alert_type || !form.alert_type.trim()) {
                  alert("Please enter alert type");
                  return;
              }
              if (!form.description || !form.description.trim()) {
                  alert("Please enter description");
                  return;
              }
          } else {
              // Admin validation
              if (!form.alert_type || !form.description || !form.bus_number || !form.user_id) {
                  alert("Please fill all fields");
                  return;
              }
          }
          
          // Build data based on view
          const alertData = passengerView ? {
              alert_type: form.alert_type,
              description: form.description,
              bus_number: busNumber,
              user_id: parseInt(userId),
              avg_passengers: form.avg_passengers ? parseInt(form.avg_passengers) : 0
          } : {
              alert_type: form.alert_type,
              description: form.description,
              bus_number: form.bus_number,
              user_id: parseInt(form.user_id),
              avg_passengers: form.avg_passengers ? parseInt(form.avg_passengers) : 0
          };
          
          console.log("Sending alert data:", alertData);
          
          const response = await alertAPI.create(alertData);
          console.log("Response:", response);
          
          // ✅ FIXED: Check for success in multiple ways
          const isSuccess = response.data?.success === true || 
                          response.data?.msg === 'Alert created successfully' ||
                          response.status === 201 ||
                          response.status === 200;
          
          if (isSuccess) {
              alert("✅ Alert added successfully");
              
              // Reset form and close mode
              setForm({
                  alert_id: "",
                  alert_type: "",
                  description: "",
                  bus_number: passengerView ? (busNumber || '') : "",
                  user_id: passengerView ? (userId || '') : "",
                  avg_passengers: ""
              });
              setMode(null);
              
              // Refresh the list
              if (passengerView) {
                  await loadAlertsForBus();
              } else {
                  const res = await alertAPI.getAllAlerts();
                  setAlerts(res.data.data);
                  setShowResults(true);
              }
          } else {
              // If the response doesn't have success flag but we got data, it might still be success
              if (response.data?.data || response.data?.alert_id) {
                  console.log("Alert created successfully despite no success flag");
                  alert("✅ Alert added successfully");
                  
                  setForm({
                      alert_id: "",
                      alert_type: "",
                      description: "",
                      bus_number: passengerView ? (busNumber || '') : "",
                      user_id: passengerView ? (userId || '') : "",
                      avg_passengers: ""
                  });
                  setMode(null);
                  
                  if (passengerView) {
                      await loadAlertsForBus();
                  } else {
                      const res = await alertAPI.getAllAlerts();
                      setAlerts(res.data.data);
                      setShowResults(true);
                  }
              } else {
                  alert("❌ " + (response.data?.message || "Failed to create alert"));
              }
          }
          
      } catch (err) {
          console.error("Create alert error:", err);
          
          // Check if the error is actually a success (sometimes API returns error but actually worked)
          if (err.response && err.response.status === 201) {
              console.log("✅ Actually succeeded despite error!");
              alert("✅ Alert added successfully");
              
              setForm({
                  alert_id: "",
                  alert_type: "",
                  description: "",
                  bus_number: passengerView ? (busNumber || '') : "",
                  user_id: passengerView ? (userId || '') : "",
                  avg_passengers: ""
              });
              setMode(null);
              
              if (passengerView) {
                  await loadAlertsForBus();
              }
          } else {
              const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to create alert";
              alert("❌ " + errorMsg);
          }
      } finally {
          setLoading(false);
      }
  };

    const findAlert = async () => {
        try {
            setLoading(true);
            setShowResults(false);
            if (searchType === "id") {
                if (!form.alert_id) return alert("Enter Alert ID");
                const res = await alertAPI.getAlertById(form.alert_id);
                setAlerts(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
            }
            if (searchType === "all") {
                const res = await alertAPI.getAllAlerts();
                setAlerts(res.data.data);
            }
            if (searchType === "text") {
                if (!searchText.trim()) return alert("Enter search text");
                const res = await alertAPI.getAlertByText(searchText);
                setAlerts(res.data.data);
            }
            setShowResults(true);
        } catch {
            alert("Alert not found");
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadForEdit = async () => {
        if (!form.alert_id) return alert("Enter Alert ID");
        try {
            setLoading(true);
            const res = await alertAPI.getAlertById(form.alert_id);
            const data = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
            setForm({
                alert_id: data.alert_id,
                alert_type: data.alert_type,
                description: data.description,
                bus_number: data.bus_number,
                user_id: data.user_id,
                avg_passengers: data.avg_passengers
            });
            setAlerts([data]);
            setShowResults(true);
            setEditLoaded(true);
        } catch {
            alert("Alert not found");
        } finally {
            setLoading(false);
        }
    };

    const updateAlert = async () => {
    try {
        setLoading(true);
        
        const updateData = {
            alert_type: form.alert_type,
            description: form.description,
            bus_number: form.bus_number,
            user_id: form.user_id,
            avg_passengers: form.avg_passengers
        };
        
        console.log("Updating alert:", form.alert_id, updateData);
        
        const response = await alertAPI.updateAlert(form.alert_id, updateData);
        console.log("Update response:", response);
        
        const isSuccess = response.data?.success === true || 
                         response.status === 200 ||
                         response.status === 201;
        
        if (isSuccess) {
            alert("✅ Alert updated successfully");
            resetAll();
            setMode(null);
            
            // Refresh alerts for passenger view
            if (passengerView) {
                await loadAlertsForBus();
            } else {
                const res = await alertAPI.getAllAlerts();
                setAlerts(res.data.data);
                setShowResults(true);
            }
        } else {
            alert("❌ " + (response.data?.message || "Update failed"));
        }
        
    } catch (err) {
        console.error("Update alert error:", err);
        
        if (err.response && err.response.status === 200) {
            alert("✅ Alert updated successfully");
            resetAll();
            setMode(null);
            if (passengerView) {
                await loadAlertsForBus();
            }
        } else {
            alert("❌ Update failed");
        }
    } finally {
        setLoading(false);
    }
  };

    const deleteAlert = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    
    const alertId = id || form.alert_id;
    if (!alertId) return alert("Enter Alert ID");
    
    try {
        setLoading(true);
        console.log("Deleting alert:", alertId);
        
        const response = await alertAPI.deleteAlert(alertId);
        console.log("Delete response:", response);
        
        // Remove from local state immediately (optimistic update)
        setAlerts(prev => prev.filter(a => a.alert_id !== alertId));
        
        alert("✅ Alert deleted");
        
        // Refresh from server to be sure
        if (passengerView) {
            await loadAlertsForBus();
        } else {
            const res = await alertAPI.getAllAlerts();
            setAlerts(res.data.data);
        }
        
        resetAll();
        
    } catch (error) {
        console.error("Delete failed:", error);
        
        // If API call failed but we already removed from UI, reload to fix
        if (passengerView) {
            await loadAlertsForBus();
        }
        alert("❌ Failed to delete alert");
    } finally {
        setLoading(false);
    }
  };

    const handleSubmit = () => {
        if (mode === "add") createAlert();
        if (mode === "find") findAlert();
        if (mode === "edit" && !editLoaded) loadForEdit();
        else if (mode === "edit") updateAlert();
        if (mode === "delete") deleteAlert();
    };

    return (
        <ThemeLayout>
            
            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                  if (mode) {
                      setMode(null);
                      resetAll();
                  } else {
                      navigate(-1);
                  }
              }}
              className="mx-2 fixed top-6 z-50 flex items-center gap-2 mt-15
              bg-black/60 backdrop-blur-md border border-yellow-600
              text-yellow-400 px-4 py-2 rounded-full 
              shadow-[0_0_20px_rgba(255,215,0,0.25)]
              hover:bg-yellow-500 hover:text-black transition duration-300"
          >
              <FaChevronLeft />
          </button>

            {/* Action Buttons */}
            {!mode && (
                <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
                    <ActionBtn icon={<FaPlusCircle />} text="Add Alert" onClick={() => setMode("add")} />
                    
                    {/* Only show these for admin view */}
                    {!passengerView && (
                        <>
                            <ActionBtn icon={<FaSearch />} text="Find Alert" onClick={() => setMode("find")} />
                            <ActionBtn icon={<FaEdit />} text="Update Alert" onClick={() => setMode("edit")} />
                            <ActionBtn icon={<FaTrash />} text="Delete Alert" onClick={() => setMode("delete")} />
                        </>
                    )}
                </div>
            )}

            {/* Add/Edit Form */}
            {mode && (
                <div className="flex justify-center mt-20">
                    <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl p-6">

                        <h2 className="text-xl font-bold mb-4 text-yellow-400 capitalize">
                            {mode} Alert
                        </h2>

                        {(mode === "add" || (mode === "edit" && editLoaded)) && (
                            <>
                                {/* Alert Type */}
                                <input
                                    name="alert_type"
                                    value={form.alert_type}
                                    onChange={handleChange}
                                    placeholder="Alert Type (e.g., Traffic, Delay, Accident)"
                                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                                />
                                
                                {/* Description */}
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Description"
                                    rows="3"
                                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                                />
                                
                                {/* Bus Number - Auto-filled for passengers */}
                                {passengerView ? (
                                    <input
                                        value={busNumber || ''}
                                        readOnly
                                        placeholder="Bus Number (Auto-filled)"
                                        className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                                    />
                                ) : (
                                    <select
                                        name="bus_number"
                                        value={form.bus_number}
                                        onChange={handleChange}
                                        className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                                    >
                                        <option value="">Select Bus</option>
                                        {buses.map(b => (
                                            <option key={b.bus_id} value={b.bus_number}>
                                                {b.bus_number}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                
                                {/* User ID - Auto-filled for passengers */}
                                {passengerView ? (
                                    <input
                                        value={userId || ''}
                                        readOnly
                                        placeholder="User ID (Auto-filled)"
                                        className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                                    />
                                ) : (
                                    <select
                                        name="user_id"
                                        value={form.user_id}
                                        onChange={handleChange}
                                        className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                                    >
                                        <option value="">Select User</option>
                                        {users.map(u => (
                                            <option key={u.user_id} value={u.user_id}>
                                                {u.name} (ID:{u.user_id})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                
                                {/* Average Passengers */}
                                <input
                                    name="avg_passengers"
                                    type="number"
                                    value={form.avg_passengers}
                                    onChange={handleChange}
                                    placeholder="Average Passengers"
                                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                                    min="0"
                                />
                            </>
                        )}

                        {mode === "find" && (
                            <>
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                                >
                                    <option value="id">Find by ID</option>
                                    <option value="all">Get All</option>
                                    <option value="text">Search by Text</option>
                                </select>
                                {searchType === "id" && (
                                    <input
                                        name="alert_id"
                                        value={form.alert_id}
                                        onChange={handleChange}
                                        placeholder="Alert ID"
                                        className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                                    />
                                )}
                                {searchType === "text" && (
                                    <input
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        placeholder="Search text..."
                                        className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                                    />
                                )}
                            </>
                        )}

                        {mode === "edit" && !editLoaded && (
                            <input
                                name="alert_id"
                                value={form.alert_id}
                                onChange={handleChange}
                                placeholder="Enter Alert ID"
                                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                            />
                        )}

                        {mode === "delete" && !passengerView && (
                            <input
                                name="alert_id"
                                value={form.alert_id}
                                onChange={handleChange}
                                placeholder="Alert ID"
                                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                            />
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold"
                            >
                                {loading ? "Please wait..." : 
                                 mode === "delete" ? "Delete" : "Submit"}
                            </button>
                            <button
                                onClick={() => {
                                    setMode(null);
                                    resetAll();
                                }}
                                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Results Display */}
            {showResults && alerts.length > 0 && (
                <div className="max-w-4xl mx-auto bg-black/70 border border-yellow-600/40 rounded-2xl p-6 mt-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-yellow-400">
                            {passengerView 
                                ? `Alerts for Bus ${busNumber || ''}` 
                                : "Alert Results"} 
                            <span className="ml-2 text-sm text-gray-400">
                                ({alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'})
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <div
                                key={alert.alert_id}
                                className="p-4 rounded-xl border border-yellow-600/30 bg-black/60 relative"
                            >
                                {/* Edit/Delete buttons - only for own alerts in passenger view */}
                                {passengerView && alert.user_id === userId && (
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setForm({
                                                    alert_id: alert.alert_id,
                                                    alert_type: alert.alert_type,
                                                    description: alert.description,
                                                    bus_number: alert.bus_number,
                                                    user_id: alert.user_id,
                                                    avg_passengers: alert.avg_passengers
                                                });
                                                setMode("edit");
                                                setEditLoaded(true);
                                            }}
                                            className="text-blue-400 hover:text-blue-300 transition p-2"
                                            title="Edit"
                                        >
                                            <FaEdit className="text-xl" />
                                        </button>
                                        <button
                                            onClick={() => deleteAlert(alert.alert_id)}
                                            className="text-red-400 hover:text-red-300 transition p-2"
                                            title="Delete"
                                        >
                                            <FaTrash className="text-xl" />
                                        </button>
                                    </div>
                                )}
                                
                                <div className="flex items-start gap-3 pr-20">
                                    <div className="p-2 bg-yellow-500/20 rounded-full">
                                        <FaExclamationTriangle className="text-yellow-400 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-yellow-400">{alert.alert_type}</span>
                                            <span className="text-xs text-gray-500">Alert #{alert.alert_id}</span>
                                        </div>
                                        <p className="text-white text-sm mb-2">{alert.description}</p>
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <FaBus className="text-yellow-400/70" /> Bus: {alert.bus_number}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaUser className="text-yellow-400/70" /> User: {alert.user_name || alert.user_id}
                                            </span>
                                            {alert.avg_passengers > 0 && (
                                                <span>🚶 Passengers: {alert.avg_passengers}</span>
                                            )}
                                        </div>
                                        {alert.created_at && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Posted: {new Date(alert.created_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* User badge for own alerts */}
                                {passengerView && alert.user_id === userId && (
                                    <div className="absolute bottom-4 right-4">
                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                            Your Alert
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State for Passengers */}
            {passengerView && showResults && alerts.length === 0 && (
                <div className="max-w-4xl mx-auto bg-black/70 border border-yellow-600/40 rounded-2xl p-12 mt-10 text-center">
                    <FaBell className="text-6xl text-yellow-400/30 mx-auto mb-4" />
                    <h3 className="text-xl text-white mb-2">No Alerts Reported</h3>
                    <p className="text-gray-400 mb-6">Be the first to report an alert for this bus</p>
                    <button
                        onClick={() => setMode("add")}
                        className="px-6 py-3 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 inline-flex items-center gap-2"
                    >
                        <FaPlusCircle /> Report Alert
                    </button>
                </div>
            )}

        </ThemeLayout>
    );
};

const ActionBtn = ({ icon, text, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3 p-5 bg-black/70 border border-yellow-600 rounded-3xl 
        shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:bg-black/50 hover:scale-105 transition text-white w-full"
    >
        <span className="text-yellow-400 text-2xl">{icon}</span>
        <span className="text-lg">{text}</span>
    </button>
);

export default Alert;