import React from "react";
import EditAdForm from "../../components/Ads/EditAdForm";

const EditAd = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Chỉnh sửa quảng cáo
      </h1>
      <EditAdForm />
    </div>
  );
};

export default EditAd;
