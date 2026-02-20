import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus,
  FaUserCheck,
  FaUserEdit,
  FaUserTimes,
  FaArrowLeft,
  FaTrash,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import { routeAPI, routeStopAPI } from "../../services/api";
import ThemeLayout from "../../components/Layout/ThemeLayout";

const RouteStop = () => {

  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [localStops, setLocalStops] = useState([]);
  const [editStops, setEditStops] = useState([]);

  const [routeLoaded, setRouteLoaded] = useState(false);
  const [routeName, setRouteName] = useState("");

  const [searchType, setSearchType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [form, setForm] = useState({
    id: "",
    route_id: "",
    stop_name: ""
  });

  /* ================= LOAD ROUTES ================= */

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await routeAPI.getAllRoutes();
        setRoutes(res.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    loadRoutes();
  }, []);

  /* ================= RESET ================= */

  const resetAll = () => {
    setMode(null);
    setStops([]);
    setLocalStops([]);
    setEditStops([]);
    setRouteLoaded(false);
    setRouteName("");
    setSearchText("");
    setShowResults(false);
    setForm({
      id: "",
      route_id: "",
      stop_name: ""
    });
  };

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= ADD MULTIPLE ================= */

  const addLocalStop = () => {
    if (!form.stop_name.trim()) return;
    setLocalStops([...localStops, form.stop_name.trim()]);
    setForm({ ...form, stop_name: "" });
  };

  const removeLocalStop = (index) => {
    const updated = localStops.filter((_, i) => i !== index);
    setLocalStops(updated);
  };

  const saveBulkStops = async () => {
    try {
      if (!form.route_id || localStops.length === 0) {
        alert("Select route and add stops");
        return;
      }

      setLoading(true);

      await routeStopAPI.bulkCreate({
        route_id: form.route_id,
        stops: localStops
      });

      alert("Route Stops added successfully");
      resetAll();

    } catch (error) {
      console.error(error);
      alert("Failed to add stops");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FIND ================= */

  const findStops = async () => {
    try {
      setLoading(true);
      setStops([]);

      const res = await routeStopAPI.getAllRouteStops();
      let data = res.data.data || [];

      if (searchType === "routeId") {
        if (!form.route_id) {
          alert("Enter Route ID");
          return;
        }

        data = data.filter(
          stop => String(stop.route_id) === String(form.route_id)
        );
      }

      if (searchType === "routeName") {
        if (!searchText.trim()) {
          alert("Enter Route Name");
          return;
        }

        data = data.filter(
          stop =>
            stop.route_name &&
            stop.route_name.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setStops(data);
      setShowResults(true);

    } catch (error) {
      console.error(error);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const deleteStop = async () => {
    try {
      if (!form.id) {
        alert("Enter Stop ID");
        return;
      }

      setLoading(true);
      await routeStopAPI.delete(form.id);
      alert("Deleted successfully");

      resetAll();

    } catch (error) {
      console.error(error);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD FOR UPDATE ================= */

  const loadRouteForEdit = async () => {
    try {
      if (!form.route_id) {
        alert("Enter Route ID");
        return;
      }

      setLoading(true);

      const res = await routeStopAPI.getAllRouteStops();
      const filtered = (res.data.data || []).filter(
        stop => String(stop.route_id) === String(form.route_id)
      );

      if (filtered.length === 0) {
        alert("No stops found");
        return;
      }

      const sorted = filtered.sort(
        (a, b) => a.stop_order_id - b.stop_order_id
      );

      setRouteName(sorted[0].route_name);
      setEditStops(sorted);
      setRouteLoaded(true);

    } catch (error) {
      console.error(error);
      alert("Failed to load route");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE HELPERS ================= */

  const changeStopName = (index, value) => {
    const updated = [...editStops];
    updated[index].stop_name = value;
    setEditStops(updated);
  };

  const moveUp = (index) => {
    if (index === 0) return;

    const updated = [...editStops];
    [updated[index - 1], updated[index]] =
      [updated[index], updated[index - 1]];

    setEditStops(updated);
  };

  const moveDown = (index) => {
    if (index === editStops.length - 1) return;

    const updated = [...editStops];
    [updated[index + 1], updated[index]] =
      [updated[index], updated[index + 1]];

    setEditStops(updated);
  };

  const addEditStop = () => {
    if (!form.stop_name.trim()) return;

    const newStop = {
      stop_order_id: Date.now(),
      route_id: form.route_id,
      route_name: routeName,
      stop_name: form.stop_name.trim(),
      status: 1
    };

    setEditStops([...editStops, newStop]);
    setForm({ ...form, stop_name: "" });
  };

  const removeEditStop = (index) => {
    const updated = editStops.filter((_, i) => i !== index);
    setEditStops(updated);
  };

  const saveUpdatedRoute = async () => {
    try {
      setLoading(true);

      await routeStopAPI.bulkUpdate({
        route_id: form.route_id,
        stops: editStops.map((stop, index) => ({
          ...stop,
          stop_order_id: index + 1
        }))
      });

      alert("Route updated successfully");
      resetAll();

    } catch (error) {
      console.error(error);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT SWITCH ================= */

  const handleSubmit = () => {
    if (mode === "add") saveBulkStops();
    if (mode === "find") findStops();
    if (mode === "delete") deleteStop();
  };

  return (
    <ThemeLayout pageTitle="Route Stop Management">

      <button
        type="button"
        onClick={() => mode ? setMode(null) : navigate("/admin")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
        bg-black/60 backdrop-blur-md border border-yellow-600
        text-yellow-400 px-4 py-2 rounded-full
        shadow-[0_0_20px_rgba(255,215,0,0.25)]
        hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaArrowLeft className="text-yellow-400"/>
        <span className="font-semibold text-sm">Back</span>
      </button>

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 [&>button]:w-72">
          <ActionBtn icon={<FaUserPlus />} text="Add Route Stops" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaUserCheck />} text="Find Route Stops" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaUserEdit />} text="Update Route Stops" onClick={() => setMode("update")} />
          <ActionBtn icon={<FaUserTimes />} text="Delete Route Stop" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center h-full mt-20 overflow-hidden">
        <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] p-6 backdrop-blur-md">

            <h2 className="text-xl font-bold mb-4 text-yellow-400 mb-4 capitalize">
              {mode} Route Stop
            </h2>

            {/* ADD */}
            {mode === "add" && (
              <>
                <select
                  name="route_id"
                  value={form.route_id}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                >
                  <option value="">Select Route</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.route_name}
                    </option>
                  ))}
                </select>

                <input
                  name="stop_name"
                  value={form.stop_name}
                  onChange={handleChange}
                  placeholder="Enter Stop Name"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />

                <button
                  onClick={addLocalStop}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)] mb-3"
                >
                  Add Stop
                </button>

                {localStops.map((stop, i) => (
                  <div key={i} className="flex justify-between text-white mb-2">
                    {stop}
                    <button onClick={() => removeLocalStop(i)}>❌</button>
                  </div>
                ))}

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={saveBulkStops}
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
              </>
            )}

            {/* FIND */}
            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                >
                  <option value="all">Get All</option>
                  <option value="routeId">Find by Route ID</option>
                  <option value="routeName">Find by Route Name</option>
                </select>

                {searchType === "routeId" && (
                  <input
                    name="route_id"
                    value={form.route_id}
                    onChange={handleChange}
                    placeholder="Enter Route ID"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                )}

                {searchType === "routeName" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Enter Route Name"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                )}

                <div className="flex gap-3">
                  <button
                    onClick={findStops}
                    disabled={loading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>

                  <button
                    onClick={resetAll}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {mode === "update" && (
              <>
                {!routeLoaded && (
                  <>
                    <input
                      name="route_id"
                      value={form.route_id}
                      onChange={handleChange}
                      placeholder="Enter Route ID"
                      className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={loadRouteForEdit}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                      >
                        {loading ? "Loading..." : "Load Route"}
                      </button>
                      <button
                        onClick={resetAll}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {routeLoaded && (
                  <>
                    <div className="text-yellow-400 mb-4">
                      {form.route_id} - {routeName}
                    </div>

                    <input
                      name="stop_name"
                      value={form.stop_name}
                      onChange={handleChange}
                      placeholder="Add New Stop"
                      className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    />

                    <button
                      onClick={addEditStop}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)] mb-4"
                    >
                      Add New Stop
                    </button>

                    {editStops.map((stop, index) => (
                      <div
                        key={stop.stop_order_id}
                        className="flex items-center gap-3 mb-3 p-2 bg-black/60 border border-yellow-600/30 rounded-xl"
                      >
                        <button onClick={() => moveUp(index)}>
                          <FaArrowUp className="text-yellow-400" />
                        </button>

                        <button onClick={() => moveDown(index)}>
                          <FaArrowDown className="text-yellow-400" />
                        </button>

                        <input
                          value={stop.stop_name}
                          onChange={(e) =>
                            changeStopName(index, e.target.value)
                          }
                          className="flex-1 bg-transparent text-white outline-none"
                        />

                        <button onClick={() => removeEditStop(index)}>
                          <FaTrash className="text-red-400" />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={saveUpdatedRoute}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                      >
                        {loading ? "Saving..." : "Submit"}
                      </button>

                      <button
                        onClick={resetAll}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {mode === "delete" && (
              <>
                <input
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  placeholder="Stop Order ID"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />

                <div className="flex gap-3">
                  <button
                    onClick={deleteStop}
                    disabled={loading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>

                  <button
                    onClick={resetAll}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {showResults && stops.length > 0 && (
        <div className="mt-10 p-6 bg-black/70 border border-yellow-600 rounded-2xl">
          {Object.values(
            stops.reduce((acc, stop) => {
              if (!acc[stop.route_id]) {
                acc[stop.route_id] = {
                  route_id: stop.route_id,
                  route_name: stop.route_name,
                  stops: []
                };
              }
              acc[stop.route_id].stops.push(stop.stop_name);
              return acc;
            }, {})
          ).map(route => (
            <div key={route.route_id} className="mb-6 text-white">
              <h3 className="text-yellow-400 text-lg font-bold mb-2">
                {route.route_id} - {route.route_name}
              </h3>
              <ul className="list-disc list-inside ml-4">
                {route.stops.map((stopName, index) => (
                  <li key={index}>{stopName}</li>
                ))}
              </ul>
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
    className="mt-2 flex items-center gap-3 p-5 bg-black/70 border border-yellow-600 rounded-3xl 
      shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:bg-black/50 hover:scale-105 transition text-white"
  >
    <span className="text-yellow-400 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

export default RouteStop;
