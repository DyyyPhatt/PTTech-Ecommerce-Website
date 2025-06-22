import React from "react";
import AddBrandScheduleForm from "../../components/Brand/AddBrandScheduleForm";

const AddBrandSchedule = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Đặt lịch thương hiệu
      </h1>
      <AddBrandScheduleForm />
    </div>
  );
};

export default AddBrandSchedule;
