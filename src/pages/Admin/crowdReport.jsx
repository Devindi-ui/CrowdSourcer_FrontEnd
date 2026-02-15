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
    crowd_status: "Low"
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");

  const [reports, setReports] = useState([]);
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);

  const [editLoaded, setEditLoaded] = useState(false);
  const [showResults, setShowResults] = useState(false);

  /* LOAD SELECT OPTIONS */
  useEffect(() => {
    const loadData = async () => {
      try {
        const busRes = await busAPI.getAllBuses();
        setBuses(busRes.data.data || []);

        const tripRes = await tripAPI.getAllTrips();
        const tripData = tripRes.data.data || [];

        const uniqueTrips = [];
        const seenRoutes = new Set();

        tripData.forEach((trip) => {
          if (!seenRoutes.has(trip.route_name)) {
            seenRoutes.add(trip.route_name);
            uniqueTrips.push(trip);
          }
        });

        setTrips(uniqueTrips);

      } catch (err) {
        console.error("Failed loading dropdown data", err);
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
      crowd_status: "Low"
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* CREATE */
  const createReport = async () => {
    try {
      setLoading(true);
      await crowdReportAPI.createCrowdReport({
        bus_id: form.bus_id,
        trip_id: form.trip_id,
        current_count: form.current_count,
        crowd_status: form.crowd_status
      });

      alert("✅ Crowd Report Created");
      resetAll();

    } catch {
      alert("❌ Failed to create");
    } finally {
      setLoading(false);
    }
  };

  /* FIND */
  const findReport = async () => {
    try {
      setLoading(true);
      setReports([]);
      setShowResults(false);

      if (searchType === "id") {
        if (!form.report_id) return alert("Enter Report ID");
        const res = await crowdReportAPI.getCrowdReportById(form.report_id);
        setReports(res.data.data || []);
      }

      if (searchType === "all") {
        const res = await crowdReportAPI.getAllCrowdReports();
        setReports(res.data.data || []);
      }

      if (searchType === "text") {
        if (!searchText.trim()) return alert("Enter search text");
        const res = await crowdReportAPI.getCrowdReportByText(searchText);
        setReports(res.data.data || []);
      }

      setShowResults(true);

    } catch {
      alert("❌ Not Found");
    } finally {
      setLoading(false);
    }
  };

  /* LOAD FOR EDIT */
  const loadForEdit = async () => {
    if (!form.report_id) return alert("Enter Report ID");

    try {
      setLoading(true);
      const res = await crowdReportAPI.getCrowdReportById(form.report_id);
      const data = res.data.data[0];

      setForm({
        report_id: data.report_id,
        bus_id: data.bus_id,
        trip_id: data.trip_id,
        current_count: data.current_count,
        crowd_status: data.crowd_status
      });

      setReports([data]);
      setShowResults(true);
      setEditLoaded(true);

    } catch {
      alert("❌ Report Not Found");
    } finally {
      setLoading(false);
    }
  };

  /* UPDATE */
  const updateReport = async () => {
    try {
      setLoading(true);

      await crowdReportAPI.updateCrowdReport(form.report_id, {
        bus_id: form.bus_id,
        trip_id: form.trip_id,
        current_count: form.current_count,
        crowd_status: form.crowd_status
      });

      alert("✅ Updated Successfully");

      const res = await crowdReportAPI.getCrowdReportById(form.report_id);
      setReports(res.data.data || []);
      setShowResults(true);

    } catch {
      alert("❌ Update Failed");
    } finally {
      setLoading(false);
    }
  };

  /* DELETE */
  const deleteReport = async () => {
    try {
      setLoading(true);

      await crowdReportAPI.deleteCrowdReport(form.report_id);
      alert("✅ Deleted Successfully");

      const res = await crowdReportAPI.getAllCrowdReports();
      setReports(res.data.data || []);
      setShowResults(true);

    } catch {
      alert("❌ Delete Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") createReport();
    if (mode === "find") findReport();
    if (mode === "edit" && !editLoaded) loadForEdit();
    else if (mode === "edit") updateReport();
    if (mode === "delete") deleteReport();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 text-white">

      <button
        type="button"
        onClick={() => {
          if (mode) setMode(null);
          else navigate("/admin");
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
        bg-gray-800 text-white px-4 py-2 rounded-full 
        shadow-lg hover:bg-gray-700 hover:scale-105 transition"
      >
        <FaArrowLeft className="text-blue-400" />
        <span className="font-semibold text-sm">Back</span>
      </button>

      <h1 className="text-3xl font-bold mb-8">
        Crowd Report Management
      </h1>

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 [&>button]:w-72">
          <ActionBtn icon={<FaPlus />} text="Add Crowd Report" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Crowd Report" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Crowd Report" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Crowd Report" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center mt-30">
          <div className="max-w-xl w-full bg-gray-800 rounded-2xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-4 capitalize">
              {mode} Crowd Report
            </h2>

            {/* FIND SECTION FIX */}
            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-gray-700 border border-gray-600 rounded-xl"
                >
                  <option value="id">Find by ID</option>
                  <option value="all">Find All</option>
                  <option value="text">Find by Text</option>
                </select>

                {searchType === "id" && (
                  <input
                    name="report_id"
                    value={form.report_id}
                    onChange={handleChange}
                    placeholder="Enter Report ID"
                    className="w-full p-3 mb-3 bg-gray-700 border border-gray-600 rounded-xl"
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Enter search text"
                    className="w-full p-3 mb-3 bg-gray-700 border border-gray-600 rounded-xl"
                  />
                )}
              </>
            )}

            {(mode === "edit" && !editLoaded) && (
              <input
                name="report_id"
                value={form.report_id}
                onChange={handleChange}
                placeholder="Enter Report ID"
                className="w-full p-3 mb-3 bg-gray-700 border border-gray-600 rounded-xl"
              />
            )}

            {mode === "delete" && (
              <input
                name="report_id"
                value={form.report_id}
                onChange={handleChange}
                placeholder="Enter Report ID"
                className="w-full p-3 mb-3 bg-gray-700 border border-gray-600 rounded-xl"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl"
              >
                {loading ? "Please wait..." : "Submit"}
              </button>

              <button
                onClick={resetAll}
                className="bg-gray-600 text-white px-6 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>

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
    className="mt-2 flex items-center gap-3 p-5 bg-gray-800 rounded-3xl shadow hover:scale-105 transition"
  >
    <span className="text-blue-400 text-2xl">{icon}</span>
    <span className="font-semibold text-lg text-white">{text}</span>
  </button>
);

export default CrowdReport;
