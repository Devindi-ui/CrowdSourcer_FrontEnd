// src/components/layout/ThemeLayout.jsx
import React from "react";

const ThemeLayout = ({ children, pageTitle }) => {
  return (
    <div className="min-h-screen bg-black/90 text-white font-sans p-6">
      <h1 className="text-3xl font-bold mb-8 tracking-wide text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
        {pageTitle}
      </h1>
      {children}
    </div>
  );
};

export default ThemeLayout;
