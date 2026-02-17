import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";
import { favouriteRouteAPI, routeAPI, userAPI } from "../../services/api";
import ThemeLayout from "../../components/Layout/ThemeLayout";

const FavouriteRoute = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    favourite_route_id: "",
    user_id: "",
    route_id: "",
  });

  const [searchType, setSearchType] = useState("id");
  const [searchText, setSearchText] = useState("");
  const [favouriteRoutes, setFavouriteRoutes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await routeAPI.getAllRoutes();
        setRoutes(res.data.data);
      } catch (error) {
        console.error("Failed to load routes");
      }
    };
    loadRoutes();
  }, []);

  const resetAll = () => {
    setMode(null);
    setFavouriteRoutes([]);
    setSearchText("");
    setSearchType("id");
    setShowResults(false);
    setEditLoaded(false);
    setForm({
      favourite_route_id: "",
      user_id: "",
      route_id: "",
    });
    setTimeout(() => setMode(null), 0);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const populateFormFromFavouriteRoute = (f) => {
    setForm({
      favourite_route_id: f.favourite_route_id,
      user_id: f.user_id,
      route_id: f.route_id || "",
    });
    setEditLoaded(true);
  };

  const addFavouriteRoute = async () => {
    try {
      setLoading(true);
      await favouriteRouteAPI.create({
        user_id: form.user_id,
        route_id: form.route_id,
        status: 1,
      });
      alert("✅ Favourite Route added successfully");
      resetAll();
    } catch (err) {
      alert("❌ Failed to add Favourite Route");
    } finally {
      setLoading(false);
    }
  };

  const findFavouriteRoute = async () => {
    try {
      setLoading(true);
      setFavouriteRoutes([]);
      setShowResults(false);
      setMode("find");

      if (searchType === "id") {
        if (!form.favourite_route_id) return alert("Enter Favourite Route ID");
        const res = await favouriteRouteAPI.getFavouriteRouteById(
          form.favourite_route_id
        );
        setFavouriteRoutes([res.data.data]);
        setShowResults(true);
      }

      if (searchType === "all") {
        const res = await favouriteRouteAPI.getAllFavouriteRoutes();
        setFavouriteRoutes(res.data.data);
        setShowResults(true);
      }

      if (searchType === "text") {
        if (!searchText.trim()) return alert("Enter text to search");
        const res = await favouriteRouteAPI.getFavouriteRouteByText(searchText);
        setFavouriteRoutes(res.data.data || []);
        setShowResults(true);
      }
    } catch (err) {
      alert("❌ Favourite Route not found");
      setFavouriteRoutes([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const loadFavouriteRouteForEdit = async () => {
    if (!form.favourite_route_id) return alert("Enter Favourite Route ID");
    try {
      setLoading(true);
      const res = await favouriteRouteAPI.getFavouriteRouteById(
        form.favourite_route_id
      );
      populateFormFromFavouriteRoute(res.data.data);
      setFavouriteRoutes([res.data.data]);
      setShowResults(true);
    } catch (error) {
      alert("❌ Favourite Route Not Found");
    } finally {
      setLoading(false);
    }
  };

  const updateFavouriteRoute = async () => {
    try {
      setLoading(true);
      await favouriteRouteAPI.updateFavouriteRoute(form.favourite_route_id, {
        user_id: form.user_id,
        route_id: form.route_id,
      });
      alert("✅ Favourite Route updated");
      const res = await favouriteRouteAPI.getFavouriteRouteById(
        form.favourite_route_id
      );
      setFavouriteRoutes([res.data.data]);
      setShowResults(true);
    } catch (err) {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteFavouriteRoute = async () => {
    try {
      setLoading(true);
      await favouriteRouteAPI.deleteFavouriteRoute(form.favourite_route_id);
      alert("✅ Favourite Route deleted");
      const res = await favouriteRouteAPI.getAllFavouriteRoutes();
      setFavouriteRoutes(res.data.data);
      setShowResults(true);
    } catch (err) {
      alert("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "add") addFavouriteRoute();
    if (mode === "find") findFavouriteRoute();
    if (mode === "edit" && !editLoaded) loadFavouriteRouteForEdit();
    else if (mode === "edit") updateFavouriteRoute();
    if (mode === "delete") deleteFavouriteRoute();
  };

  return (
    <ThemeLayout pageTitle="Favourite Routes Management">
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
              />
            )}

            {(mode === "add" || (mode === "edit" && editLoaded)) && (
              <>
                <input
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                  placeholder="User ID"
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />

                <select
                  name="route_id"
                  value={form.route_id}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                >
                  <option value="">Select Route</option>
                  {routes.map((r) => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.route_name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {mode === "find" && (
              <>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
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
                  />
                )}

                {searchType === "text" && (
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by user ID or route name"
                    className="w-full p-3 mb-3 bg-black/60 border border-yellow-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none"
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
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(255,215,0,0.3)]"
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

      {showResults && favouriteRoutes.length > 0 && (
        <div className="bg-black/70 border border-yellow-600/40 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.15)] p-6 mt-10 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            🔍 Search Results
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
                    {f.favourite_route_id}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      User ID: {f.user_id}
                    </p>
                    <p className="text-sm text-yellow-300">
                      User Name: {f.user_name}
                    </p>
                    <p className="text-sm text-yellow-300">
                      Route: {f.route_name}
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
