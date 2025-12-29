import { useState } from "react";
import './styles/custom.css';
import './styles/global.css';
import { Toaster } from "react-hot-toast";
import Login from "./components/Auth/Login";

function App() {
    return (
        <div className="bg-gradient-to-br from-slate-900
                     to-sky-500 min-h-screen">
            <div className="container mx-auto p-8">

            <Login/>
            </div>
                   
        </div>
    )
}

export default App;