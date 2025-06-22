import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ path }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(path);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center"
    >
      <svg
        className="w-5 h-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 10"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 5H1m0 0L5 9m-4-4L5 1"
        />
      </svg>
      <span className="sr-only">Back</span>
    </button>
  );
};

export default BackButton;
