import React from "react";
import AddBrandForm from "../../components/Brand/AddBrandForm";

const AddBrand = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Thêm thương hiệu mới
      </h1>
      <AddBrandForm />
    </div>
  );
};

export default AddBrand;
