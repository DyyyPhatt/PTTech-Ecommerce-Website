const GUEST_CART_KEY = "guest_cart";

export const getGuestCart = () => {
  const cart = localStorage.getItem(GUEST_CART_KEY);
  if (!cart) {
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isDeleted: false,
    };
  }
  return JSON.parse(cart);
};

export const getGuestCartItemCount = () => {
  const cart = getGuestCart();
  return cart.totalItems || 0;
};

export const saveGuestCart = (cart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

export const addItemToGuestCart = (product, selectedVariant, quantity) => {
  const cart = getGuestCart();

  const cartItem = {
    productId: product.id,
    variantId: selectedVariant.variantId,
    brandId: product.brandId,
    categoryId: product.categoryId,
    quantity: quantity,
    totalPrice:
      quantity * (product.pricing.current || product.pricing.original),
    productName: product.name,
    originalPrice: product.pricing.original,
    discountPrice: product.pricing.current,
    ratingAverage: product.ratingAverage || 0,
    totalReviews: product.totalReviews || 0,
    productImage: product.images?.[0] || "",
    color: selectedVariant.color,
    hexCode: selectedVariant.hexCode,
    size: selectedVariant.size,
    ram: selectedVariant.ram,
    storage: selectedVariant.storage,
    condition: selectedVariant.condition,
    stock: selectedVariant.stock || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const index = cart.items.findIndex(
    (item) =>
      item.productId === cartItem.productId &&
      item.variantId === cartItem.variantId
  );

  if (index >= 0) {
    const existingItem = cart.items[index];
    const maxAddable = existingItem.stock - existingItem.quantity;
    const quantityToAdd = Math.min(quantity, maxAddable);

    if (quantityToAdd > 0) {
      existingItem.quantity += quantityToAdd;
      existingItem.totalPrice =
        existingItem.quantity *
        (existingItem.discountPrice || existingItem.originalPrice);
      existingItem.updatedAt = new Date();
    }
  } else {
    const quantityToAdd = Math.min(quantity, cartItem.stock);
    cartItem.quantity = quantityToAdd;
    cartItem.totalPrice =
      quantityToAdd * (cartItem.discountPrice || cartItem.originalPrice);
    cart.items.push(cartItem);
  }

  cart.totalItems = cart.items.length;
  cart.totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

  saveGuestCart(cart);
  window.dispatchEvent(new Event("guest_cart_updated"));
};

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};
