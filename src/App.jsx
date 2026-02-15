import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Navbar from "./components/Layout/Navbar";
import MainDashboard from "./components/MainDashboard";
import { Route, Routes, useLocation } from "react-router-dom";
import PassengerDashboard from "./pages/Passenger/passengerDashboard";
import OwnerDashboard from "./pages/Owner/ownerDashboard";
import CdDashboard from "./pages/Conductor/cdDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import User from "./pages/Admin/user";
import Alert from "./pages/Admin/alert";
import Bus from "./pages/Admin/bus";
import BusAssignment from "./pages/Admin/busAssignment";
import BusType from "./pages/Admin/busType";
import CrowdReport from "./pages/Admin/crowdReport";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);

    const location = useLocation();

    //check login when app loads
    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");

        if(token) {
            setIsLoggedIn(true);
            setRole(savedRole); //restore role if exists
        }
    }, []);

    //LOGOUT 
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        setIsLoggedIn(false);
        setRole(null);
    };

    //show navbar only after main dashboard
    const showNavbar = isLoggedIn && location.pathname !== "/";


    return (
        <>
            <Toaster position="top-center"/>

            {/* show login if not logged in */}
                {!isLoggedIn ? (
                    <Login 
                        onLoginSuccess={(userRole) => {
                            setIsLoggedIn(true);
                            setRole(userRole);
                            localStorage.setItem("role", userRole);
                        }}
                    />
                ):(
                    <>

                        {showNavbar && (
                            <Navbar onLogout={handleLogout}/>
                        )}                       

                        <Routes>

                            <Route 
                                path="/"
                                element= {
                                    <MainDashboard
                                        onSelectRole={setRole}
                                        onLogout={handleLogout}
                                    />
                                }
                            />

                            <Route path="/register" element={<Register/>} />
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/passenger" element={<PassengerDashboard/>}/>
                            <Route path="/admin" element={<AdminDashboard/>}/>
                            <Route path="/owner" element={<OwnerDashboard/>}/>
                            <Route path="/cd" element={<CdDashboard/>}/>
                            <Route path="/alert" element={<Alert/>}/>
                            <Route path="/user" element={<User/>}/>
                            <Route path="/bus" element={<Bus/>}/>
                            <Route path="/busAssignment" element={<BusAssignment/>}/>
                            <Route path="/busType" element={<BusType/>}/>
                            <Route path="/crowdReport" element={<CrowdReport/>}/>

                        </Routes>
                    </>
                )}
        </>
    )
}

export default App;