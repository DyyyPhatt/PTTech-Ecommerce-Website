import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-24 bg-[#d70018] dark:bg-[#900c1b] text-white dark:text-[#e5e5e5] rounded-full p-3 shadow-lg hover:bg-[#900c1b] transition duration-300"
          aria-label="Cuộn lên đầu trang"
        >
          <FaArrowUp size={16} />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;
