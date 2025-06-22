import React from "react";
import PropTypes from "prop-types";

const InputField = ({
  type,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  icon: Icon,
  error,
  showToggle,
  toggleVisibility,
}) => (
  <>
    <div className="relative">
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center px-3 
                      bg-gray-100 border border-gray-300 rounded-l-lg
                      dark:bg-gray-700 dark:border-gray-500"
      >
        {Icon && (
          <Icon
            className="text-gray-500 dark:text-gray-300 group-focus-within:text-red-700"
            size={20}
          />
        )}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-3 pl-14 border rounded-lg transition-all duration-200 ease-in-out
          ${
            error
              ? "border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-500"
              : "border-gray-300 hover:border-red-400 hover:shadow focus:border-red-900 focus:ring-red-900 dark:border-gray-500 dark:hover:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500"
          }
          bg-white text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:shadow-md
          dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
        `}
      />
      {showToggle && (
        <span
          onClick={toggleVisibility}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer
                     text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-500"
        >
          {showToggle}
        </span>
      )}
    </div>
    {error && (
      <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>
    )}
  </>
);

InputField.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  icon: PropTypes.elementType,
  error: PropTypes.string,
  showToggle: PropTypes.node,
  toggleVisibility: PropTypes.func,
};

export default InputField;
