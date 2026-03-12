import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaRoute,
  FaUser
} from "react-icons/fa";
import { favouriteRouteAPI, routeAPI, userAPI } from "../../services/api";
import ThemeLayout from "../../components/common/Layout/ThemeLayout";

const FavouriteRoute = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    favourite_route_id: "",
    user_id: "",
    route_no: "", 
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [favouriteRoutes, setFavouriteRoutes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const routeRes = await routeAPI.getAllRoutes();
        setRoutes(routeRes.data?.data || []);
        
        const userRes = await userAPI.getAllUsers();
        setUsers(userRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    loadData();
  }, []);

  const resetAll = () => {
    setMode(null);
    setFavouriteRoutes([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);
    setError("");
    setForm({
      favourite_route_id: "",
      user_id: "",
      route_no: "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const populateFormFromFavouriteRoute = (f) => {
    setForm({
      favourite_route_id: f.favourite_route_id,
      user_id: f.user_id,
      route_no: f.route_no || "",
    });
    setEditLoaded(true);
  };

  const addFavouriteRoute = async () => {
    // Validation
    if (!form.user_id || !form.route_no) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await favouriteRouteAPI.create({
        user_id: form.user_id,
        route_no: form.route_no, // Send route_no
        status: 1,
      });

      alert("✅ Favourite Route added successfully");
      resetAll();
    } catch (err) {
      console.error("Add failed:", err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || "Failed to add Favourite Route";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const findFavouriteRoute = async () => {
    try {
      setLoading(true);
      setFavouriteRoutes([]);
      setShowResults(false);
      setError("");

      if (searchType === "id") {
        if (!form.favourite_route_id) {
          alert("Enter Favourite Route ID");
          setLoading(false);
          return;
        }
        const res = await favouriteRouteAPI.getFavouriteRouteById(form.favourite_route_id);
        if (res.data?.success && res.data?.data) {
          setFavouriteRoutes([res.data.data]);
          setShowResults(true);
        } else {
          alert("Favourite Route not found");
        }
      }

      if (searchType === "all") {
        const res = await favouriteRouteAPI.getAllFavouriteRoutes();
        if (res.data?.success && res.data?.data) {
          setFavouriteRoutes(res.data.data);
          setShowResults(true);
        } else {
          setFavouriteRoutes(res.data?.data || []);
          setShowResults(true);
        }
      }

      if (searchType === "text") {
        if (!searchText.trim()) {
          alert("Enter text to search");
          setLoading(false);
          return;
        }
        const res = await favouriteRouteAPI.getFavouriteRouteByText(searchText);
        if (res.data?.success && res.data?.data) {
          setFavouriteRoutes(res.data.data);
          setShowResults(true);
        } else {
          setFavouriteRoutes(res.data?.data || []);
          setShowResults(true);
        }
      }
    } catch (err) {
      console.error("Find failed:", err);
      setError("Favourite Route not found");
      alert("❌ Favourite Route not found");
      setFavouriteRoutes([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const loadFavouriteRouteForEdit = async () => {
    if (!form.favourite_route_id) {
      alert("Enter Favourite Route ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await favouriteRouteAPI.getFavouriteRouteById(form.favourite_route_id);
      
      if (res.data?.success && res.data?.data) {
        populateFormFromFavouriteRoute(res.data.data);
        setFavouriteRoutes([res.data.data]);
        setShowResults(true);
      } else {
        alert("Favourite Route not found");
      }
    } catch (error) {
      console.error("Load failed:", error);
      setError("Favourite Route Not Found");
      alert("❌ Favourite Route Not Found");
    } finally {
      setLoading(false);
    }
  };

  const updateFavouriteRoute = async () => {
    try {
      setLoading(true);
      setError("");

      await favouriteRouteAPI.updateFavouriteRoute(form.favourite_route_id, {
        user_id: form.user_id,
        route_no: form.route_no, // Send route_no
      });

      alert("✅ Favourite Route updated");

      const res = await favouriteRouteAPI.getFavouriteRouteById(form.favourite_route_id);
      if (res.data?.success && res.data?.data) {
        setFavouriteRoutes([res.data.data]);
        setShowResults(true);
      }
    } catch (err) {
      console.error("Update failed:", err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || "Update failed";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteFavouriteRoute = async () => {
    if (!form.favourite_route_id) {
      alert("Enter Favourite Route ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this favourite route?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await favouriteRouteAPI.deleteFavouriteRoute(form.favourite_route_id);
      alert("✅ Favourite Route deleted");

      if (searchType === "all") {
        const res = await favouriteRouteAPI.getAllFavouriteRoutes();
        setFavouriteRoutes(res.data?.data || []);
        setShowResults(true);
      } else {
        setFavouriteRoutes([]);
        setShowResults(false);
      }
      
      setForm({ ...form, favourite_route_id: "" });
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Delete failed");
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addFavouriteRoute();
    else if (mode === "find") findFavouriteRoute();
    else if (mode === "edit" && !editLoaded) loadFavouriteRouteForEdit();
    else if (mode === "edit" && editLoaded) updateFavouriteRoute();
    else if (mode === "delete") deleteFavouriteRoute();
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.user_id === parseInt(userId));
    return user ? user.name : 'Unknown';
  };

  return (
    <ThemeLayout pageTitle="Favourite Routes Management">
      {/* Error Display */}
      {error && (
        <div className="mt-20 max-w-xl mx-auto bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl">
          Error: {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (mode) resetAll();
          else navigate("/admin");
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 mt-15
          bg-black/60 backdrop-blur-md border border-yellow-600
          text-yellow-400 px-4 py-2 rounded-full 
          shadow-[0_0_20px_rgba(255,215,0,0.25)]
          hover:bg-yellow-500 hover:text-black transition duration-300"
      >
        <FaArrowLeft className="text-yellow-400" />
        <span className="font-semibold text-sm">Back</span>
      </button>

      {!mode && (
        <div className="mt-25 flex flex-col items-center gap-5 mb-10 [&>button]:w-72">
          <ActionBtn icon={<FaPlusCircle />} text="Add Favourite Route" onClick={() => setMode("add")} />
          <ActionBtn icon={<FaSearch />} text="Find Favourite Route" onClick={() => setMode("find")} />
          <ActionBtn icon={<FaEdit />} text="Update Favourite Route" onClick={() => setMode("edit")} />
          <ActionBtn icon={<FaTrash />} text="Delete Favourite Route" onClick={() => setMode("delete")} />
        </div>
      )}

      {mode && (
        <div className="flex justify-center items-center h-full mt-20 overflow-hidden">
          <div className="max-w-xl w-full bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] p-6 backdrop-blur-md">
            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">{mode} Favourite Route</h2>

            {mode === "edit" && !editLoaded && (
              <input
                name="favourite_route_id"
                value={form.favourite_route_id}
                onChange={handleChange}
                placeholder="Enter Favourite Route ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                {/* User Selection */}
                <div className="mb-3">
                  <label className="text-yellow-400 block mb-1 text-sm">Select User</label>
                  <select
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  >
                    <option value="">Select User</option>
                    {users.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.name} (ID: {u.user_id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Route Number Selection */}
                <div className="mb-3">
                  <label className="text-yellow-400 block mb-1 text-sm">Select Route Number</label>
                  <select
                    name="route_no"
                    value={form.route_no}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  >
                    <option value="">Select Route Number</option>
                    {routes.map((r) => (
                      <option key={r.route_id} value={r.route_no}>
                        {r.route_no} - {r.route_name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  disabled={loading}
                >
                  <option value="id">Find by ID</option>
                  <option value="all">Get All Favourite Routes</option>
                  <option value="text">Search by Text</option>
                </select>

                {searchType === "id" && (
                  <input
                    name="favourite_route_id"
                    value={form.favourite_route_id}
                    onChange={handleChange}
                    placeholder="Favourite Route ID"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by user ID, user name, or route name"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    disabled={loading}
                  />
                )}
              </>
            )}

            {mode === "delete" && (
              <input
                name="favourite_route_id"
                value={form.favourite_route_id}
                onChange={handleChange}
                placeholder="Favourite Route ID"
                className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={loading}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)] disabled:opacity-50"
              >
                {loading ? "Please wait..." : 
                  mode === "edit" && !editLoaded ? "Load" : 
                  mode === "edit" && editLoaded ? "Update" :
                  mode === "delete" ? "Delete" : "Submit"}
              </button>

              <button
                onClick={resetAll}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showResults && favouriteRoutes.length > 0 && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            🔍 Search Results ({favouriteRoutes.length})
          </h2>

          <div className="space-y-4">
            {favouriteRoutes.map((f) => (
              <div
                key={f.favourite_route_id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-600/30 
                  bg-black/60 hover:bg-black/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-black flex items-center justify-center font-bold text-lg shadow-[0_0_8px_rgba(255,215,0,0.4)]">
                    <FaRoute />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {f.user_name || `User ID: ${f.user_id}`}
                    </p>
                    <p className="text-sm text-yellow-300 flex items-center gap-1">
                      <FaUser className="text-xs" /> User ID: {f.user_id}
                    </p>
                    <p className="text-sm text-yellow-300 flex items-center gap-1">
                      <FaRoute className="text-xs" /> Route: {f.route_no} - {f.route_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Favourite ID: {f.favourite_route_id}
                    </p>
                  </div>
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

export default FavouriteRoute;