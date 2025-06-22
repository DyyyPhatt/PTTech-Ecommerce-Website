import React from "react";
import AddCategoryScheduleForm from "../../components/Category/AddCategoryScheduleForm";

const AddCategorySchedule = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Đặt lịch danh mục
      </h1>
      <AddCategoryScheduleForm />
    </div>
  );
};

export default AddCategorySchedule;
