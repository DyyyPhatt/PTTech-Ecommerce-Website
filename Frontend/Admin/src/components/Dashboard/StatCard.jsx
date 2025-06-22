import React from "react";

const StatCard = ({ title, value, className, onClick }) => (
  <div
    className={`bg-white p-6 rounded-lg shadow-md text-center cursor-pointer ${className}`}
    onClick={onClick}
  >
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default StatCard;
