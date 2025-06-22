import React from "react";

const FilterBar = ({ filterType, setFilterType }) => (
  <div className="flex gap-4 mb-6">
    {["day", "week", "month", "quarter", "year", "custom"].map((type) => (
      <button
        key={type}
        onClick={() => setFilterType(type)}
        className={`px-4 py-2 rounded ${
          filterType === type
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {type.toUpperCase()}
      </button>
    ))}
  </div>
);

export default FilterBar;
