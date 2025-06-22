import React from "react";
import EditReviewForm from "../../components/Review/EditReviewForm";

const EditReview = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Chỉnh sửa đánh giá
      </h1>
      <EditReviewForm />
    </div>
  );
};

export default EditReview;
