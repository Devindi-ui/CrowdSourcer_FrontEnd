// frontend/src/pages/Admin/CurrentSituation.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";
import { currentSituationAPI, busAPI, routeAPI, userAPI, routeStopAPI } from "../../services/api";
import ThemeLayout from "../../components/Layout/ThemeLayout";

const CurrentSituation = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    cr_id: "",
    bus_id: "",
    user_id: "",
    route_id: "",
    current_stop: "",
    avg_passengers: "",
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [currentSituations, setCurrentSituations] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [routeStops, setRouteStops] = useState([]);
  const [filteredStops, setFilteredStops] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [busRes, routeRes, userRes] = await Promise.all([
          busAPI.getAllBuses(),
          routeAPI.getAllRoutes(),
          userAPI.getAllUsers()
        ]);
        setBuses(busRes.data.data);
        setRoutes(routeRes.data.data);
        setUsers(userRes.data.data);
      } catch (err) {
        console.error("Failed to load dropdown data");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (form.route_id) {
      const loadStops = async () => {
        try {
          const res = await routeStopAPI.getStopsByRoute(form.route_id);
          setRouteStops(res.data.data);
          setFilteredStops(res.data.data);
        } catch (err) {
          setRouteStops([]);
          setFilteredStops([]);
        }
      };
      loadStops();
    } else {
      setRouteStops([]);
      setFilteredStops([]);
    }
  }, [form.route_id]);

  const resetAll = () => {
    setMode(null);
    setCurrentSituations([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);
    setForm({
      cr_id: "",
      bus_id: "",
      user_id: "",
      route_id: "",
      current_stop: "",
      avg_passengers: "",
    });
  };

  const handleChange = (e) => {
    if (e.target.name === "avg_passengers") {
      const val = e.target.value.replace(/\D/, "");
      setForm({ ...form, [e.target.name]: val });
    } else if (e.target.name === "current_stop") {
      setForm({ ...form, [e.target.name]: e.target.value });
      const filtered = routeStops.filter(s =>
        s.stop_name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredStops(filtered);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const populateFormFromCurrentSituation = (cs) => {
    setForm({
      cr_id: cs.cr_id,
      bus_id: cs.bus_id,
      user_id: cs.user_id,
      route_id: cs.route_id,
      current_stop: cs.current_stop,
      avg_passengers: cs.avg_passengers,
    });
    setEditLoaded(true);
  };

  const addCurrentSituation = async () => {
    try {
      setLoading(true);
      await currentSituationAPI.create({
        bus_id: form.bus_id,
        user_id: form.user_id,
        route_id: form.route_id,
        current_stop: form.current_stop,
        avg_passengers: form.avg_passengers,
        status: 1,
      });
      alert("✅ Current Situation added successfully");
      resetAll();
    } catch (err) {
      alert("❌ Failed to add Current Situation");
    } finally {
      setLoading(false);
    }
  };

  const findCurrentSituation = async () => {
    try {
      setLoading(true);
      setCurrentSituations([]);
      setShowResults(false);
      setMode("find");

      if (searchType === "id") {
        if (!form.cr_id) return alert("Enter Current Situation ID");
        const res = await currentSituationAPI.getById(form.cr_id);
        setCurrentSituations([res.data.data]);
        setShowResults(true);
      }

      if (searchType === "all") {
        const res = await currentSituationAPI.getAll();
        setCurrentSituations(res.data.data);
        setShowResults(true);
      }

      if (searchType === "text") {
        if (!searchText.trim()) return alert("Enter text to search");
        const res = await currentSituationAPI.getByText(searchText);
        setCurrentSituations(res.data.data || []);
        setShowResults(true);
      }
    } catch (err) {
      alert("❌ Current Situation not found");
      setCurrentSituations([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const loadForEdit = async () => {
    if (!form.cr_id) return alert("Enter Current Situation ID");
    try {
      setLoading(true);
      const res = await currentSituationAPI.getById(form.cr_id);
      populateFormFromCurrentSituation(res.data.data);
      setCurrentSituations([res.data.data]);
      setShowResults(true);
    } catch (err) {
      alert("❌ Current Situation not found");
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentSituation = async () => {
    try {
      setLoading(true);
      await currentSituationAPI.update(form.cr_id, {
        bus_id: form.bus_id,
        user_id: form.user_id,
        route_id: form.route_id,
        current_stop: form.current_stop,
        avg_passengers: form.avg_passengers,
      });
      alert("✅ Current Situation updated");
      const res = await currentSituationAPI.getById(form.cr_id);
      setCurrentSituations([res.data.data]);
      setShowResults(true);
    } catch (err) {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteCurrentSituation = async () => {
    if (!form.cr_id) return alert("Enter Current Situation ID");
    try {
      setLoading(true);
      await currentSituationAPI.delete(form.cr_id);
      alert("✅ Current Situation deleted");
      const res = await currentSituationAPI.getAll();
      setCurrentSituations(res.data.data);
      setShowResults(true);
    } catch (err) {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addCurrentSituation();
    if (mode === "find") findCurrentSituation();
    if (mode === "edit" && !editLoaded) loadForEdit();
    else if (mode === "edit") updateCurrentSituation();
    if (mode === "delete") deleteCurrentSituation();
  };

  const getUserName = (uid) => {
    const u = users.find(user => user.user_id === uid);
    return u ? `${u.name} (ID-${u.user_id})` : uid;
  };

  const getRouteName = (rid) => {
    const r = routes.find(route => route.route_id === rid);
    return r ? `${r.route_name} (ID-${r.route_id})` : rid;
  };

  const getBusNumber = (bid) => {
    const b = buses.find(bus => bus.bus_id === bid);
    return b ? b.bus_number : bid;
  };

  return (
    <ThemeLayout pageTitle="Current Situations Management">
      <button
        type="button"
        onClick={() => { if (mode) setMode(null); else navigate("/admin"); }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15 bg-black/60 backdrop-blur-md border border-yellow-600 text-yellow-400 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaArrowLeft className="text-yellow-400" />
        <span className="font-semibold text-sm">Back</span>
      </button>

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlusCircle />} text="Add Current Situation" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Current Situation" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Current Situation" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Current Situation" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center h-full mt-20 overflow-hidden">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] p-6 backdrop-blur-md">
            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">{mode} Current Situation</h2>

            {mode === "edit" && !editLoaded && (
              <input
                name="cr_id"
                value={form.cr_id}
                onChange={handleChange}
                placeholder="Enter Current Situation ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <select name="bus_id" value={form.bus_id} onChange={handleChange} className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none">
                  <option value="">Select Bus</option>
                  {buses.map(b => <option key={b.bus_id} value={b.bus_id}>{b.bus_number}</option>)}
                </select>

                <input name="user_id" value={form.user_id} onChange={handleChange} placeholder="User ID" className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none" />

                <select name="route_id" value={form.route_id} onChange={handleChange} className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none">
                  <option value="">Select Route</option>
                  {routes.map(r => <option key={r.route_id} value={r.route_id}>{r.route_name}</option>)}
                </select>

                <input name="current_stop" value={form.current_stop} onChange={handleChange} list="stopOptions" placeholder="Current Stop" className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none" />
                <datalist id="stopOptions">
                  {filteredStops.map(s => <option key={s.stop_id} value={s.stop_name} />)}
                </datalist>

                <input name="avg_passengers" value={form.avg_passengers} onChange={handleChange} placeholder="Average Passengers" className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none" />
              </>
            )}

            {mode === "find" && (
              <>
                <select value={searchType} onChange={e => setSearchType(e.target.value)} className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none">
                  <option value="id">Find by ID</option>
                  <option value="all">Get All</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && <input name="cr_id" value={form.cr_id} onChange={handleChange} placeholder="Current Situation ID" className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none" />}
                {searchType === "text" && <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search user ID, route, bus, stop, avg passengers" className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none" />}
              </>
            )}

            {mode === "delete" && <input name="cr_id" value={form.cr_id} onChange={handleChange} placeholder="Current Situation ID" className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none" />}

            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)]">{loading ? "Please wait..." : "Submit"}</button>
              <button onClick={resetAll} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showResults && currentSituations.length > 0 && (
        <div className="overflow-x-auto mt-10">
          <table className="min-w-full bg-black/70 border border-yellow-600/40 rounded-2xl text-white text-left">
            <thead className="bg-yellow-600/20 text-yellow-400">
              <tr>
                <th className="px-4 py-2">CR ID</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Route</th>
                <th className="px-4 py-2">Bus</th>
                <th className="px-4 py-2">Current Stop</th>
                <th className="px-4 py-2">Avg Passengers</th>
              </tr>
            </thead>
            <tbody>
              {currentSituations.map((cs, idx) => (
                <tr key={cs.cr_id} className={idx % 2 === 0 ? "bg-black/50" : "bg-black/60"}>
                  <td className="px-4 py-2">{cs.cr_id}</td>
                  <td className="px-4 py-2">{getUserName(cs.user_id)}</td>
                  <td className="px-4 py-2">{getRouteName(cs.route_id)}</td>
                  <td className="px-4 py-2">{getBusNumber(cs.bus_id)}</td>
                  <td className="px-4 py-2">{cs.current_stop}</td>
                  <td className="px-4 py-2">{cs.avg_passengers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ThemeLayout>
  );
};

const ActionBtn = ({ icon, text, onClick }) => (
  <button type="button" onClick={onClick} className="mt-2 flex items-center gap-3 p-5 bg-black/70 border border-yellow-600 rounded-3xl shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:bg-black/50 hover:scale-105 transition text-white">
    <span className="text-yellow-400 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

export default CurrentSituation;
