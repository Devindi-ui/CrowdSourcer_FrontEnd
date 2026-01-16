import { useEffect, useState } from "react";
import './styles/custom.css';
import './styles/global.css';
import { Toaster } from "react-hot-toast";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Navbar from "./components/Layout/Navbar";
import MainDashboard from "./components/MainDashboard";
import { Route, Routes, useLocation } from "react-router-dom";
import PassengerDashboard from "./pages/Passenger/passengerDashboard";
import OwnerDashboard from "./pages/Owner/ownerDashboard";
import CdDashboard from "./pages/Conductor/cdDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";

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
                                path="/main"
                                element= {
                                    <MainDashboard
                                        onSelectRole={setRole}
                                        onLogout={handleLogout}
                                    />
                                }
                            />

                            <Route path="/register" element={<Register/>} />
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/main" element={<MainDashboard/>}/>
                            <Route path="/user" element={<PassengerDashboard/>}/>
                            <Route path="/admin" element={<AdminDashboard/>}/>
                            <Route path="/owner" element={<OwnerDashboard/>}/>
                            <Route path="/cd" element={<CdDashboard/>}/>

                        </Routes>
                    </>
                )}
        </>
    )
}

export default App;