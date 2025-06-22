import React from "react";
import AddCategoryForm from "../../components/Category/AddCategoryForm";

const AddCategory = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Thêm danh mục mới
      </h1>
      <AddCategoryForm />
    </div>
  );
};

export default AddCategory;
