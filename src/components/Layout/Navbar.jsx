import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
    const [userType, setUserType] = useState("");

    useEffect(() => {
        setUserType('Admin');
    });

    return (
        <nav className="bg-gradient-to-br from-slate-900 to-sky-500">
            .
        </nav>
    )
}