import { useEffect, useState } from "react";
import './styles/custom.css';
import './styles/global.css';
import { Toaster } from "react-hot-toast";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Navbar from "./components/Layout/Navbar";
import MainDashboard from "./components/MainDashboard";
import { Route, Routes, useLocation } from "react-router-dom";
import AdminPage from "./pages/Admin/AdminDashboard";
import PassengerPage from "./pages/Passenger/PassengerDashboard";
import OwnerPage from "./pages/Owner/OwnerDashboard";
import CDPage from "./pages/Conductor/Driver/Dashboard";

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
                            <Navbar role={role} onLogout={handleLogout}/>
                        )}                       

                        <Routes>

                            <Route 
                                path="/"
                                element= {
                                    <MainDashboard
                                        onSelectRole={setRole}
                                    />
                                }
                            />

                            <Route path="/user" element={<PassengerPage/>}/>
                            <Route path="/admin" element={<AdminPage/>}/>
                            <Route path="/owner" element={<OwnerPage/>}/>
                            <Route path="/cd" element={<CDPage/>}/>
                            <Route path="/register" element={<Register/>} />

                        </Routes>
                    </>
                )}
        </>
    )
}

export default App;