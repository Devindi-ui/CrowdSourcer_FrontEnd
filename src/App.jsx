import { useEffect, useState } from "react";
import './styles/custom.css';
import './styles/global.css';
import { Toaster } from "react-hot-toast";
import Login from "./components/Auth/Login";
import { Navbar } from "./components/Layout/Navbar";
import MainDashboard from "./components/MainDashboard";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    //check login when app loads
    useEffect(() => {
        const token = localStorage.getItem("token");
        if(token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <div className="bg-gradient-to-br from-slate-900
                     to-sky-500 min-h-screen">
            <div className="container mx-auto p-8">

                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 3000,
                        style: {background: "#363636", color: "white"},
                    }}
                />

            {/* IF NOT LOGGED IN > SHOW LOGIN */}
            {!isLoggedIn ? (
                <Login onLoginSuccess={() => setIsLoggedIn(true)}/>
            ) : (
                <>
                    {/* IF LOGGED IN > SHOW NAVBAR */}
                    <MainDashboard/>
                </>
            )}
            </div>
                   
        </div>
    )
}

export default App;