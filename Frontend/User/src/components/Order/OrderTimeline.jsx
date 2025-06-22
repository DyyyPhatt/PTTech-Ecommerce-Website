import { FaClock } from "react-icons/fa";

const OrderTimeline = ({
  order,
  formatDate,
  mediaModal,
  openModal,
  closeModal,
}) => {
  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
        <FaClock className="text-indigo-500 text-lg" />
        <span className="text-xl">Lịch sử đơn hàng</span>
      </h4>

      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-3 pl-5">
        <li className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            Ngày tạo:
          </span>
          <span>{formatDate(order.createdAt)}</span>
        </li>

        {order.updatedAt && (
          <li className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Cập nhật lần cuối:
            </span>
            <span>{formatDate(order.updatedAt)}</span>
          </li>
        )}

        {order.orderStatus && (
          <li className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Trạng thái hiện tại:
            </span>
            <span className="italic text-indigo-600 dark:text-indigo-400">
              {order.orderStatus}
            </span>
          </li>
        )}

        {order.returnReason && (
          <li className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Lý do trả hàng:
            </span>
            <span>{order.returnReason}</span>
          </li>
        )}

        {order.cancellationReason && (
          <li className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Lý do hủy đơn:
            </span>
            <span>{order.cancellationReason}</span>
          </li>
        )}

        {order.returnImageUrls?.length > 0 && (
          <li>
            <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-2">
              Hình ảnh trả hàng:
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
              {order.returnImageUrls.map((url, index) => (
                <div
                  key={index}
                  className="aspect-square max-w-[70px] max-h-[70px] overflow-hidden rounded-lg shadow-md group cursor-pointer relative"
                  onClick={() => openModal("image", url)}
                >
                  <img
                    src={url}
                    alt={`Ảnh trả hàng ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                </div>
              ))}
            </div>
          </li>
        )}

        {order.returnVideoUrls?.length > 0 && (
          <li>
            <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-2">
              Video trả hàng:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {order.returnVideoUrls.map((url, index) => (
                <div
                  key={index}
                  className="aspect-square max-w-[70px] max-h-[70px] overflow-hidden rounded-lg shadow-md group cursor-pointer relative"
                  onClick={() => openModal("video", url)}
                >
                  <video
                    src={url}
                    muted
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                </div>
              ))}
            </div>
          </li>
        )}
      </ul>

      {mediaModal.open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] overflow-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 z-10 text-gray-700 dark:text-gray-300 hover:text-red-600 text-3xl bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg transition-all"
            >
              &times;
            </button>

            {mediaModal.type === "image" ? (
              <img
                src={mediaModal.url}
                alt="Preview"
                className="w-full h-auto max-h-[100vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={mediaModal.url}
                controls
                autoPlay
                className="w-full h-auto max-h-[100vh] rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
