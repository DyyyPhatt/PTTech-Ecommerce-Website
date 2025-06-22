import React from "react";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

const OutOfStockModal = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  totalItems = 0,
}) => {
  if (!isOpen) return null;

  const extractProducts = (msg) => {
    const match = msg.match(/\[(.*?)\]/);
    if (!match || !match[1]) return [];
    return match[1].split(",").map((name) => name.trim());
  };

  const productNames = extractProducts(message);
  const allOutOfStock = productNames.length >= totalItems;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/70 via-gray-800/60 to-black/70 backdrop-blur-xl backdrop-saturate-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="
          bg-gradient-to-br from-white via-sky-50 to-blue-100 dark:from-gray-800 dark:to-gray-900
          rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-10 flex flex-col items-center text-center
          ring-2 ring-blue-300/40 dark:ring-blue-700/50 animate-scaleIn transition-all duration-300 ease-out
        "
      >
        {/* Icon cảnh báo */}
        <div className="mb-8">
          <lord-icon
            src="https://cdn.lordicon.com/qhviklyi.json"
            trigger="loop"
            colors="primary:#e83a3a,secondary:#f8b4b4"
            style={{ width: "100px", height: "100px" }}
          ></lord-icon>
        </div>

        <h2
          id="modal-title"
          className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-6 tracking-wide drop-shadow-md"
        >
          {allOutOfStock
            ? "Sản phẩm đã hết hàng"
            : "Một số sản phẩm đã hết hàng"}
        </h2>

        <p className="text-gray-800 dark:text-gray-300 mb-4 text-lg font-medium">
          {allOutOfStock
            ? "Sản phẩm sau hiện không đủ số lượng trong kho:"
            : "Những sản phẩm sau hiện không đủ số lượng trong kho:"}
        </p>

        <ul className="mb-8 max-h-52 overflow-y-auto list-disc list-inside text-base text-red-700 dark:text-red-400 space-y-2 w-full px-8 font-semibold">
          {productNames.length > 0 ? (
            productNames.map((name, index) => (
              <li
                key={index}
                className="break-words hover:text-red-900 dark:hover:text-red-300 transition-colors"
              >
                {name}
              </li>
            ))
          ) : (
            <li>Không xác định được sản phẩm</li>
          )}
        </ul>

        {!allOutOfStock && (
          <p className="text-gray-700 dark:text-gray-400 mb-8 text-base">
            Bạn muốn tiếp tục đặt hàng với những sản phẩm còn lại không?
          </p>
        )}

        <div className="flex justify-center gap-6 w-full px-8">
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold shadow-md transition-all"
            type="button"
          >
            <XCircleIcon className="w-5 h-5" />
            Huỷ
          </button>

          {!allOutOfStock && (
            <button
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold shadow-lg transition-all"
              type="button"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Tiếp tục
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutOfStockModal;
