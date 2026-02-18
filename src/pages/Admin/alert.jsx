import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle, FaSearch, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import ThemeLayout from "../../components/Layout/ThemeLayout";
import { alertAPI, busAPI, userAPI } from "../../services/api";

const Alert = () => {
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const busRes = await busAPI.getAllBuses();
        setBuses(busRes.data.data);
        const userRes = await userAPI.getAllUsers();
        setUsers(userRes.data.data);
      } catch {}
    };
    loadData();
  }, []);

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
      bus_number: "",
      user_id: "",
      avg_passengers: ""
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createAlert = async () => {
    try {
      setLoading(true);
      await alertAPI.create(form);
      alert("Alert created successfully");
      resetAll();
    } catch {
      alert("Failed to create alert");
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
      await alertAPI.updateAlert(form.alert_id, form);
      alert("Alert updated successfully");
      const res = await alertAPI.getAlertById(form.alert_id);
      const data = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
      setAlerts([data]);
      setShowResults(true);
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async () => {
    try {
      setLoading(true);
      await alertAPI.deleteAlert(form.alert_id);
      alert("Alert deleted");
      const res = await alertAPI.getAllAlerts();
      setAlerts(res.data.data);
      setShowResults(true);
    } catch {
      alert("Delete failed");
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
    <ThemeLayout pageTitle="Alert Management">
      <button
        onClick={() => mode ? setMode(null) : navigate("/admin")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15 bg-black/60 border border-yellow-600 text-yellow-400 px-4 py-2 rounded-full">
        <FaArrowLeft />
        Back
      </button>

      {!mode && (
        <div className="mt-24 flex flex-col items-center gap-5">
          <ActionBtn icon={<FaPlusCircle />} text="Create Alert" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Alert" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Alert" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Alert" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center mt-20">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600 p-6 rounded-2xl">
            <h2 className="text-xl text-yellow-400 mb-4 capitalize">{mode} Alert</h2>

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <input name="alert_type" value={form.alert_type} onChange={handleChange} placeholder="Alert Type" className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl" />
                <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl" />
                <select name="bus_number" value={form.bus_number} onChange={handleChange} className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl">
                  <option value="">Select Bus</option>
                  {buses.map(b => <option key={b.bus_id} value={b.bus_number}>{b.bus_number}</option>)}
                </select>
                <select name="user_id" value={form.user_id} onChange={handleChange} className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl">
                  <option value="">Select User</option>
                  {users.map(u => <option key={u.user_id} value={u.user_id}>{u.name} (ID:{u.user_id})</option>)}
                </select>
                <input name="avg_passengers" value={form.avg_passengers} onChange={handleChange} placeholder="Average Passengers" className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl" />
              </>
            )}

            {mode === "find" && (
              <>
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl">
                  <option value="id">Find by ID</option>
                  <option value="all">Get All</option>
                  <option value="text">Search by Text</option>
                </select>
                {searchType === "id" && <input name="alert_id" value={form.alert_id} onChange={handleChange} placeholder="Alert ID" className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl" />}
                {searchType === "text" && <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search text..." className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl" />}
              </>
            )}

            {mode === "edit" && !editLoaded && <input name="alert_id" value={form.alert_id} onChange={handleChange} placeholder="Enter Alert ID" className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl" />}
            {mode === "delete" && <input name="alert_id" value={form.alert_id} onChange={handleChange} placeholder="Alert ID" className="w-full p-3 mb-3 bg-black border border-yellow-600 text-white rounded-xl" />}

            <div className="flex gap-3">
              <button onClick={handleSubmit} className="bg-yellow-500 text-black px-6 py-2 rounded-xl">{loading ? "Processing..." : "Submit"}</button>
              <button onClick={resetAll} className="bg-gray-800 text-white px-6 py-2 rounded-xl">Cancel</button>
            </div>

          </div>
        </div>
      )}

      {showResults && alerts.length > 0 && (
        <div className="mt-10 bg-black/80 border border-yellow-600 rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead className="text-yellow-400 border-b border-yellow-600">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Bus</th>
                <th className="p-3">User</th>
                <th className="p-3">Avg</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.alert_id} className="border-b border-yellow-600/20">
                  <td className="p-3">{a.alert_id}</td>
                  <td className="p-3">{a.alert_type}</td>
                  <td className="p-3">{a.description}</td>
                  <td className="p-3">{a.bus_number}</td>
                  <td className="p-3">{a.user_name || ""} (ID:{a.user_id})</td>
                  <td className="p-3">{a.avg_passengers}</td>
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
  <button onClick={onClick} className="flex items-center gap-3 p-5 bg-black/70 border border-yellow-600 rounded-3xl text-white w-72">
    <span className="text-yellow-400 text-2xl">{icon}</span>
    <span className="text-lg">{text}</span>
  </button>
);

export default Alert;
