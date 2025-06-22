import React from "react";
import EditPriceProductForm from "../../components/Product/EditPriceProductForm";
const EditPrice = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Chỉnh sửa giá sản phẩm
      </h1>
      <EditPriceProductForm />
    </div>
  );
};

export default EditPrice;
