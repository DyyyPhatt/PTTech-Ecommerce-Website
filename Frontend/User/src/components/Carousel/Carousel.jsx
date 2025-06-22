import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/Carousel.css";

const Carousel = ({ items, autoSlide = true, autoSlideInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval, items.length]);

  return (
    <div id="gallery" className="relative w-full">
      <div
        className="relative h-[200px] sm:h-[250px] md:h-[300px] lg:h-[500px] overflow-hidden rounded-lg
        bg-gray-200 dark:bg-gray-800"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={item.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover filter blur-md scale-110"
              style={{ filter: "blur(12px)" }}
            />

            {item.link ? (
              <Link to={item.link}>
                <img
                  src={item.image}
                  alt={item.alt || "carousel item"}
                  className="relative z-10 w-full h-full object-contain rounded-lg"
                />
              </Link>
            ) : (
              <img
                src={item.image}
                alt={item.alt || "carousel item"}
                className="relative z-10 w-full h-full object-contain rounded-lg"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30
          bg-black/60 hover:bg-black/80 dark:bg-white/20 dark:hover:bg-white/40
          text-white dark:text-gray-900 p-2 rounded-full focus:outline-none shadow"
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 1 1 5l4 4"
          />
        </svg>
      </button>

      <button
        type="button"
        className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30
          bg-black/60 hover:bg-black/80 dark:bg-white/20 dark:hover:bg-white/40
          text-white dark:text-gray-900 p-2 rounded-full focus:outline-none shadow"
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 9 4-4-4-4"
          />
        </svg>
      </button>
    </div>
  );
};

export default Carousel;
