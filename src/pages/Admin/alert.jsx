import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
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
  const [searchText, setSearchText] = useState("");
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //fill form after ID fetch
  const populateFormFromAlert = (a) => {
    if (!a) return;

    setForm({
      id: a.alert_id || "",
      alert_type: a.alert_type || "",
      description: a.description || "",
      bus_number: a.bus_number,
      user_id: a.user_id || "",
      avg_passengers: a.avg_passengers || ""
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

      let result = [];
      
      if (searchType === "id") {
        if (!form.id) return alert("Enter Alert ID");

        const res = await alertAPI.getAlertById(form.id);
        result = res.data?.data;

        if (!result) throw new Error();

        result = Array.isArray(result) ? result : [result];
      }

      if (searchType === "all") {
        const res = await alertAPI.getAllAlerts();
        result = res.data?.data || [];
      }

      if (searchType === "text") {
        if(!searchText.trim()) {
          alert("Enter text to search");
          return;
        }

        const res = await alertAPI.getAlertByText(searchText);
        result = res.data?.data || [];
      }

      setAlerts(result);
      setShowResults(true);

    } catch (error) {
      alert("❌ Alert not found");
      setAlerts([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  //Load alert by ID //Auto-fill
  const loadAlertForEdit = async () => {
    if (!form.id) return alert ("Enter Alert ID");
    try {
      setLoading(true);
      const res = await alertAPI.getAlertById(form.id);
      const data = res.data?.data;

      if(!data) throw new Error();

      populateFormFromAlert(data);
      setAlerts([data]);
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
        user_id: Number (form.user_id),
        avg_passengers: Number (form.avg_passengers)
      });
      alert("✅ Alert updated");

      const res = await alertAPI.getAlertById(form.id);
      const data = res.data?.data;

      setAlerts([data]);
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
    if (mode === "add") return addAlert();
    if (mode === "find") return findAlert();

    //edit flow
    if (mode === "edit") {
      if (!editLoaded) {
        return loadAlertForEdit();
      } else {
        return updateAlert();
      }
    }

    if (mode === "delete") return deleteAlert(); 
  };

  //UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 
      to-sky-600 p-6">

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
        Alert Management 
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
            <h2 className="text-xl font-bold mb-4 capitalize">{mode} Alert</h2>

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
                    placeholder="Search by type / desc / bus_no / user_id"
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
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-10">
          <h2 className="text-xl font-bold mb- text-gray-800">
            🚨 Alert Results
          </h2>

          <div className="space-y-4">
            {alerts.map((a) => (
              <div 
                key={a.alert_id}
                onClick={() => {
                  if (mode === "edit") populateFormFromAlert(a);
                }}
                className="flex items-start justify-between gap-4 p-5 
                  rounded-xl border border-gray-200 hover:shadow-lg 
                  hover:scale-[1.01] transition-all duration-200 cursor-pointer"
              >

                {/* LEFT SIDE */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-500">
                        {a.alert_type}
                      </p>
                      <p className="text-sm text-gray-500">{a.description}</p>
                      <p className="text-sm text-gray-500">{a.avg_passengers}</p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block mb-1">
                      UID-{a.user_id}
                    </span>

                    <span className="px-3 py-1 rounded-full text-sm font-medium
                      bg-indigo-100 text-indigo-700">
                        {a.bus_number}
                    </span>
                  </div>
                </div>

              </div>
            ))}
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
