import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import BackButton from "../../components/BackButton";

const statusLabel = {
  PENDING: { text: "Đang chờ", color: "text-yellow-600" },
  IN_PROGRESS: { text: "Đang xử lý", color: "text-blue-600" },
  RESOLVED: { text: "Đã xử lý", color: "text-green-600" },
  REJECTED: { text: "Từ chối", color: "text-red-600" },
};

const BugReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState(null);
  const closeModal = () => setModalImage(null);

  const getToken = () => localStorage.getItem("userToken");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8081/api/bug-reports/${id}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );
        setReport(res.data);
      } catch {
        setError("Không thể tải thông tin báo lỗi.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-blue-600">Đang tải...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-red-600">{error}</span>
      </div>
    );

  if (!report)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-gray-600">Không tìm thấy báo lỗi.</span>
      </div>
    );

  const {
    bugType,
    description,
    email,
    imageUrls = [],
    videoUrls = [],
    status,
    adminNote,
    createdAt,
    updatedAt,
  } = report;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">
        Chi tiết báo lỗi
      </h1>

      <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        {/* HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white rounded-t-lg">
          <h3 className="text-2xl font-semibold">{bugType}</h3>
          {email && (
            <p className="mt-1 text-sm dark:text-white/90">
              Email liên hệ:{" "}
              <span className="font-medium underline">{email}</span>
            </p>
          )}
        </div>

        {/* DETAILS */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <DetailRow
            label="Mô tả"
            value={description}
            labelClassName="dark:text-white"
            valueClassName="dark:text-white"
          />
          <DetailRow
            label="Trạng thái"
            value={
              <span className={`font-semibold ${statusLabel[status].color}`}>
                {statusLabel[status].text}
              </span>
            }
            labelClassName="dark:text-white"
          />
          {adminNote && (
            <DetailRow
              label="Ghi chú admin"
              value={adminNote}
              labelClassName="dark:text-white"
              valueClassName="dark:text-white"
            />
          )}
          <DetailRow
            label="Ngày tạo"
            value={dayjs(createdAt).format("DD/MM/YYYY HH:mm")}
            labelClassName="dark:text-white"
            valueClassName="dark:text-white"
          />
          <DetailRow
            label="Cập nhật lần cuối"
            value={dayjs(updatedAt).format("DD/MM/YYYY HH:mm")}
            labelClassName="dark:text-white"
            valueClassName="dark:text-white"
          />
          {!!imageUrls.length && (
            <DetailRow
              label="Ảnh đính kèm"
              value={
                <>
                  <div className="flex gap-2 flex-wrap">
                    {imageUrls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setModalImage(url)}
                        className="w-24 h-24 rounded border border-gray-300 dark:border-gray-600 overflow-hidden"
                        aria-label={`Xem ảnh ${idx + 1} lớn hơn`}
                        type="button"
                      >
                        <img
                          src={url}
                          alt={`Ảnh lỗi ${idx + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>

                  {modalImage && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                      onClick={closeModal}
                    >
                      <div
                        className="bg-white dark:bg-gray-800 p-4 rounded max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()} // tránh click ra ngoài đóng modal khi click trong này
                      >
                        <img
                          src={modalImage}
                          alt="Ảnh lớn"
                          className="max-w-full max-h-[70vh] rounded"
                        />
                        <div className="mt-4 flex space-x-4">
                          <button
                            onClick={closeModal}
                            className="px-4 py-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              }
              labelClassName="dark:text-white"
            />
          )}

          {!!videoUrls.length && (
            <DetailRow
              label="Video đính kèm"
              value={
                <div className="flex flex-wrap gap-4">
                  {videoUrls.map((url, idx) => (
                    <video
                      key={idx}
                      src={url}
                      controls
                      className="w-48 h-32 rounded border border-gray-300 dark:border-gray-600"
                    >
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  ))}
                </div>
              }
              labelClassName="dark:text-white"
            />
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/bug-list" />
      </div>
    </div>
  );
};

const DetailRow = ({
  label,
  value,
  labelClassName = "",
  valueClassName = "",
}) => (
  <div className="px-6 py-4 grid sm:grid-cols-3 gap-4">
    <dt
      className={`text-sm font-medium text-gray-500 dark:text-white ${labelClassName}`}
    >
      {label}
    </dt>
    <dd
      className={`sm:col-span-2 text-sm text-gray-900 dark:text-white ${valueClassName}`}
    >
      {value}
    </dd>
  </div>
);

export default BugReportDetail;
