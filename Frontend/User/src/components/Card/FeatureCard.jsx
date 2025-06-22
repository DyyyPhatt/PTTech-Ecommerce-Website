import React from "react";

const FeatureCard = ({ icon, title, content }) => (
  <div
    className="flex flex-col items-center text-center gap-4 p-6 
    bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 
    dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
    rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full 
    border border-gray-200 hover:border-indigo-400 
    dark:border-gray-700 dark:hover:border-indigo-500"
  >
    <div
      className="w-16 h-16 flex items-center justify-center rounded-full 
      bg-gradient-to-r from-indigo-400 to-blue-500 
      dark:bg-gradient-to-r dark:from-indigo-700 dark:to-blue-800 
      text-white shadow-lg mb-2"
    >
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {content}
      </p>
    </div>
  </div>
);

export default FeatureCard;
