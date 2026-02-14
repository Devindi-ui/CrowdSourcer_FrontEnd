import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";

import { busTypeAPI } from "../../services/api";

const BusType = () => {

  const navigate = useNavigate();

  const [mode, setMode] = useState(null); // add | find | edit | delete
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    type_name: "",
    description: "",
    status: 1
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [busTypes, setBusTypes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);

  /* RESET */
  const resetAll = () => {
    setMode(null);
    setSearchType("id");
    setSearchText("");
    setBusTypes([]);
    setShowResults(false);
    setEditLoaded(false);
    setForm({
      id: "",
      type_name: "",
      description: "",
      status: 1
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= ADD ================= */
  const addBusType = async () => {
    try {
      setLoading(true);
      await busTypeAPI.createBusType({
        type_name: form.type_name,
        description: form.description,
        status: 1
      });

      alert("✅ Bus Type added successfully");
      resetAll();

    } catch {
      alert("❌ Failed to add Bus Type");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FIND ================= */
  const findBusType = async () => {
    try {
      setLoading(true);
      setBusTypes([]);
      setShowResults(false);

      if (searchType === "id") {
        if (!form.id) return alert("Enter Bus Type ID");
        const res = await busTypeAPI.getBusTypeById(form.id);
        setBusTypes([res.data.data]);
      }

      if (searchType === "all") {
        const res = await busTypeAPI.getAllBusTypes();
        setBusTypes(res.data.data);
      }

      if (searchType === "text") {
        if (!searchText.trim())
          return alert("Enter text to search");

        const res = await busTypeAPI.getBusTypeByText(searchText);
        setBusTypes(res.data.data || []);
      }

      setShowResults(true);

    } catch {
      alert("❌ Bus Type not found");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD FOR EDIT ================= */
  const loadBusTypeForEdit = async () => {
    if (!form.id) return alert("Enter Bus Type ID");

    try {
      setLoading(true);
      const res = await busTypeAPI.getBusTypeById(form.id);
      const bt = res.data.data;

      setForm({
        id: bt.bus_type_id,
        type_name: bt.type_name,
        description: bt.description,
        status: bt.status
      });

      setBusTypes([bt]);
      setShowResults(true);
      setEditLoaded(true);

    } catch {
      alert("❌ Bus Type not found");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ================= */
  const updateBusType = async () => {
    try {
      setLoading(true);

      await busTypeAPI.updateBusType(form.id, {
        type_name: form.type_name,
        description: form.description,
        status: form.status
      });

      alert("✅ Bus Type updated");

      const res = await busTypeAPI.getBusTypeById(form.id);
      setBusTypes([res.data.data]);
      setShowResults(true);

    } catch {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE (SOFT) ================= */
  const deleteBusType = async () => {
    try {
      setLoading(true);

      await busTypeAPI.deleteBusType(form.id);
      alert("✅ Bus Type deleted");

      const res = await busTypeAPI.getAllBusTypes();
      setBusTypes(res.data.data);
      setShowResults(true);

    } catch {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    if (mode === "add") addBusType();
    if (mode === "find") findBusType();
    if (mode === "edit" && !editLoaded) loadBusTypeForEdit();
    else if (mode === "edit") updateBusType();
    if (mode === "delete") deleteBusType();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-600 p-6">

      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => {
          if (mode) setMode(null);
          else navigate("/admin");
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
        bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-full 
        shadow-lg hover:bg-white hover:scale-105 transition"
      >
        <FaArrowLeft className="text-sky-600" />
        <span className="font-semibold text-sm">Back</span>
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">
        Bus Type Management
      </h1>

      {/* ACTION BUTTONS */}
      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 [&>button]:w-72">
          <ActionBtn icon={<FaPlus />} text="Add Bus Type" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Bus Type" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Bus Type" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Bus Type" onClick={() => setMode("delete")} />
        </div>
      )}

      {/* FORM */}
      {mode && (
        <div className="flex justify-center items-center mt-30">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-4 capitalize">
              {mode} Bus Type
            </h2>

            {/* EDIT STEP 1 */}
            {mode === "edit" && !editLoaded && (
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Enter Bus Type ID"
                className="w-full p-3 mb-3 border rounded-xl"
              />
            )}

            {/* ADD OR EDIT FORM */}
            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <input
                  name="type_name"
                  value={form.type_name}
                  onChange={handleChange}
                  placeholder="Type Name"
                  className="w-full p-3 mb-3 border rounded-xl"
                />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full p-3 mb-3 border rounded-xl"
                />

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 border rounded-xl"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Deleted</option>
                </select>
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
                  <option value="all">Get All Bus Types</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="Bus Type ID"
                    className="w-full p-3 mb-3 border rounded-xl"
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search type name / description"
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
                placeholder="Bus Type ID"
                className="w-full p-3 mb-3 border rounded-xl"
              />
            )}

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

      {/* RESULTS */}
      {showResults && busTypes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            🔍 Search Results
          </h2>

          <div className="space-y-4">
            {busTypes.map((bt) => (
              <div
                key={bt.bus_type_id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {bt.type_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {bt.description}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 block mb-1">
                    BTID-{bt.bus_type_id}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                    ${bt.status === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                  >
                    {bt.status === 1 ? "Active" : "Deleted"}
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
    className="mt-2 flex items-center gap-3 p-5 bg-white rounded-3xl shadow hover:scale-105 transition"
  >
    <span className="text-sky-600 text-2xl">{icon}</span>
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

export default BusType;
