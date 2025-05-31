import React from "react";

const Input = ({ label, type = "text", value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1 font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
      />
    </div>
  );
};

export default Input;
