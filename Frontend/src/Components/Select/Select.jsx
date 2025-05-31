import React from "react";

export function Select({ options, onValueChange, value }) {
  return (
    <select
      className="p-2 border rounded w-full"
      onChange={(e) => onValueChange(e.target.value)}
      value={value}
    >
      <option value="">Select a table</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}


export function SelectItem({ children }) {
  return <option>{children}</option>;
}
