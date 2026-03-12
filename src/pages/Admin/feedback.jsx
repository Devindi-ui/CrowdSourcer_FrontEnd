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
  routeId = null
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


  // Auto-load form data when props change (for passenger view)
  useEffect(() => {
      if (passengerView && busId) {
          console.log("Auto-loading form for bus:", busId);
          
          // Find the bus in the buses list
          const selectedBus = buses.find(b => b.bus_id === busId);
          if (selectedBus) {
              console.log("Found bus:", selectedBus);
              
              // Set the route selection
              if (selectedBus.route_id) {
                  setSelectedRoute(selectedBus.route_id.toString());
                  
                  // Filter buses for this route
                  const filtered = buses.filter(
                      (b) => String(b.route_id) === String(selectedBus.route_id)
                  );
                  setFilteredBuses(filtered);
              }
              
              // Pre-fill the bus_id in form
              setForm(prev => ({
                  ...prev,
                  bus_id: busId
              }));
          }
      }
  }, [passengerView, busId, buses]);

  // Watch for feedbacks changes and force re-render
  useEffect(() => {
      console.log("🔥 feedbacks state CHANGED:", feedbacks.length, "items");
      if (feedbacks.length > 0) {
          console.log("First feedback:", feedbacks[0]);
      }
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
        
        // ===== STEP 1: Log all incoming data =====
        console.log("%c=== DEBUG: Adding Feedback ===", "color: yellow; font-size: 14px");
        console.log("1. passengerView:", passengerView);
        console.log("2. userId prop:", userId);
        console.log("3. busId prop:", busId);
        console.log("4. routeId prop:", routeId);
        console.log("5. Current form state:", form);
        console.log("6. Selected route:", selectedRoute);
        console.log("7. Filtered buses:", filteredBuses);
        
        // ===== STEP 2: Validate form data =====
        if (!form.comment || !form.comment.trim()) {
            console.warn("Missing comment");
            alert("Please enter a comment");
            return;
        }
        
        if (!form.rating || form.rating === 0) {
            console.warn("Missing rating");
            alert("Please select a rating");
            return;
        }
        
        // ===== STEP 3: Validate user/bus data =====
        if (passengerView) {
            console.log("Validating passenger data...");
            
            if (!userId) {
                console.error("userId is missing:", userId);
                alert("User information missing. Please log in again.");
                return;
            }
            
            if (!busId) {
                console.error("busId is missing:", busId);
                alert("Bus information missing. Please select a bus first.");
                return;
            }
            
            // Check if userId is valid number
            const userIdNum = parseInt(userId);
            if (isNaN(userIdNum)) {
                console.error("userId is not a number:", userId);
                alert("Invalid user ID format");
                return;
            }
            
            // Check if busId is valid number
            const busIdNum = parseInt(busId);
            if (isNaN(busIdNum)) {
                console.error("busId is not a number:", busId);
                alert("Invalid bus ID format");
                return;
            }
            
            console.log("✅ Passenger validation passed:", { userIdNum, busIdNum });
        }
        
        // ===== STEP 4: Build the data object =====
        const feedbackData = passengerView ? {
            user_id: userId ? parseInt(userId) : null,
            bus_id: busId ? parseInt(busId) : null,
            comment: form.comment.trim(),
            rating: parseInt(form.rating) || 0
        } : {
            user_id: form.user_id ? parseInt(form.user_id) : null,
            bus_id: form.bus_id ? parseInt(form.bus_id) : null,
            comment: form.comment.trim(),
            rating: parseInt(form.rating) || 0
        };
        
        console.log("%c8. FINAL DATA BEING SENT:", "color: green; font-size: 14px", feedbackData);
        console.log("9. Data types:", {
            user_id: typeof feedbackData.user_id,
            user_id_value: feedbackData.user_id,
            bus_id: typeof feedbackData.bus_id,
            bus_id_value: feedbackData.bus_id,
            comment: typeof feedbackData.comment,
            rating: typeof feedbackData.rating
        });
        
        // Make API call 
        console.log("%c10. Making API call to /feedback/create", "color: blue");
        const response = await feedbackAPI.create(feedbackData);
        
        console.log("%c11. API Response:", "color: purple", response);
        console.log("12. Response data:", response.data);
        
        //  Handle response 
        if (response.data?.success) {
        console.log("%c✅ SUCCESS: Feedback added!", "color: green; font-size: 16px");
    
    // Don't show alert - let the UI update speak for itself
    // alert("✅ Feedback added successfully"); // Comment this out if you want
    
    // Reset form
    setForm(emptyForm);
    setSelectedRoute("");
    
    // ===== FIXED REFRESH LOGIC =====
    if (passengerView) {
        console.log("🔄 Refreshing feedback list for bus:", busId);
        
        try {
            // Get ALL feedbacks again
            const freshRes = await feedbackAPI.getAllFeedbacks();
            console.log("Fresh API response:", freshRes);
            
            let allFeedbacks = freshRes.data?.data || [];
            console.log("Total feedbacks from server:", allFeedbacks.length);
            
            // Filter for this bus
            if (busId) {
                const busIdNum = parseInt(busId);
                allFeedbacks = allFeedbacks.filter(fb => {
                    const match = fb.bus_id === busIdNum;
                    if (match) console.log("Keeping feedback:", fb);
                    return match;
                });
                console.log(`✅ Filtered to ${allFeedbacks.length} feedbacks for bus ${busId}`);
            }
            
            // CRITICAL: Update state with new data
            setFeedbacks(allFeedbacks);
            setShowResults(true);
            
            console.log("✅ Feedbacks state updated with", allFeedbacks.length, "items");
            
            // Force a re-render by toggling showResults (if needed)
            setTimeout(() => {
                setShowResults(prev => prev);
            }, 100);
            
        } catch (refreshError) {
            console.error("Error refreshing feedbacks:", refreshError);
        }
    } else {
        const res = await feedbackAPI.getAllFeedbacks();
        setFeedbacks(res.data.data);
        setShowResults(true);
    }
  }
        
    } catch (err) {
        // ===== STEP 7: Detailed error logging =====
        console.error("%c❌ ERROR CAUGHT IN CATCH BLOCK", "color: red; font-size: 16px");
        console.error("Error object:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        
        if (err.response) {
            console.error("Error response status:", err.response.status);
            console.error("Error response headers:", err.response.headers);
            console.error("Error response data:", err.response.data);
            
            // Show the actual server error
            const serverError = err.response.data?.message || 
                               err.response.data?.error || 
                               JSON.stringify(err.response.data);
            alert("❌ Server Error: " + serverError);
        } else if (err.request) {
            console.error("No response received:", err.request);
            alert("❌ No response from server. Check if backend is running.");
        } else {
            console.error("Error setting up request:", err.message);
            alert("❌ Request failed: " + err.message);
        }
    } finally {
        setLoading(false);
        console.log("%c=== END DEBUG ===", "color: yellow");
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
    try {
        setLoading(true);
        console.log("%c=== Loading feedbacks for bus ===", "color: cyan");
        console.log("Bus ID:", busId);
        
        const res = await feedbackAPI.getAllFeedbacks();
        console.log("Raw API response:", res);
        
        let allFeedbacks = res.data?.data || [];
        console.log("All feedbacks:", allFeedbacks.length);
        
        if (busId) {
            const busIdNum = parseInt(busId);
            allFeedbacks = allFeedbacks.filter(fb => {
                const match = fb.bus_id === busIdNum;
                console.log(`Feedback ${fb.feedback_id}: bus_id=${fb.bus_id}, matches=${match}`);
                return match;
            });
            console.log(`Filtered to ${allFeedbacks.length} feedbacks for bus ${busId}`);
        }
        
        setFeedbacks(allFeedbacks);
        setShowResults(true);
        console.log("✅ Feedbacks state updated");
        
    } catch (error) {
        console.error("Failed to load feedbacks", error);
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

  useEffect(() => {
    if (passengerView) {
      //automatically load all feedbacks for passengers
      loadFeedbacksForBus();
    }
  }, [passengerView, busId]);

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
        if (busId) {
            const busIdNum = parseInt(busId);
            allFeedbacks = allFeedbacks.filter(fb => fb.bus_id === busIdNum);
            console.log(`✅ Filtered to ${allFeedbacks.length} 
              feedbacks for bus ${busId}`
            );
        }
        
        // CRITICAL: Update state with new data
        setFeedbacks([...allFeedbacks]);
        setShowResults(true);
        
        // Log the new state
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
        
        await feedbackAPI.deleteFeedback(id);
        console.log("Delete successful");
        
        // Remove from local state immediately (optimistic update)
        setFeedbacks(prev => prev.filter(f => f.feedback_id !== id));
        
        alert("✅ Feedback deleted");
        
        // Optionally refresh from server to be sure
        if (passengerView) {
            await loadFeedbacksForBus();
        }
        
    } catch (error) {
        console.error("Delete failed:", error);
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
    <ThemeLayout pageTitle="Feedback Management">

      <button
        type="button"
        onClick={() => {
          if (mode) {
            setMode(null);
          } else {
            //Navigate based on who is viewing
            if (passengerView) {
              navigate("/passenger");
            } else {
              navigate("/admin");
            }
          }
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
            </div>

            {/* Show feedbacks if there are any */}
            {feedbacks.length > 0 ? (
                <div className="space-y-4">
                    {feedbacks.map((f, index) => (
                        <div key={f.feedback_id || index}
                            className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-600/30 
                                bg-black/60 hover:bg-black/50 transition-all duration-200"
                        >
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-white">{f.comment}</p>
                                <p className="text-sm text-yellow-300">User: {f.user_name} (UID-{f.user_id})</p>
                                <p className="text-sm text-yellow-300">Bus: {f.bus_number}</p>
                                <p className="text-sm text-yellow-300">Route: {f.route_name}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={star <= f.rating ? "text-yellow-400" : "text-gray-600"}
                                        />
                                    ))}
                                </div>
                                
                                {passengerView && (
                                    <button
                                        onClick={() => handleDeleteFeedback(f.feedback_id)}
                                        className="text-red-400 hover:text-red-300 transition p-2"
                                    >
                                        <FaTrash className="text-xl" />
                                    </button>
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
