import React, { useState, useEffect } from "react";
import BaseProductCard from "./BaseProductCard";

const ProductCard = ({ product, brands }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const favorites =
      JSON.parse(localStorage.getItem("favoriteProducts")) || [];
    setIsFavorited(favorites.some((p) => p.id === product.id));
  }, [product.id]);

  const handleToggleFavorite = (product) => {
    const favorites =
      JSON.parse(localStorage.getItem("favoriteProducts")) || [];
    const exists = favorites.some((p) => p.id === product.id);
    let updated;

    if (exists) {
      updated = favorites.filter((p) => p.id !== product.id);
      setIsFavorited(false);
    } else {
      updated = [...favorites, product];
      setIsFavorited(true);
    }

    localStorage.setItem("favoriteProducts", JSON.stringify(updated));
  };

  const addToViewedHistory = (product) => {
    try {
      const history = JSON.parse(localStorage.getItem("viewedProducts")) || [];
      const exists = history.find((p) => p.id === product.id);
      if (!exists) {
        const updatedHistory = [product, ...history].slice(0, 20);
        localStorage.setItem("viewedProducts", JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error("Failed to update viewed history:", error);
    }
  };

  return (
    <BaseProductCard
      product={product}
      brands={brands}
      showDelete={false}
      onClickProduct={addToViewedHistory}
      isFavorited={isFavorited}
      onToggleFavorite={handleToggleFavorite}
      discountBadgePosition="right"
    />
  );
};

export default ProductCard;
