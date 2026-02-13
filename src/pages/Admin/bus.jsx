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

  // ADD
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

  // FIND
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
        if (!searchText.trim()) return alert("Enter text to search");
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

  // LOAD FOR EDIT
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

  // UPDATE
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

  // DELETE
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-600 p-6">

      {/* Back */}
      <button
        onClick={() => mode ? setMode(null) : navigate("/admin")}
        className="mt-15 fixed top-6 left-6 z-50 flex items-center gap-2
        bg-white/90 px-4 py-2 rounded-full shadow-lg"
      >
        <FaArrowLeft className="text-emerald-600" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">
        Bus Management
      </h1>

      {/* ACTION BUTTONS */}
      {!mode && (
        <div className="mt-20 flex flex-col items-center gap-5 [&>button]:w-72">
          <ActionBtn icon={<FaPlus />} text="Add Bus" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Bus" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Bus" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrashAlt />} text="Delete Bus" onClick={() => setMode("delete")} />
        </div>
      )}

      {/* FORM */}
      {mode && (
        <div className="flex justify-center mt-20">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-4 capitalize">
              {mode} Bus
            </h2>

            {/* EDIT STEP 1 */}
            {mode === "edit" && !editLoaded && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Enter Bus ID"
                className="w-full p-3 mb-3 border rounded-xl"
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <input
                  name="bus_number"
                  value={form.bus_number}
                  onChange={handleChange}
                  placeholder="Bus Number"
                  className="w-full p-3 mb-3 border rounded-xl"
                />

                <input
                  name="seat_capacity"
                  value={form.seat_capacity}
                  onChange={handleChange}
                  placeholder="Seat Capacity"
                  className="w-full p-3 mb-3 border rounded-xl"
                />

                <select
                  name="route_id"
                  value={form.route_id}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 border rounded-xl"
                >
                  <option value="">Select Route</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.route_name}
                    </option>
                  ))}
                </select>

                {/* STATUS RADIO */}
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

            {/* FIND MODE */}
            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 border rounded-xl"
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
                    className="w-full p-3 mb-3 border rounded-xl"
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search bus number / route"
                    className="w-full p-3 mb-3 border rounded-xl"
                  />
                )}
              </>
            )}

            {/* DELETE */}
            {mode === "delete" && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Bus ID"
                className="w-full p-3 mb-3 border rounded-xl"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl"
              >
                {loading ? "Please wait..." : "Submit"}
              </button>

              <button
                onClick={resetAll}
                className="bg-gray-500 text-white px-6 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RESULTS */}
      {showResults && buses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-10">
          <h2 className="text-xl font-bold mb-6">
            🚌 Bus Results
          </h2>

          <div className="space-y-4">
            {buses.map(b => (
              <div
                key={b.bus_id}
                className="flex justify-between p-4 border rounded-xl hover:shadow-lg transition"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {b.bus_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    Seats: {b.seat_capacity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Route: {b.route_name}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 block mb-1">
                    BID-{b.bus_id}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${b.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
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

    </div>
  );
};

const ActionBtn = ({ icon, text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-3 p-5 bg-white rounded-3xl shadow hover:scale-105 transition"
  >
    <span className="text-emerald-600 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

export default Bus;
