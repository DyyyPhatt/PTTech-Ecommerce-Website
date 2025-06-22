import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="max-w-xs bg-gradient-to-b from-gray-100 to-white rounded-xl border border-gray-200 shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-56 bg-gray-300 rounded-t-xl"></div>

      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded-md mb-2"></div>
        <div className="h-6 bg-gray-300 rounded-md mb-4 w-3/4"></div>

        <div className="flex items-center mb-4 space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-300 rounded-full"></div>
          ))}
        </div>

        <div className="h-4 bg-gray-300 rounded-md mb-4 w-1/2"></div>

        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-300 rounded-md w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-1/4"></div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <div className="h-10 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
