import { useEffect, useState } from "react";
import { FaTimes, FaTags } from "react-icons/fa";
import useDiscountCodes from "../../hooks/useDiscountCodes";

const DiscountCodePopup = () => {
  const { discountCodes, loading, error } = useDiscountCodes();
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (discountCodes.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 30000);

      setCurrentIndex((prevIndex) => (prevIndex + 1) % discountCodes.length);
    }, 60000);

    return () => clearInterval(interval);
  }, [discountCodes]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (loading || error || discountCodes.length === 0 || !isVisible) return null;

  const currentCode = discountCodes[currentIndex];

  return (
    <div className="fixed bottom-6 right-6 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900 dark:to-yellow-800 shadow-xl border border-yellow-300 dark:border-yellow-700 rounded-lg p-5 w-64 z-50 animate-fade-in relative discount-code-popup transition-all duration-300">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-xl font-bold"
        aria-label="Đóng popup mã giảm giá"
      >
        <FaTimes />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <FaTags className="text-yellow-600 dark:text-yellow-400 text-2xl" />
        <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
          Mã Giảm Giá Đặc Biệt
        </h4>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
        {currentCode.description}
      </p>

      <div className="bg-yellow-100 dark:bg-yellow-800 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-md mt-2 inline-block font-mono text-sm tracking-widest">
        Code: {currentCode.code}
      </div>

      <p className="text-sm text-gray-800 dark:text-gray-200 mt-2">
        {currentCode.discountType === "percentage" ? (
          <>
            🔻 Giảm đến <strong>{currentCode.discountValue}%</strong>
          </>
        ) : (
          <>
            🔻 Giảm đến{" "}
            <strong>{currentCode.discountValue.toLocaleString()}₫</strong>
          </>
        )}
      </p>
    </div>
  );
};

export default DiscountCodePopup;
