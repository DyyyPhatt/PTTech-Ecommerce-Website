import React from "react";
import BaseProductCard from "./BaseProductCard";

const ViewedProductCard = ({ product, brands }) => {
  const handleDelete = (product) => {
    const history = JSON.parse(localStorage.getItem("viewedProducts")) || [];
    const updated = history.filter((p) => p.id !== product.id);
    localStorage.setItem("viewedProducts", JSON.stringify(updated));
    window.location.reload();
  };

  return (
    <BaseProductCard
      product={product}
      brands={brands}
      showDelete={true}
      onDelete={handleDelete}
      showVisibilityBadge={true}
      showDiscountBadge={true}
      showFavoriteButton={false}
      discountBadgePosition="left"
    />
  );
};

export default ViewedProductCard;
