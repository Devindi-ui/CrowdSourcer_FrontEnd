import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";

import { crowdReportAPI, busAPI, tripAPI } from "../../services/api";

const CrowdReport = () => {

  const navigate = useNavigate();

  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    report_id: "",
    bus_id: "",
    trip_id: "",
    current_count: "",
    crowd_status: "Medium"
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [reports, setReports] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);

  const [buses, setBuses] = useState([]);
  const [uniqueRoutes, setUniqueRoutes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const busRes = await busAPI.getAllBuses();
        setBuses(busRes.data.data || []);

        const tripRes = await tripAPI.getAllTrips();
        const tripData = tripRes.data.data || [];

        const routeMap = {};
        tripData.forEach((t) => {
          if (!routeMap[t.route_name]) {
            routeMap[t.route_name] = t;
          }
        });

        setUniqueRoutes(Object.values(routeMap));

      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  const resetAll = () => {
    setMode(null);
    setSearchType("id");
    setSearchText("");
    setReports([]);
    setShowResults(false);
    setEditLoaded(false);
    setForm({
      report_id: "",
      bus_id: "",
      trip_id: "",
      current_count: "",
      crowd_status: "Medium"
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addReport = async () => {
    try {
      setLoading(true);

      await crowdReportAPI.createCrowdReport({
        bus_id: form.bus_id,
        trip_id: form.trip_id,
        current_count: form.current_count,
        crowd_status: form.crowd_status
      });

      alert("✅ Crowd Report added successfully");
      resetAll();

    } catch {
      alert("❌ Failed to add Crowd Report");
    } finally {
      setLoading(false);
    }
  };

  const findReport = async () => {
    try {
      setLoading(true);
      setReports([]);
      setShowResults(false);

      let res;

      if (searchType === "id") {
        if (!form.report_id) return alert("Enter Report ID");

        res = await crowdReportAPI.getCrowdReportById(form.report_id);

        if (!res.data || !res.data.data) {
          alert("Report not found");
          return;
        }
        setReports([res.data.data]);
      }

      if (searchType === "all") {
        res = await crowdReportAPI.getAllCrowdReports();
        setReports(res.data.data || []);
      }

      if (searchType === "text") {
        if (!searchText.trim())
          return alert("Enter text to search");

        res = await crowdReportAPI.getCrowdReportByText(searchText);

        if (!res.data || !res.data.data) {
          alert ("No matching reports");
          return;
        }
        setReports(res.data.data || []);
      }

      setShowResults(true);

    } catch {
      alert("❌ Crowd Report not found");
      setReports([]);
      setShowResults(false); 
    } finally {
      setLoading(false);
    }
  };

  const loadReportForEdit = async () => {
    if (!form.report_id) return alert("Enter Report ID");

    try {
      setLoading(true);

      const res = await crowdReportAPI.getCrowdReportById(form.report_id);

      if (!res.data || !res.data.data) {
        alert("Report not found");
        return;
      }
      const r = res.data.data;

      setForm({
        report_id: r.report_id,
        bus_id: r.bus_id,
        trip_id: r.trip_id,
        current_count: r.current_count,
        crowd_status: r.crowd_status
      });

      setEditLoaded(true);

    } catch {
      alert("❌ Crowd Report not found");
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async () => {
    try {
      setLoading(true);

      await crowdReportAPI.updateCrowdReport(form.report_id, {
        bus_id: form.bus_id,
        trip_id: form.trip_id,
        current_count: form.current_count,
        crowd_status: form.crowd_status
      });

      alert("✅ Crowd Report updated");

      const res = await crowdReportAPI.getCrowdReportById(form.report_id);

      if (res.data && res.data.data) {
        setReports([res.data.data]);
        setShowResults(true);
      }

      setEditLoaded(false);

    } catch {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async () => {
    if (!form.report_id) return alert("Enter Report ID");

    try {
      setLoading(true);

      await crowdReportAPI.deleteCrowdReport(form.report_id);
      alert("✅ Crowd Report deleted");
      resetAll();

    } catch {
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

      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 p-6">

      <button
        type="button"
        onClick={() => {
          if (mode) setMode(null);
          else navigate("/admin");
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
        bg-black/60 backdrop-blur-xl text-yellow-400 px-4 py-2 rounded-full
        shadow-[0_0_20px_rgba(255,215,0,0.25)] border border-yellow-600/40
        hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaArrowLeft className="text-yellow-400" />
        <span className="text-sm font-semibold">Back</span>
      </button>

      <h1 className="text-3xl font-bold text-yellow-400 mb-8 tracking-wide drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]">
        Crowd Report Management
      </h1>

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlus />} text="Add Crowd Report" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Crowd Report" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Crowd Report" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Crowd Report" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center h-100vh mt-20 overflow-hidden">
          <div className="max-w-xl w-full bg-black/70 backdrop-blur-xl border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.15)] p-6">

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
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <select
                  name="bus_id"
                  value={form.bus_id}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                >
                  <option value="">Select Bus</option>
                  {buses.map((b) => (
                    <option key={b.bus_id} value={b.bus_id}>
                      {b.bus_number}
                    </option>
                  ))}
                </select>

                <select
                  name="trip_id"
                  value={form.trip_id}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                >
                  <option value="">Select Route</option>
                  {uniqueRoutes.map((t) => (
                    <option key={t.trip_id} value={t.trip_id}>
                      {t.route_name}
                    </option>
                  ))}
                </select>

                <input
                  name="current_count"
                  value={form.current_count}
                  onChange={handleChange}
                  placeholder="Passenger Count"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />

                <select
                  name="crowd_status"
                  value={form.crowd_status}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </>
            )}

            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
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
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search text"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600/40 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
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
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl transition shadow-[0_0_15px_rgba(255,215,0,0.3)]"
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

      {showResults && reports.length > 0 && (
        <div className="bg-black/70 backdrop-blur-xl border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">
            🔍 Search Results
          </h2>

          <div className="space-y-4">
            {reports.map((r) => (
              <div
                key={r.report_id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-600/30 bg-black/60 hover:bg-black/50 transition-all duration-200"
              >
                <div>
                  <p className="text-sm text-yellow-400 mb-1">Report ID: {r.report_id}</p>
                  <p className="text-yellow-300 text-sm">Bus: {r.bus_id}</p>
                  <p className="text-yellow-300 text-sm">Trip: {r.trip_id}</p>
                  <p className="text-yellow-300 text-sm">Passengers: {r.current_count}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                    ${
                      r.crowd_status === "high"
                        ? "bg-red-500/20 text-red-400"
                        : r.crowd_status === "Medium"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-green-500/20 text-green-400"
                    }
                  `}
                >
                  {r.crowd_status}
                </span>
              </div>
            ))}
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
