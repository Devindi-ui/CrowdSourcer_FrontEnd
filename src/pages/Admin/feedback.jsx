import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaStar
} from "react-icons/fa";
import { feedbackAPI, busAPI, routeAPI } from "../../services/api";
import ThemeLayout from "../../components/Layout/ThemeLayout";

const Feedback = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    feedback_id: "",
    user_id: "",
    bus_id: "",
    comment: "",
    rating: 0
  };

  const [form, setForm] = useState(emptyForm);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);

  useEffect(() => {
    loadRoutes();
    loadBuses();
  }, []);

  const loadRoutes = async () => {
    try {
      const res = await routeAPI.getAllRoutes();
      setRoutes(res?.data?.data || []);
    } catch {}
  };

  const loadBuses = async () => {
    try {
      const res = await busAPI.getAllBuses();
      setBuses(res?.data?.data || []);
    } catch {}
  };

  useEffect(() => {
    if (selectedRoute) {
      const filtered = buses.filter(
        (b) => String(b.route_id) === String(selectedRoute)
      );
      setFilteredBuses(filtered);
    } else {
      setFilteredBuses([]);
    }
  }, [selectedRoute, buses]);

  const resetAll = () => {
    setMode(null);
    setFeedbacks([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);
    setForm(emptyForm);
    setSelectedRoute("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStarClick = (value) => {
    setForm({ ...form, rating: value });
  };

  const populateForm = (data) => {
    setForm({
      feedback_id: data.feedback_id,
      user_id: data.user_id,
      bus_id: data.bus_id,
      comment: data.comment,
      rating: data.rating
    });

    const bus = buses.find((b) => b.bus_id === data.bus_id);
    if (bus) setSelectedRoute(bus.route_id);

    setEditLoaded(true);
  };

  const addFeedback = async () => {
    try {
      setLoading(true);
      await feedbackAPI.create({
        user_id: form.user_id,
        bus_id: form.bus_id,
        comment: form.comment,
        rating: form.rating
      });
      alert("✅ Feedback added successfully");
      resetAll();
    } catch {
      alert("❌ Failed to add feedback");
    } finally {
      setLoading(false);
    }
  };

  const findFeedback = async () => {
    try {
      setLoading(true);
      setFeedbacks([]);
      setShowResults(false);
      setMode("find");

      if (searchType === "id") {
        if (!form.feedback_id) return alert("Enter Feedback ID");
        const res = await feedbackAPI.getFeedbackById(form.feedback_id);
        setFeedbacks([res.data.data]);
        setShowResults(true);
      }

      if (searchType === "all") {
        const res = await feedbackAPI.getAllFeedbacks();
        setFeedbacks(res.data.data);
        setShowResults(true);
      }

      if (searchType === "text") {
        if (!searchText.trim()) return alert("Enter search text");
        const res = await feedbackAPI.getFeedbackByText(searchText);
        setFeedbacks(res.data.data || []);
        setShowResults(true);
      }

    } catch {
      alert("❌ Feedback not found");
      setFeedbacks([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbackForEdit = async () => {
    if (!form.feedback_id) return alert("Enter Feedback ID");
    try {
      setLoading(true);
      const res = await feedbackAPI.getFeedbackById(form.feedback_id);
      populateForm(res.data.data);
      setFeedbacks([res.data.data]);
      setShowResults(true);
    } catch {
      alert("❌ Feedback Not Found");
    } finally {
      setLoading(false);
    }
  };

  const updateFeedback = async () => {
    try {
      setLoading(true);
      await feedbackAPI.updateFeedback(form.feedback_id, {
        user_id: form.user_id,
        bus_id: form.bus_id,
        comment: form.comment,
        rating: form.rating
      });

      alert("✅ Feedback updated");

      const res = await feedbackAPI.getFeedbackById(form.feedback_id);
      setFeedbacks([res.data.data]);
      setShowResults(true);

    } catch {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async () => {
    try {
      setLoading(true);
      await feedbackAPI.deleteFeedback(form.feedback_id);
      alert("✅ Feedback deleted");

      const res = await feedbackAPI.getAllFeedbacks();
      setFeedbacks(res.data.data);
      setShowResults(true);

    } catch {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addFeedback();
    if (mode === "find") findFeedback();
    if (mode === "edit" && !editLoaded) loadFeedbackForEdit();
    else if (mode === "edit") updateFeedback();
    if (mode === "delete") deleteFeedback();
  };

  return (
    <ThemeLayout pageTitle="Feedback Management">

      <button
        type="button"
        onClick={() => {
          if (mode) setMode(null);
          else navigate("/admin");
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
        bg-black/60 backdrop-blur-md border border-yellow-600
        text-yellow-400 px-4 py-2 rounded-full 
        shadow-[0_0_20px_rgba(255,215,0,0.25)]
        hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaArrowLeft />
        <span className="font-semibold text-sm">Back</span>
      </button>

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlus />} text="Add Feedback" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Feedback" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Feedback" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Feedback" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center h-full mt-20 overflow-hidden">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl p-6">

            <h2 className="text-xl font-bold mb-4 text-yellow-400 capitalize">
              {mode} Feedback
            </h2>

            {mode === "edit" && !editLoaded && (
              <input
                name="feedback_id"
                value={form.feedback_id}
                onChange={handleChange}
                placeholder="Enter Feedback ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <input
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                  placeholder="User ID"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                />

                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                >
                  <option value="">Select Route</option>
                  {routes.map((r) => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.route_name}
                    </option>
                  ))}
                </select>

                <select
                  name="bus_id"
                  value={form.bus_id}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                >
                  <option value="">Select Bus</option>
                  {filteredBuses.map((b) => (
                    <option key={b.bus_id} value={b.bus_id}>
                      {b.bus_number}
                    </option>
                  ))}
                </select>

                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  placeholder="Comment"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                />

                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <FaStar
                      key={star}
                      onClick={() => handleStarClick(star)}
                      className={star <= form.rating ? "text-yellow-400 text-2xl cursor-pointer" : "text-gray-600 text-2xl cursor-pointer"}
                    />
                  ))}
                </div>
              </>
            )}

            {mode === "delete" && (
              <input
                name="feedback_id"
                value={form.feedback_id}
                onChange={handleChange}
                placeholder="Feedback ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
              />
            )}

            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                >
                  <option value="id">Find by ID</option>
                  <option value="all">Get All</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input
                    name="feedback_id"
                    value={form.feedback_id}
                    onChange={handleChange}
                    placeholder="Feedback ID"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search comment / user / bus"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                  />
                )}
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold"
              >
                {loading ? "Please wait..." : "Submit"}
              </button>

              <button
                onClick={resetAll}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {showResults && feedbacks.length > 0 && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl p-6 mt-10">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">Search Results</h2>

          <div className="space-y-4">
            {feedbacks.map((f) => (
              <div key={f.feedback_id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-600/30 
                  bg-black/60 hover:bg-black/50 transition-all duration-200"
              >
                <div>
                  <p className="text-lg font-semibold text-white">{f.feedback_id} _ {f.comment}</p>
                  <p className="text-sm text-yellow-300">User: {f.user_name} (UID-{f.user_id})</p>
                  <p className="text-sm text-yellow-300">Bus: {f.bus_number}</p>
                  <p className="text-sm text-yellow-300">Route: {f.route_name}</p>
                </div>

                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <FaStar
                      key={star}
                      className={star <= f.rating ? "text-yellow-400" : "text-gray-600"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
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

export default Feedback;
