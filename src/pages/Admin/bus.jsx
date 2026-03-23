import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaBus as FaBusIcon,
  FaRoute,
  FaMapMarkerAlt
} from "react-icons/fa";
import { busAPI, busTypeAPI, routeAPI } from "../../services/api";
import ThemeLayout from "../../components/common/Layout/ThemeLayout";
import ActionBtn from "../../components/common/Layout/ActionBtn";
import usePermissions from "../../hooks/usePermissions";

const Bus = (passengerView, onBusSelect) => {
  const navigate = useNavigate();
  const { role, canAdd, canEdit, canDelete } = usePermissions('bus');
  
  // Get onBusClick from outlet context (passed from PassengerLayout)
  const outletContext = useOutletContext();
  const onBusClick = outletContext?.onBusClick || null;
  
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: "",
    bus_number: "",
    seat_capacity: "",
    route_no: "",
    bus_type_id: "",
    status: "active"
  });
  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const [error, setError] = useState("");

  const [busTypes, setBusTypes] = useState([]);

  const loadBusTypes = async () => {
    try {
      const res = await busTypeAPI.getAllBusTypes();
      setBusTypes(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load bus types");
    }
  };

  useEffect(() => {
    loadRoutes();
    loadBusTypes();
    if (role !== 'admin') {
      // For non-admin roles, just show all buses
      findBus('all');
    }
  }, [role]);

  const loadRoutes = async () => {
    try {
      const res = await routeAPI.getAllRoutes();
      setRoutes(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load routes");
    }
  };

  const findBus = async (type = searchType) => {
    try {
      setLoading(true);
      setBuses([]);
      setShowResults(false);
      setError("");

      if (type === "id") {
        if (!form.id) {
          alert("Enter Bus ID");
          return;
        }
        const res = await busAPI.getBusById(form.id);
        if (res.data?.success && res.data?.data) {
          setBuses([res.data.data]);
          setShowResults(true);
        }
      }

      if (type === "all") {
        const res = await busAPI.getAllBuses();
        setBuses(res.data?.data || []);
        setShowResults(true);
      }

      if (type === "text") {
        if (!searchText.trim()) {
          alert("Enter text to search");
          return;
        }
        const res = await busAPI.getBusByText(searchText);
        setBuses(res.data?.data || []);
        setShowResults(true);
      }

    } catch (err) {
      console.error("Find failed:", err);
      setError("Bus not found");
    } finally {
      setLoading(false);
    }
  };

  // For passenger view - just show all buses on load
  useEffect(() => {
    if (role !== 'admin') {
      findBus('all');
    }
  }, []);

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
      bus_type_id: "",
      status: "active"
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addBus = async () => {
    if (!form.bus_number || !form.seat_capacity || !form.route_no) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await busAPI.createBus({
        bus_number: form.bus_number,
        seat_capacity: parseInt(form.seat_capacity),
        route_no: form.route_no,
        bus_type_id: form.bus_type_id || null,
        status: form.status
      });
      alert("✅ Bus added successfully");
      resetAll();
      findBus('all'); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add bus");
    } finally {
      setLoading(false);
    }
  };

  const loadBusForEdit = async () => {
    if (!form.id) return alert("Enter Bus ID");
    try {
      setLoading(true);
      const res = await busAPI.getBusById(form.id);
      const bus = res.data.data;
      setForm({
        id: bus.bus_id,
        bus_number: bus.bus_number,
        seat_capacity: bus.seat_capacity,
        route_no: bus.route_no,
        bus_type_id: bus.bus_type_id || "",
        status: bus.status
      });
      setEditLoaded(true);
      setBuses([bus]);
      setShowResults(true);
    } catch (error) {
      alert("❌ Bus Not Found");
    } finally {
      setLoading(false);
    }
  };

  const updateBus = async () => {
    try {
      setLoading(true);
      await busAPI.updateBus(form.id, {
        bus_number: form.bus_number,
        seat_capacity: parseInt(form.seat_capacity),
        route_no: form.route_no,
        bus_type_id: form.bus_type_id || null,
        status: form.status
      });
      alert("✅ Bus updated");
      const res = await busAPI.getBusById(form.id);
      setBuses([res.data.data]);
      setShowResults(true);
      setEditLoaded(false);
    } catch (err) {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteBus = async () => {
    if (!form.id) return alert("Enter Bus ID");
    if (!window.confirm("Are you sure?")) return;
    
    try {
      setLoading(true);
      await busAPI.deleteBus(form.id);
      alert("✅ Bus deleted");
      resetAll();
      if (searchType === "all") {
        findBus('all');
      }
    } catch (err) {
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

  // Helper function to get bus type name from ID
  const getBusTypeName = (typeId) => {
    const type = busTypes.find(t => t.bus_type_id === typeId);
    return type ? type.type_name : 'N/A';
  };

  // Handle bus click for passenger
  const handleBusCardClick = (bus) => {
    if (passengerView && onBusSelect) {
      onBusSelect(bus);
    } else if (role === 'passenger' && onBusClick) {
      // Create bus object with required fields for the map
      const busForMap = {
        bus_number: bus.bus_number,
        route: bus.route_name,
        route_no: bus.route_no,
        bus_type: bus.type_name || getBusTypeName(bus.bus_type_id),
        current_stop: bus.current_stop || 'Unknown',
        passengers: bus.passengers || Math.floor(Math.random() * 50) + 10,
        last_updated: new Date().toISOString(),
        position: [6.9271 + (Math.random() - 0.5) * 0.1, 79.8612 + (Math.random() - 0.5) * 0.1]
      };
      onBusClick(busForMap);
    }
  };

  return (
    <ThemeLayout pageTitle={role === 'passenger' ? "Live Buses" : "Bus Management"}>
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
          bg-black/60 backdrop-blur-md border border-yellow-600
          text-yellow-400 px-4 py-2 rounded-full
          shadow-[0_0_20px_rgba(255,215,0,0.25)]
          hover:bg-yellow-500 hover:text-black transition duration-300"
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

      {/* Mode Selection - Only show for admin */}
      {!mode && role === 'admin' && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          {canAdd && <ActionBtn icon={<FaPlusCircle />} text="Add Bus" onClick={() => setMode("add")} />}
          <ActionBtn icon={<FaSearch />} text="Find Bus" onClick={() => setMode("find")} />
          {canEdit && <ActionBtn icon={<FaEdit />} text="Update Bus" onClick={() => setMode("edit")} />}
          {canDelete && <ActionBtn icon={<FaTrash />} text="Delete Bus" onClick={() => setMode("delete")} />}
        </div>
      )}

      {/* For passenger/driver/owner - directly show results */}
      {role !== 'admin' && !mode && (
        <div className="mt-10">
          {/* Search/filter for passengers if needed */}
          {role === 'passenger' && (
            <div className="mb-6 flex gap-3">
              <input
                type="text"
                placeholder="Search by bus number or route..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 p-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white"
              />
              <button
                onClick={() => findBus('text')}
                className="px-6 py-3 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition"
              >
                <FaSearch />
              </button>
            </div>
          )}
          
          {/* Show results directly */}
          {buses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buses.map((bus) => (
                <div
                  key={bus.bus_id}
                  onClick={() => handleBusCardClick(bus)}
                  className={`p-4 bg-black/60 border border-yellow-600/30 rounded-xl transition ${
                    role === 'passenger' ? 'cursor-pointer hover:border-yellow-500 hover:scale-[1.02]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FaBusIcon className="text-yellow-400 text-xl" />
                    <h3 className="text-lg font-semibold">{bus.bus_number}</h3>
                  </div>
                  
                  {/* ✅ FIXED: Show bus type name, not ID */}
                  <p className="text-gray-300">
                    Type: {bus.type_name || getBusTypeName(bus.bus_type_id) || 'N/A'}
                  </p>
                  
                  <p className="text-sm text-yellow-300">
                    <FaRoute className="inline mr-1" /> {bus.route_name || 'No route'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Capacity: {bus.seat_capacity} seats
                  </p>
                  {role === 'passenger' && (
                    <>
                      <p className="text-sm text-gray-400">
                        Status: <span className={bus.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                          {bus.status}
                        </span>
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onBusClick && handleBusCardClick(bus);
                          }}
                          className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 flex items-center justify-center gap-2"
                        >
                          <FaMapMarkerAlt className="w-3 h-3" />
                          View on Map
                        </button>
                      </div>
                    </>
                  )}
                  {role === 'driver' && (
                    <div className="mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/driver/current-situation?bus=${bus.bus_number}`);
                        }}
                        className="w-full py-2 bg-yellow-500 text-black rounded-lg text-sm hover:bg-yellow-400"
                      >
                        Update Situation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No buses found</p>
          )}
        </div>
      )}

      {/* Admin CRUD Forms */}
      {mode && role === 'admin' && (
        <div className="flex justify-center mt-20">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">
              {mode} Bus
            </h2>

            {mode === "edit" && !editLoaded && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Enter Bus ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <input
                  name="bus_number"
                  value={form.bus_number}
                  onChange={handleChange}
                  placeholder="Bus Number"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                />

                <input
                  name="seat_capacity"
                  type="number"
                  value={form.seat_capacity}
                  onChange={handleChange}
                  placeholder="Seat Capacity"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                />

                {/* Bus Type Selection */}
                <div className="mb-3">
                  <select
                    name="bus_type_id"
                    value={form.bus_type_id}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                  >
                    <option value="">Select Bus Type</option>
                    {busTypes.map(type => (
                      <option key={type.bus_type_id} value={type.bus_type_id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  name="route_no"
                  value={form.route_no}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                >
                  <option value="">Select Route</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_no}>
                      {r.route_no} - {r.route_name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-6 mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={form.status === "active"}
                      onChange={handleChange}
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
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                >
                  <option value="id">Find by ID</option>
                  <option value="all">Get All Buses</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="Bus ID"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by bus number or route"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
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
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition"
              >
                {loading ? "Please wait..." : 
                  mode === "edit" && !editLoaded ? "Load" : 
                  mode === "edit" && editLoaded ? "Update" :
                  mode === "delete" ? "Delete" : "Submit"}
              </button>

              <button
                onClick={resetAll}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results for admin search */}
      {showResults && role === 'admin' && buses.length > 0 && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">Results ({buses.length})</h2>
          <div className="space-y-4">
            {buses.map(b => (
              <div key={b.bus_id} className="p-4 bg-black/60 border border-yellow-600/30 rounded-xl">
                <p className="text-yellow-400">Bus: {b.bus_number}</p>
                <p className="text-gray-300">Route: {b.route_name}</p>
                {/* ✅ FIXED: Show type name, not ID */}
                <p className="text-gray-300">Type: {b.type_name || getBusTypeName(b.bus_type_id) || 'N/A'}</p>
                <p className="text-gray-300">Capacity: {b.seat_capacity}</p>
                <p className="text-gray-300">Status: {b.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </ThemeLayout>
  );
};

export default Bus;