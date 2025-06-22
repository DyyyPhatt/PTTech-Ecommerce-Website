import React, { useState } from "react";
import { FaBug, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

const MAX_DESCRIPTION_LENGTH = 500;

const ReportBugModal = ({ onClose, onSubmit, loading }) => {
  const [bugType, setBugType] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const bugTypes = [
    "Lỗi hiển thị sản phẩm",
    "Lỗi dữ liệu sản phẩm",
    "Lỗi tìm kiếm và lọc sản phẩm",
    "Lỗi giỏ hàng và thanh toán",
    "Lỗi tài khoản người dùng",
    "Lỗi bảo mật và quyền truy cập",
    "Lỗi hiển thị trên thiết bị hoặc trình duyệt cụ thể",
    "Lỗi tốc độ tải và hiệu năng",
    "Lỗi đơn hàng và xử lý hậu cần",
    "Lỗi liên kết nội bộ và chuyển hướng",
    "Lỗi popup, banner hoặc quảng cáo",
    "Lỗi khác",
  ];

  const visibleBugTypes = showAllTypes ? bugTypes : bugTypes.slice(0, 4);

  const handleSubmit = () => {
    setAttemptedSubmit(true);

    if (!bugType || !description.trim()) {
      toast.warn("Vui lòng chọn loại lỗi và nhập mô tả chi tiết!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const images = mediaFiles
      .filter((m) => m.type === "image")
      .map((m) => m.file);
    const videos = mediaFiles
      .filter((m) => m.type === "video")
      .map((m) => m.file);

    onSubmit(bugType, description, images, videos, email.trim());
  };

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
    <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/70 backdrop-blur-md flex items-center justify-center px-2 sm:px-4">
      <div
        className="bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
        rounded-3xl shadow-2xl border border-red-400 dark:border-red-500
        w-full max-w-lg p-6 relative text-gray-900 dark:text-gray-100
        max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-red-600 transition"
          aria-label="Đóng"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-extrabold text-red-600 dark:text-red-300 mb-2 flex items-center gap-3">
          <FaBug className="text-red-500 dark:text-red-400 text-2xl" />
          Báo lỗi hệ thống
        </h2>

        {bugType && (
          <p className="text-sm italic text-red-400 mb-4">
            Bạn đang báo lỗi: <strong>{bugType}</strong>
          </p>
        )}

        {/* Bug Type Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
            Chọn loại lỗi:
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {visibleBugTypes.map((type, index) => (
              <button
                key={index}
                onClick={() => setBugType(type)}
                className={`text-xs px-3 py-1.5 rounded-full transition ${
                  bugType === type
                    ? "bg-red-500 text-white"
                    : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {bugTypes.length > 4 && (
            <button
              onClick={() => setShowAllTypes(!showAllTypes)}
              className="text-sm text-red-500 dark:text-red-400 underline hover:opacity-80 transition"
            >
              {showAllTypes ? "Thu gọn ▲" : "Xem thêm ▼"}
            </button>
          )}
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-red-700 dark:text-red-300 mb-1 block">
            Email của bạn (tùy chọn):
          </label>
          <input
            type="email"
            placeholder="nhap.email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-red-400 dark:border-red-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 placeholder-red-400 focus:outline-none focus:ring-2 focus:border-red-500 focus:ring-red-500 transition"
          />
        </div>

        {/* Description */}
        <div className="mb-1">
          <textarea
            rows={5}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder="Mô tả chi tiết về lỗi..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full p-3 rounded-xl border-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-red-100 placeholder-red-500 focus:outline-none focus:ring-2 focus:border-red-500 transition text-sm shadow-inner ${
              attemptedSubmit && !description.trim()
                ? "border-red-500 focus:ring-red-500"
                : "border-red-400 dark:border-red-700 focus:ring-red-500"
            }`}
          />
          <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">
            {description.length}/{MAX_DESCRIPTION_LENGTH} ký tự
          </p>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2 mt-4">
            Đính kèm ảnh hoặc video (nếu có)
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
            className="block w-full text-sm text-red-700 dark:text-red-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-200 file:text-red-800 hover:file:bg-red-300 dark:file:bg-red-800 dark:file:text-red-100 dark:hover:file:bg-red-700"
          />

          {mediaFiles.length > 0 && (
            <div className="max-h-40 overflow-y-auto pr-1 grid grid-cols-3 gap-3 mt-3">
              {mediaFiles.map((media, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border border-red-400 dark:border-red-600"
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

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-semibold shadow-sm transition dark:bg-red-700 dark:hover:bg-red-600 dark:text-red-100"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <FaBug className="inline-block mr-2 mb-0.5" />
                Gửi báo lỗi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportBugModal;
