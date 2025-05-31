import React from "react";
// import "./button.css"; // Optional for custom styling

export function Button({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${className}`}
    >
      {children}
    </button>
  );
}
