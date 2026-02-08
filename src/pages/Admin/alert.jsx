import React, {useEffect, useState} from "react";
import { data, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaArrowLeft
} from "react-icons/fa";
import { alertAPI } from "../../services/api";

const Alert = () => {
  // State
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    alert_type: "",
    description: "",
    bus_number: "",
    user_id: "",
    avg_passengers: ""
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState();
  const [alerts, setAlerts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);

  //Helpers
  const resetAll = () => {
    setMode(null);
    setAlerts([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);
    setForm({
      id: "",
      alert_type: "",
      description: "",
      bus_number: "",
      user_id: "",
      avg_passengers: ""
    });

    setTimeout(() => setMode(null), 0);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value});
  };

  //fill form after ID fetch
  const populateFormFromAlert = (a) => {
    setForm({
      alert_type: a.alert_type,
      description: a.description,
      bus_number: a.bus_number,
      user_id: a.user_id,
      avg_passengers: a.avg_passengers
    });
    setEditLoaded(true);
  };

  // API Functions 
  // ADD Alert
  const addAlert = async () => {
    try {
      setLoading(true);
      await alertAPI.create({
        alert_type: form.alert_type,
        description: form.description,
        bus_number: form.bus_number,
        user_id: Number(form.user_id),
        avg_passengers: Number(form.avg_passengers)
      });
      alert("✅ Alert added successfully!");
      resetAll();
    } catch (error) {
      alert("❌ Failed to add an alert")
    } finally {
      setLoading(false);
    }
  };

  //find alert
  const findAlert = async () => {
    try {
      setLoading(true);
      setAlerts([]);
      setShowResults(false);
      setMode("find");

      if (searchType === "id") {
        if (!form.id)return alert("Enter Alert ID");
        const res = await alertAPI.getAlertById(form.id);

        const data = Array.isArray(res.data.data)
        ? res.data.data
        : [res.data.data];

        setAlerts(data); //data arrives
        setShowResults(true);
      }

      if (searchType === "all") {
        const res = await alertAPI.getAllAlerts();
        setAlerts(res.data.data);
        setShowResults(true);
      }

      if (searchType === "text") {
        if(!searchText.trim()) {
          alert("Enter text to search");
          return;
        }

        const res = await alertAPI.getAlertByText(searchText);
        setAlerts(res.data.data || []);
        setShowResults(true);
      }

    } catch (error) {
      alert("❌ Alert not found");
      setAlerts([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  //Load alert by ID
  const loadAlertForEdit = async () => {
    if (!form.id) return alert ("Enter alert ID");
    try {
      setLoading(true);
      const res = await alertAPI.getAlertById(form.id);
      populateFormFromAlert(res.data.data);
      setAlerts([res.data.data]);
      setShowResults(true);
    } catch (error) {
      alert("❌ Alert not found")
    } finally {
      setLoading(false);
    }
  };

  //Update
  const updateAlert = async () => {
    try {
      setLoading(true);
      await alertAPI.updateAlert(form.id, {
        alert_type: form.alert_type,
        description: form.description,
        bus_number: form.bus_number,
        user_id: form.user_id,
        avg_passengers: form.avg_passengers
      });
      alert("✅ Alert updated");

      const res = await alertAPI.getAlertById(form.id);
      setAlerts([res.data.data]);
      setShowResults(true);

    } catch (error) {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  //Delete
  const deleteAlert = async () => {
    try {
      setLoading(true);
      await alertAPI.deleteAlert(form.id);
      alert("✅ Alert deleted");
      
      //load alerts after delete
      const res = await alertAPI.getAllAlerts();
      setAlerts(res.data.data);
      setShowResults(true);

    } catch (error) {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  //Submit
  const handleSubmit = () => {
    if (mode === "add") addAlert();
    if (mode === "find") findAlert();
    if (mode === "edit" && !editLoaded) loadAlertForEdit();
    else if (mode === "edit") updateAlert();
    if (mode === "delete") deleteAlert(); 
  };

  //UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-600 p-6">

      {/* Back Button */}
      <button  
        type="button"
        onClick={() => {
          if (mode) {
            setMode(null);
          } else {
            navigate("/admin");
          }
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15 
          bg-white backdrop-blur-md text-slate-800 px-4 py-2 rounded-full 
          shadow-lg hover:bg-white hover:scale-105 transition"
      >
        <FaArrowLeft className="text-sky-600"/>
        <span className="font-semibold text-sm">Back</span>
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">
        User Management 
      </h1>

      {/* Action Buttons */}
      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10
          [&>button]:w-72">
            <ActionBtn
              icon = {<FaPlus/>}
              text = "Add Alert"
              onClick = {() => setMode("add")}
            />
            <ActionBtn
              icon = {<FaSearch/>}
              text = "Find Alert"
              onClick = {() => setMode("find")}
            />
            <ActionBtn
              icon = {<FaEdit/>}
              text = "Update Alert"
              onClick = {() => setMode("edit")}
            />
            <ActionBtn
              icon = {<FaTrashAlt/>}
              text = "Delete Alert"
              onClick = {() => setMode("delete")}
            />
        </div>
      )}

      {/* Form */}
      {mode && (
        <div className="flex justify-center items-center h-100vh mt-30 overflow-hidden">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 capitalize">{mode} User</h2>

            {/* Update - ID only */}
            {mode === "edit" && !editLoaded && (
              <input 
                name="id" 
                value={form.id}
                onChange={handleChange}
                placeholder="Enter Alert ID"
                className="w-full p-3 mb-3 border rounded-xl" 
              />
            )}

            {/* Full Form */}
            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <input 
                  name="alert_type" 
                  value={form.alert_type}
                  onChange={handleChange}
                  placeholder="Alert Type"
                  className="w-full p-3 mb-3 border rounded-xl" 
                />
                <input 
                  name="description" 
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full p-3 mb-3 border rounded-xl" 
                />
                <input 
                  name="bus_number" 
                  value={form.bus_number}
                  onChange={handleChange}
                  placeholder="Bus Number"
                  className="w-full p-3 mb-3 border rounded-xl" 
                />
                <input 
                  name="user_id" 
                  value={form.user_id}
                  onChange={handleChange}
                  placeholder="User ID"
                  className="w-full p-3 mb-3 border rounded-xl" 
                />
                <input 
                  name="avg_passengers" 
                  value={form.avg_passengers}
                  onChange={handleChange}
                  placeholder="Average Passengers"
                  className="w-full p-3 mb-3 border rounded-xl" 
                />
              </>
            )}

            {/* Find Mode */}
            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 border rounded-xl"
                >
                  <option value="id">Find by ID</option>
                  <option value="all">Get All Alerts</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="User ID"
                    className="w-full p-3 mb-3 border rounded-xl"
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search name / email / phone"
                    className="w-full p-3 mb-3 border rounded-xl"
                  />
                )}
              </>
            )}

            {/* DELETE MODE */}
            {mode === "delete" && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Alert ID"
                className="w-full p-3 mb-3 border rounded-xl"
              />
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-sky-600 text-white px-6 py-2 rounded-xl"
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

      {/* Results */}
      {showResults && alerts.length > 0 && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl 
          overflow-hidden mt-10">

          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              🔍 Search Results
            </h2>
            <span className="text-sm text-slate-500">
              Total: {alerts.length}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Bus</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3 text-right">Avg Pas</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {alerts.map((a, index) => (
                  <tr 
                    key={a.alert_id ?? index} 
                    className="hover:bg-slate-50 transition"
                  >

                    {/* Alert ID */}
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      #{a.alert_id}
                    </td>

                    {/* Alert type badge */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-3 py-1 
                        rounded-full text-xs font-semibold bg-sky-100 text-sky-700"
                      >
                        {a.alert_type}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-4 text-slate-600 max-w-sm">
                      {a.description}
                    </td>

                    {/* Bus Number */}
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 items-center rounded-lg bg-slate-200 text-slate-700 font-medium">
                        {a.bus_number}
                      </span>
                    </td>

                    {/* User ID */}
                    <td className="px-5 py-4 text-slate-700 font-mono">
                      UID-{a.user_id}
                    </td>

                    {/* Avg Passengers */}
                    <td className="px-5 py-4 text-right font-bold text-sky-700">
                      {a.avg_passengers}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

};

const ActionBtn = ({ icon, text, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className="mt-2 flex items-center gap-3 p-5 bg-white rounded-3xl 
      shadow hover:scale-105 transition">
    <span className="text-sky-600 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
)

export default Alert;
