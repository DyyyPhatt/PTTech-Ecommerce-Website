import React, { useState } from "react";
import { FaTimes, FaRegCommentDots } from "react-icons/fa";
import { toast } from "react-toastify";

const CancelOrReturnModal = ({ type, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [showAllReasons, setShowAllReasons] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.warn("Vui lòng nhập lý do!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (type === "return") {
      const images = mediaFiles
        .filter((m) => m.type === "image")
        .map((m) => m.file);

      const videos = mediaFiles
        .filter((m) => m.type === "video")
        .map((m) => m.file);

      onSubmit(reason, images, videos);
    } else if (type === "cancel") {
      onSubmit(reason);
    }

    onClose();
  };

  const sampleReasons =
    type === "cancel"
      ? [
          "Tôi đặt nhầm sản phẩm",
          "Tôi muốn thay đổi đơn hàng",
          "Tìm thấy giá tốt hơn ở nơi khác",
          "Không cần sản phẩm nữa",
          "Thời gian giao hàng quá lâu",
          "Tôi đã đặt lại đơn khác",
          "Thông tin nhận hàng không đúng, cần hủy để đặt lại",
          "Người nhận không có mặt để nhận hàng",
          "Tôi muốn đổi sang phương thức thanh toán khác",
          "Sợ bị lừa đảo hoặc không tin tưởng người bán",
        ]
      : [
          "Sản phẩm bị lỗi/hỏng khi nhận",
          "Không đúng sản phẩm tôi đã đặt",
          "Sản phẩm không giống mô tả",
          "Tôi đổi ý và không muốn giữ sản phẩm",
          "Sản phẩm bị thiếu phụ kiện hoặc bộ phận",
          "Sản phẩm không hoạt động đúng cách",
          "Không vừa kích cỡ/màu sắc không như mong đợi",
          "Sản phẩm đã bị sử dụng hoặc có dấu hiệu hư hại",
          "Chất lượng không đạt như kỳ vọng",
          "Được tặng nhưng không sử dụng đến",
        ];

  const visibleReasons = showAllReasons
    ? sampleReasons
    : sampleReasons.slice(0, 4);

  const handleReasonClick = (sample) => setReason(sample);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));
    setMediaFiles((prev) => [...prev, ...newMedia]);
  };

  const handleRemoveMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-gray-300 dark:border-indigo-600 w-full max-w-lg p-6 relative text-gray-900 dark:text-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
          aria-label="Đóng"
        >
          <FaTimes size={20} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-5 flex items-center gap-3">
          <FaRegCommentDots className="text-indigo-600 dark:text-indigo-400 text-2xl" />
          {type === "cancel" ? "Hủy đơn hàng" : "Yêu cầu trả hàng"}
        </h2>

        {/* Suggested Reasons */}
        <div className="mb-4">
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
            Chọn lý do phổ biến:
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {visibleReasons.map((item, index) => (
              <button
                key={index}
                onClick={() => handleReasonClick(item)}
                className="text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-700 dark:hover:bg-indigo-600 dark:text-indigo-200 transition"
              >
                {item}
              </button>
            ))}
          </div>
          {sampleReasons.length > 4 && (
            <button
              onClick={() => setShowAllReasons(!showAllReasons)}
              className="text-sm text-indigo-600 dark:text-indigo-400 underline hover:opacity-80 transition"
            >
              {showAllReasons ? "Thu gọn ▲" : "Xem thêm ▼"}
            </button>
          )}
        </div>

        {/* Reason Textarea */}
        <textarea
          rows={5}
          placeholder={`Nhập lý do ${
            type === "cancel" ? "hủy đơn hàng" : "trả hàng"
          }...`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-3 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-indigo-100 placeholder-indigo-400 dark:placeholder-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm shadow-inner"
        />

        {/* Upload Media (only for return) */}
        {type === "return" && (
          <div>
            <label className="block text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2 mt-4">
              Thêm ảnh hoặc video (tùy chọn)
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaChange}
              className="block w-full text-sm text-indigo-700 dark:text-indigo-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-200 file:text-indigo-800 hover:file:bg-indigo-300 dark:file:bg-indigo-800 dark:file:text-indigo-200 dark:hover:file:bg-indigo-700"
            />

            {mediaFiles.length > 0 && (
              <div className="max-h-40 overflow-y-auto pr-1 grid grid-cols-3 gap-3 mt-3">
                {mediaFiles.map((media, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-indigo-300 dark:border-indigo-600"
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.preview}
                        alt={`media-${index}`}
                        className="w-full h-28 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={media.preview}
                        controls
                        className="w-full h-28 object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black bg-opacity-60 text-white hover:bg-opacity-80 transition"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-200 hover:bg-indigo-300 text-indigo-800 dark:bg-indigo-700 dark:hover:bg-indigo-600 dark:text-indigo-100 font-semibold shadow-sm transition"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-lg text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
              type === "cancel"
                ? "bg-gradient-to-r from-pink-600 via-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                : "bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800"
            }`}
          >
            {type === "cancel" ? "Xác nhận hủy" : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrReturnModal;
