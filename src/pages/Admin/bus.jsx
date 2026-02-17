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
    route_id: "",
    status: "active"
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);

  /* LOAD ROUTES */
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await routeAPI.getAllRoutes();
        setRoutes(res.data.data);
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
    setForm({
      id: "",
      bus_number: "",
      seat_capacity: "",
      route_id: "",
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
      route_id: b.route_id,
      status: b.status
    });
    setEditLoaded(true);
  };

  /* API ACTIONS */

  const addBus = async () => {
    try {
      setLoading(true);
      await busAPI.createBus({
        bus_number: form.bus_number,
        seat_capacity: form.seat_capacity,
        route_id: form.route_id,
        status: form.status
      });
      alert("✅ Bus added successfully");
      resetAll();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add bus");
    } finally {
      setLoading(false);
    }
  };

  const findBus = async () => {
    try {
      setLoading(true);
      setBuses([]);
      setShowResults(false);

      if (searchType === "id") {
        if (!form.id) return alert("Enter Bus ID");
        const res = await busAPI.getBusById(form.id);
        setBuses([res.data.data]);
      }

      if (searchType === "all") {
        const res = await busAPI.getAllBuses();
        setBuses(res.data.data);
      }

      if (searchType === "text") {
        if (!searchText.trim()) 
          return alert("Enter text to search");
        
        const res = await busAPI.getBusByText(searchText);
        setBuses(res.data.data || []);
      }

      setShowResults(true);

    } catch (err) {
      alert("❌ Bus not found");
    } finally {
      setLoading(false);
    }
  };

  const loadBusForEdit = async () => {
    if (!form.id) return alert("Enter Bus ID");
    try {
      setLoading(true);
      const res = await busAPI.getBusById(form.id);
      populateFormFromBus(res.data.data);
      setBuses([res.data.data]);
      setShowResults(true);
    } catch {
      alert("❌ Bus not found");
    } finally {
      setLoading(false);
    }
  };

  const updateBus = async () => {
    try {
      setLoading(true);

      await busAPI.updateBus(form.id, {
        bus_number: form.bus_number,
        seat_capacity: form.seat_capacity,
        route_id: form.route_id,
        status: form.status
      });

      alert("✅ Bus updated");

      const res = await busAPI.getBusById(form.id);
      setBuses([res.data.data]);
      setShowResults(true);

    } catch {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteBus = async () => {
    try {
      setLoading(true);
      await busAPI.deleteBus(form.id);
      alert("✅ Bus deleted");

      const res = await busAPI.getAllBuses();
      setBuses(res.data.data);
      setShowResults(true);

    } catch {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addBus();
    if (mode === "find") findBus();
    if (mode === "edit" && !editLoaded) loadBusForEdit();
    else if (mode === "edit") updateBus();
    if (mode === "delete") deleteBus();
  };

  return (
    <ThemeLayout pageTitle="Bus Management">
      <button
        onClick={() => mode ? setMode(null) : navigate("/admin")}
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
                />

                <input
                  name="seat_capacity"
                  value={form.seat_capacity}
                  onChange={handleChange}
                  placeholder="Seat Capacity"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />

                <select
                  name="route_id"
                  value={form.route_id}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                >
                  <option value="">Select Route</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.route_name}
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
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search bus number / route"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
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
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              >
                {loading ? "Please wait..." : "Submit"}
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

      {showResults && buses.length > 0 && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10 backdrop-blur-md">

          <h2 className="text-xl font-bold mb-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            🚌 Bus Results
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
                  <p className="text-sm text-yellow-300">Route: {b.route_name}</p>
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
