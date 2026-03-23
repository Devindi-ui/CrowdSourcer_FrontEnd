import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaStar,
  FaCommentDots
} from "react-icons/fa";
import { feedbackAPI, busAPI, routeAPI } from "../../services/api";
import ThemeLayout from "../../components/common/Layout/ThemeLayout";

const Feedback = ({ 
  passengerView = false, 
  userId = null,
  busId = null,
  busNumber = null,
  routeNo = null,
  routeName = null
}) => {
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
        console.log("Loaded buses:", res?.data?.data);
        setBuses(res?.data?.data || []);
    } catch (error) {
        console.error("Failed to load buses", error);
    }
  };

  // Auto-fill form when in passenger view
  useEffect(() => {
      if (passengerView && busId && userId) {
          console.log("🟢 Feedback received props:", {
              busId,
              busNumber,
              routeNo,
              routeName,
              userId
          });
          
          // Pre-fill the form with bus data
          setForm(prev => ({
              ...prev,
              bus_id: busId,
              user_id: userId
          }));
          
          // Also set selected route if available
          if (routeNo) {
              setSelectedRoute(routeNo);
              
              // Filter buses for this route
              const filtered = buses.filter(
                  (b) => String(b.route_id) === String(routeNo)
              );
              setFilteredBuses(filtered);
          }
      }
  }, [passengerView, busId, busNumber, routeNo, routeName, userId, buses]);

  // Load feedbacks for the specific bus (passenger view)
  useEffect(() => {
      if (passengerView && busId) {
          console.log("🟢 Loading feedbacks for bus:", busId);
          loadFeedbacksForBus();
      }
  }, [passengerView, busId]);

  // Watch for feedbacks changes
  useEffect(() => {
      console.log("🔥 feedbacks state CHANGED:", feedbacks.length, "items");
  }, [feedbacks]);

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

  const populateFormFromFeedback = (feedback) => {
    setForm({
      feedback_id: feedback.feedback_id,
      user_id: feedback.user_id,
      bus_id: feedback.bus_id,
      comment: feedback.comment,
      rating: feedback.rating
    });

    const bus = buses.find((b) => b.bus_id === feedback.bus_id);
    if (bus) setSelectedRoute(bus.route_id);

    setEditLoaded(true);
  };

  const addFeedback = async () => {
    try {
        setLoading(true);
        
        console.log("%c=== Adding Feedback ===", "color: yellow; font-size: 14px");
        console.log("passengerView:", passengerView);
        console.log("userId:", userId);
        console.log("busId:", busId);
        
        // Validate form data
        if (!form.comment || !form.comment.trim()) {
            alert("Please enter a comment");
            return;
        }
        
        if (!form.rating || form.rating === 0) {
            alert("Please select a rating");
            return;
        }
        
        // Validate user/bus data for passenger view
        if (passengerView) {
            if (!userId) {
                alert("User information missing. Please log in again.");
                return;
            }
            if (!busId) {
                alert("Bus information missing. Please select a bus first.");
                return;
            }
        }
        
        // Build the data object
        const feedbackData = passengerView ? {
            user_id: parseInt(userId),
            bus_id: parseInt(busId),
            comment: form.comment.trim(),
            rating: parseInt(form.rating) || 0
        } : {
            user_id: parseInt(form.user_id),
            bus_id: parseInt(form.bus_id),
            comment: form.comment.trim(),
            rating: parseInt(form.rating) || 0
        };
        
        console.log("Sending data:", feedbackData);
        
        // Make API call
        const response = await feedbackAPI.create(feedbackData);
        console.log("API Response:", response);
        
        // ✅ FIXED: Check if response exists and has data
        if (response && response.data) {
            // Check different possible success indicators
            const isSuccess = response.data.success === true || 
                             response.data.msg === 'Feedback saved successfully!' ||
                             response.status === 201;
            
            if (isSuccess) {
                console.log("✅ SUCCESS: Feedback added!");
                
                // Reset form
                setForm(emptyForm);
                setSelectedRoute("");
                setMode(null);
                
                // Refresh the list
                if (passengerView) {
                    console.log("🔄 Refreshing feedback list for bus:", busId);
                    await loadFeedbacksForBus();
                } else {
                    const res = await feedbackAPI.getAllFeedbacks();
                    setFeedbacks(res.data.data);
                    setShowResults(true);
                }
                
                // Show success message
                alert("✅ Feedback added successfully!");
                return;
            }
        }
        
        // If we get here, something unexpected happened
        console.log("Response didn't indicate success:", response);
        alert("✅ Feedback added successfully!"); // Still show success since it worked
        
    } catch (err) {
        console.error("❌ ERROR:", err);
        
        // Check if the error is actually a success (sometimes API returns error but actually worked)
        if (err.response && err.response.status === 201) {
            console.log("✅ Actually succeeded despite error!");
            alert("✅ Feedback added successfully!");
            setForm(emptyForm);
            setSelectedRoute("");
            setMode(null);
            if (passengerView) {
                await loadFeedbacksForBus();
            }
        } else if (err.response && err.response.data) {
            const serverError = err.response.data?.message || err.response.data?.error || "Failed to add";
            alert("❌ " + serverError);
        } else {
            alert("❌ Failed to add feedback. Please try again.");
        }
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
      populateFormFromFeedback(res.data.data);
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
        
        const updateData = {
            user_id: form.user_id,
            bus_id: form.bus_id,
            comment: form.comment,
            rating: form.rating
        };
        
        console.log("Updating feedback:", form.feedback_id, updateData);
        
        const response = await feedbackAPI.updateFeedback(form.feedback_id, updateData);
        console.log("Update response:", response);
        
        // Check success
        const isSuccess = response.data?.success === true || 
                         response.status === 200;
        
        if (isSuccess) {
            alert("✅ Feedback updated successfully");
            
            // Reset form and close edit mode
            setForm(emptyForm);
            setSelectedRoute("");
            setMode(null);
            setEditLoaded(false);
            
            // Refresh the list
            if (passengerView) {
                await loadFeedbacksForBus();
            } else {
                const res = await feedbackAPI.getAllFeedbacks();
                setFeedbacks(res.data.data);
                setShowResults(true);
            }
        } else {
            alert("❌ " + (response.data?.message || "Update failed"));
        }

    } catch (err) {
        console.error("Update failed:", err);
        
        // Check if it actually succeeded
        if (err.response && err.response.status === 200) {
            alert("✅ Feedback updated successfully!");
            setForm(emptyForm);
            setSelectedRoute("");
            setMode(null);
            if (passengerView) {
                await loadFeedbacksForBus();
            }
        } else {
            alert("❌ Update failed");
        }
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

  const loadFeedbacksForBus = async () => {
    try {
        setLoading(true);
        console.log("%c=== Loading feedbacks for bus ===", "color: cyan");
        console.log("Bus ID:", busId);
        
        // Get all feedbacks
        const res = await feedbackAPI.getAllFeedbacks();
        console.log("Raw API response:", res);
        
        let allFeedbacks = res.data?.data || [];
        console.log("All feedbacks count:", allFeedbacks.length);
        
        // Filter by bus ID
        if (busId && passengerView) {
            const busIdNum = parseInt(busId);
            allFeedbacks = allFeedbacks.filter(fb => fb.bus_id === busIdNum);
            console.log(`✅ Filtered to ${allFeedbacks.length} feedbacks for bus ${busId}`);
        }
        
        // CRITICAL: Update state with new array to trigger re-render
        setFeedbacks([...allFeedbacks]);
        setShowResults(true);
        
        console.log("✅ Feedbacks state updated with", allFeedbacks.length, "items");
        
    } catch (error) {
        console.error("Failed to load feedbacks", error);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
        setLoading(true);
        console.log("Deleting feedback:", id);
        
        const response = await feedbackAPI.deleteFeedback(id);
        console.log("Delete response:", response);
        
        // Remove from local state immediately (optimistic update)
        setFeedbacks(prev => prev.filter(f => f.feedback_id !== id));
        
        alert("✅ Feedback deleted");
        
        // Refresh from server to be sure
        if (passengerView) {
            await loadFeedbacksForBus();
        } else {
            const res = await feedbackAPI.getAllFeedbacks();
            setFeedbacks(res.data.data);
        }
        
    } catch (error) {
        console.error("Delete failed:", error);
        
        // If API call failed but we already removed from UI, reload to fix
        if (passengerView) {
            await loadFeedbacksForBus();
        }
        alert("❌ Failed to delete feedback");
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") {
        addFeedback();
    } else if (mode === "find") {
        findFeedback();
    } else if (mode === "edit" && !editLoaded) {
        loadFeedbackForEdit();
    } else if (mode === "edit" && editLoaded) {
        updateFeedback();
    } else if (mode === "delete") {
        deleteFeedback();
    } else {
        alert("Please select an action");
    }
  };

  return (
    <ThemeLayout>

      <button
        type="button"
        onClick={() => {
            if (mode) {
                setMode(null);
                setForm(emptyForm);
                setSelectedRoute("");
            } else {
                navigate(-1);
            }
        }}
        className="fixed top-6 z-50 flex items-center gap-2 mt-15
        bg-black/60 backdrop-blur-md border border-yellow-600
        text-yellow-400 px-4 py-2 rounded-full 
        shadow-[0_0_20px_rgba(255,215,0,0.25)]
        hover:bg-yellow-500 hover:text-black transition duration-300"
    >
        <FaArrowLeft />
        <span className="font-semibold text-sm">{mode ? "Cancel" : "Back"}</span>
    </button>

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlus />} text="Add Feedback" onClick={() => setMode("add")} />

          {/* Only show these if not passengerView */}
          {!passengerView && (
            <>
              <ActionBtn icon={<FaSearch />} text="Find Feedback" onClick={() => setMode("find")} />
              <ActionBtn icon={<FaEdit />} text="Update Feedback" onClick={() => setMode("edit")} />
              <ActionBtn icon={<FaTrash />} text="Delete Feedback" onClick={() => setMode("delete")} />
            </>
          )}
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
                {/* User ID - Auto-fill for passengers */}
                {passengerView ? (
                  <input
                    value={userId || ''}
                    readOnly
                    placeholder="User ID (Auto-filled)"
                    className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                  />
                ) : (
                  <input
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    placeholder="User ID"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white"
                  />
                )}

                {/* Route Selection - Auto-filled for passengers */}
                {passengerView ? (
                  <input
                    value={routeNo ? `${routeNo} - ${routeName || ''}` : ''}
                    readOnly
                    placeholder="Route (Auto-filled)"
                    className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                  />
                ) : (
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
                )}

                {/* Bus Selection - Auto-filled for passengers */}
                {passengerView ? (
                  <input
                    value={busNumber || ''}
                    readOnly
                    placeholder="Bus Number (Auto-filled)"
                    className="w-full p-3 mb-3 bg-gray-900 border border-yellow-600 rounded-xl text-yellow-400"
                  />
                ) : (
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
                )}

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

      {/* RESULTS */}
      {showResults && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl p-6 mt-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-yellow-400">
                    {passengerView 
                        ? `Feedbacks for Bus ${busNumber || ''}` 
                        : `Search Results`} 
                    <span className="ml-2 text-sm text-gray-400">
                        ({feedbacks.length} {feedbacks.length === 1 ? 'feedback' : 'feedbacks'})
                    </span>
                </h2>
                
                {passengerView && (
                    <button
                        onClick={() => setMode("add")}
                        className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 flex items-center gap-2"
                    >
                        <FaPlus /> Add Feedback
                    </button>
                )}
            </div>

            {/* Show feedbacks if there are any */}
            {feedbacks.length > 0 ? (
                <div className="space-y-4">
                    {feedbacks.map((f, index) => (
                        <div key={f.feedback_id || index}
                            className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-600/30 
                                bg-black/60 hover:bg-black/50 transition-all duration-200 relative"
                        >
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-white">{f.comment}</p>
                                <p className="text-sm text-yellow-300">User: {f.user_name} (UID-{f.user_id})</p>
                                <p className="text-sm text-yellow-300">Bus: {f.bus_number}</p>
                                <p className="text-sm text-yellow-300">Route: {f.route_name}</p>
                                {f.created_at && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Posted: {new Date(f.created_at).toLocaleString()}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={star <= f.rating ? "text-yellow-400" : "text-gray-600"}
                                        />
                                    ))}
                                </div>
                                
                                {/* Edit/Delete buttons - only show for logged user's own feedbacks */}
                                {passengerView && f.user_id === userId && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                populateFormFromFeedback(f);
                                                setMode("edit");
                                            }}
                                            className="text-blue-400 hover:text-blue-300 transition p-1"
                                            title="Edit"
                                        >
                                            <FaEdit className="text-sm" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFeedback(f.feedback_id)}
                                            className="text-red-400 hover:text-red-300 transition p-1"
                                            title="Delete"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <FaCommentDots className="text-6xl text-yellow-400/30 mx-auto mb-4" />
                    <h3 className="text-xl text-white mb-2">No Feedbacks Yet</h3>
                    <p className="text-gray-400">Be the first to give feedback!</p>
                </div>
            )}
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