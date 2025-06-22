import React from "react";
import EditProductForm from "../../components/Product/EditProductForm";

const EditProduct = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Chỉnh sửa sản phẩm
      </h1>
      <EditProductForm />
    </div>
  );
};

export default EditProduct;
