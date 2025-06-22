import { useEffect, useState } from "react";
import usePromotions from "../../hooks/usePromotions";

const AdPopup = () => {
  const { promotions, loading, error } = usePromotions();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (promotions.length === 0) return;

    const timer = setInterval(() => {
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 30000);

      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % promotions.length);
    }, 60000);

    return () => clearInterval(timer);
  }, [promotions]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const currentAd = promotions[currentAdIndex];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 left-3 bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700 rounded-lg p-4 w-48 z-50 animate-fade-in relative ad-popup transition-all duration-300">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-sm font-bold"
        aria-label="Đóng quảng cáo"
      >
        ×
      </button>

      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2">
        {currentAd.title}
      </p>

      <img
        src={currentAd.image}
        alt={currentAd.title}
        className="mt-2 w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-600"
      />
    </div>
  );
};

export default AdPopup;
