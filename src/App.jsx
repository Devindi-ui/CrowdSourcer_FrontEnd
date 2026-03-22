import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";

import AdminLayout from "./components/layout/AdminLayout";
import DriverLayout from "./components/layout/DriverLayout";
import OwnerLayout from "./components/layout/OwnerLayout";
import MainDashboard from "./components/MainDashboard";

import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import ForgotPassword from "./components/Auth/ForgotPassword";

/* ADMIN PAGES */
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Bus from "./pages/Admin/bus";
import RoutePage from "./pages/Admin/route";
import Trip from "./pages/Admin/trip";
import CrowdReport from "./pages/Admin/crowdReport";
import Alert from "./pages/Admin/alert";
import BusAssignment from "./pages/Admin/busAssignment";
import BusType from "./pages/Admin/busType";
import CurrentSituation from "./pages/Admin/currentSituation";
import FavouriteRoute from "./pages/Admin/favRoute";
import Feedback from "./pages/Admin/feedback";
import Role from "./pages/Admin/role";
import RouteStop from "./pages/Admin/routeStop";
import User from "./pages/Admin/user";

// Passenger Pages
import PassengerHome from "./pages/Passenger/PassengerHome";
import PassengerStations from "./pages/Passenger/PassengerStations";
import PassengerBookings from "./pages/Passenger/PassengerBookings";
import PassengerAnalytics from "./pages/Passenger/PassengerAnalytics";
import PassengerHistory from "./pages/Passenger/PassengerHistory";
import PassengerSettings from "./pages/Passenger/PassengerSettings";
import PassengerBus from "./pages/Passenger/PassengerBus";
import PassengerCurrentSituation from "./pages/Passenger/PassengerCurrentSituation";
import PassengerFavRoute from "./pages/Passenger/PassengerFavRoute";
import PassengerFeedback from "./pages/Passenger/PassengerFeedback";
import PassengerDashboard from "./pages/Passenger/PassengerDashboard";


/* ROLE DASHBOARDS */
import DriverDashboard from "./pages/Conductor/Dashboard";
import OwnerDashboard from "./pages/Owner/Dashboard";

const App = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<MainDashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="user" element={<User />} />
        <Route path="bus" element={<Bus />} />
        <Route path="route" element={<RoutePage />} />
        <Route path="trip" element={<Trip />} />
        <Route path="crowdReport" element={<CrowdReport />} />
        <Route path="alert" element={<Alert />} />
        <Route path="busAssignment" element={<BusAssignment />} />
        <Route path="busType" element={<BusType />} />
        <Route path="currentSituation" element={<CurrentSituation />} />
        <Route path="favouriteRoute" element={<FavouriteRoute />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="role" element={<Role />} />
        <Route path="routeStop" element={<RouteStop />} />
      </Route>

      {/* Passenger Routes */}
      <Route path="/passenger" element={<PassengerDashboard />}>
          <Route index element={<PassengerHome />} />
          <Route path="home" element={<PassengerHome />} />
          <Route path="dashboard" element={<PassengerHome />} />
          <Route path="station" element={<PassengerStations />} />
          <Route path="bookings" element={<PassengerBookings />} />
          <Route path="analytics" element={<PassengerAnalytics />} />
          <Route path="history" element={<PassengerHistory />} />
          <Route path="settings" element={<PassengerSettings />} />
      </Route>
      {/* StandAlone pages */}
          <Route path="passenger/bus" element={<PassengerBus />} />
          <Route path="passenger/currentSituation" element={<PassengerCurrentSituation />} />
          <Route path="passenger/favouriteRoute" element={<PassengerFavRoute />} />
          <Route path="passenger/feedback" element={<PassengerFeedback />} />
    </Routes>
  );
}

export default App;