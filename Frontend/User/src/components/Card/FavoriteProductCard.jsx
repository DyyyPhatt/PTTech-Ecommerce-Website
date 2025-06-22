import React, { useState, useEffect } from "react";
import BaseProductCard from "./BaseProductCard";

const FavoriteProductCard = ({ product, brands }) => {
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

  return (
    <BaseProductCard
      product={product}
      brands={brands}
      favoriteButtonTop="top-2"
      isFavorited={isFavorited}
      onToggleFavorite={handleToggleFavorite}
      showVisibilityBadge={true}
      showDiscountBadge={true}
      showFavoriteButton={true}
      discountBadgePosition="left"
    />
  );
};

export default FavoriteProductCard;
