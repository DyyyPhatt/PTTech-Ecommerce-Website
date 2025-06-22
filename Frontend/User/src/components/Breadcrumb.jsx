import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

const Breadcrumb = ({ items }) => {
  return (
    <nav
      className="flex justify-center px-5 py-4 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm w-full mx-auto"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {item.href ? (
              <Link
                to={item.href}
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                {item.icon && (
                  <item.icon className="w-4 h-4 mr-2" aria-hidden="true" />
                )}
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {item.label}
              </span>
            )}

            {index < items.length - 1 && (
              <FaChevronRight
                className="block w-3 h-3 mx-2 text-gray-500 dark:text-gray-500"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
