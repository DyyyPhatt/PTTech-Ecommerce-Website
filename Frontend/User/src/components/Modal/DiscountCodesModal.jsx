import React from "react";
import { FaGift, FaTimes, FaPercentage, FaMoneyBillWave } from "react-icons/fa";

const DiscountCodesModal = ({
  isOpen,
  onClose,
  discountCodes,
  loading,
  error,
  onApplyCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative border border-gray-200 dark:border-gray-700 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
            <FaGift className="text-pink-500 dark:text-pink-400" /> Mã giảm giá
            khả dụng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-xl transition-colors"
            title="Đóng"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        {loading && (
          <p className="text-gray-500 dark:text-gray-400">
            Đang tải mã giảm giá...
          </p>
        )}
        {error && (
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        )}
        {!loading && discountCodes.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            Hiện không có mã giảm giá nào.
          </p>
        )}

        <ul className="space-y-4">
          {discountCodes.map((code) => (
            <li
              key={code.id}
              className="border border-indigo-100 dark:border-indigo-700 rounded-xl p-4 bg-indigo-50/60 dark:bg-indigo-900/60 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 tracking-wide uppercase">
                    {code.code}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    {code.description || "Không có mô tả"}
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p className="flex items-center gap-1">
                      <strong className="text-gray-800 dark:text-gray-200">
                        Giảm:
                      </strong>{" "}
                      {code.discountType === "percentage" ? (
                        <>
                          {`${code.discountValue}`}
                          <FaPercentage className="inline-block text-green-600 dark:text-green-400" />
                        </>
                      ) : (
                        <>
                          {`-${code.discountValue.toLocaleString()}đ`}
                          <FaMoneyBillWave className="inline-block text-green-600 dark:text-green-400" />
                        </>
                      )}
                    </p>
                    {code.minimumPurchaseAmount && (
                      <p>
                        <strong>Đơn tối thiểu:</strong>{" "}
                        {code.minimumPurchaseAmount.toLocaleString()}đ
                      </p>
                    )}
                    {code.maxDiscountAmount && (
                      <p>
                        <strong>Giảm tối đa:</strong>{" "}
                        {code.maxDiscountAmount.toLocaleString()}đ
                      </p>
                    )}
                    <p>
                      <strong>HSD:</strong>{" "}
                      {new Date(code.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {onApplyCode && (
                  <button
                    onClick={() => onApplyCode(code.code)}
                    className="ml-4 mt-1 px-3 py-1 bg-green-600 dark:bg-green-700 text-white text-sm rounded-md shadow hover:bg-green-700 dark:hover:bg-green-800 transition-all"
                  >
                    Sử dụng
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="mt-6 w-full px-5 py-3 bg-indigo-600 dark:bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default DiscountCodesModal;
