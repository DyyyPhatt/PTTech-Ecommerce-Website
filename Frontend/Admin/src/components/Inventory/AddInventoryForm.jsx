import React, { useState, useEffect } from "react";
import {
  FaLink,
  FaInfoCircle,
  FaBuilding,
  FaRegStickyNote,
} from "react-icons/fa";
import useAddInventory from "../../hooks/Inventory/useAddInventory";
import useProducts from "../../hooks/Inventory/useProducts";
import BackButton from "../BackButton";
import { useNavigate } from "react-router-dom";

const AddInventoryForm = () => {
  const {
    inventory,
    setInventory,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleProductChange,
    handleSubmit,
  } = useAddInventory();

  const { products, loading: loadingProducts } = useProducts();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productToAdd, setProductToAdd] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const navigate = useNavigate();
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => navigate("/inventory-list"), 3000);
    }
  }, [showSuccessMessage, navigate]);

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p.id === productId);
    setProductToAdd(product);
  };

  const handleVariantSelect = (e) => {
    const variantId = e.target.value;
    const variant = productToAdd?.variants.find(
      (v) => v.variantId === variantId
    );
    setSelectedVariant(variant);
  };

  const handleAddProduct = () => {
    if (productToAdd && selectedVariant && quantity > 0 && unitPrice > 0) {
      if (
        productToAdd.id &&
        selectedVariant.variantId &&
        quantity > 0 &&
        unitPrice > 0
      ) {
        const existingProductIndex = selectedProducts.findIndex(
          (item) =>
            item.product.id === productToAdd.id &&
            item.variant.variantId === selectedVariant.variantId &&
            item.unitPrice === unitPrice
        );

        if (existingProductIndex !== -1) {
          const updatedProducts = [...selectedProducts];
          updatedProducts[existingProductIndex].quantity += quantity;
          updatedProducts[existingProductIndex].totalValue =
            updatedProducts[existingProductIndex].quantity *
            updatedProducts[existingProductIndex].unitPrice;

          setSelectedProducts(updatedProducts);

          const updatedInventory = { ...inventory };
          updatedInventory.products[
            existingProductIndex
          ].productVariants[0].quantity += quantity;
          updatedInventory.products[
            existingProductIndex
          ].productVariants[0].totalValue =
            updatedInventory.products[existingProductIndex].productVariants[0]
              .quantity * unitPrice;
          setInventory(updatedInventory);
        } else {
          const newProduct = {
            productId: productToAdd.id,
            productVariants: [
              {
                productVariantId: selectedVariant.variantId,
                quantity,
                unitPrice,
                totalValue: quantity * unitPrice,
              },
            ],
          };

          setInventory((prev) => ({
            ...prev,
            products: [...prev.products, newProduct],
          }));

          setSelectedProducts((prev) => [
            ...prev,
            {
              product: productToAdd,
              variant: selectedVariant,
              quantity,
              unitPrice,
              totalValue: quantity * unitPrice,
            },
          ]);
        }

        setProductToAdd(null);
        setSelectedVariant(null);
        setQuantity(0);
        setUnitPrice(0);
        setShowProductSelection(false);
      } else {
        console.error("Thông tin sản phẩm chưa đầy đủ!");
      }
    } else {
      console.error("Chưa chọn sản phẩm hoặc biến thể!");
    }
  };

  const handleShowProductSelection = () => {
    setProductToAdd(null);
    setSelectedVariant(null);
    setQuantity(0);
    setUnitPrice(0);
    setShowProductSelection(true);
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6"
      >
        {showErrorMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-500 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-400 rounded-lg">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0Zm1 14h-2v-2h2v2Zm0-4h-2V6h2v4Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Thêm nhập kho thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white dark:bg-gray-900 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200 rounded-lg">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Thêm nhập kho thành công.
            </div>
          </div>
        )}

        <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-2">
          <div>
            <label
              htmlFor="supplier.name"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaBuilding className="mr-2 text-indigo-500" />
              Tên nhà cung cấp
            </label>
            <input
              type="text"
              id="supplier.name"
              name="supplier.name"
              value={inventory.supplier.name || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              placeholder="Tên nhà cung cấp"
            />
            {errors.supplier?.name && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.supplier.name}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="supplier.contact"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaBuilding className="mr-2 text-indigo-500" />
              Email nhà cung cấp
            </label>
            <input
              type="email"
              id="supplier.contact"
              name="supplier.contact"
              value={inventory.supplier.contact || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              placeholder="Email nhà cung cấp"
            />
            {errors.supplier?.contact && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.supplier.contact}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="supplier.address"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaBuilding className="mr-2 text-indigo-500" />
              Địa chỉ nhà cung cấp
            </label>
            <input
              type="text"
              id="supplier.address"
              name="supplier.address"
              value={inventory.supplier.address || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              placeholder="Địa chỉ cung cấp"
            />
            {errors.supplier?.address && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.supplier.address}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaRegStickyNote className="mr-2 text-yellow-500" />
              Ghi chú
            </label>
            <textarea
              id="notes"
              name="notes"
              value={inventory.notes || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              placeholder="Ghi chú"
            />
            {errors.notes && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.notes}
              </span>
            )}
          </div>
        </div>

        <div className="border-b pb-4 mb-6">
          <button
            type="button"
            onClick={handleShowProductSelection}
            className="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 mt-4"
          >
            Chọn sản phẩm nhập kho
          </button>

          {showProductSelection && (
            <>
              {/* Input Search để tìm sản phẩm */}
              <div className="mt-4">
                <label className="text-sm font-bold text-gray-900 dark:text-white">
                  Tìm sản phẩm
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-2.5 w-full mt-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              {/* Chọn sản phẩm từ danh sách lọc */}
              <div className="mt-4">
                <select
                  name="productId"
                  onChange={handleProductSelect}
                  className="border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-2.5 w-full mt-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="" className="text-gray-900 dark:text-white">
                    Chọn sản phẩm
                  </option>
                  {loadingProducts ? (
                    <option>Đang tải...</option>
                  ) : (
                    products
                      .filter((product) =>
                        product.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                          className="text-gray-900 dark:text-white"
                        >
                          {product.name}
                        </option>
                      ))
                  )}
                </select>
              </div>

              {productToAdd && (
                <div className="mt-4">
                  <label className="text-sm font-bold text-gray-900 dark:text-white">
                    Chọn biến thể
                  </label>
                  <select
                    name="variantId"
                    onChange={handleVariantSelect}
                    className="border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-2.5 w-full mt-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="" className="text-gray-900 dark:text-white">
                      Chọn biến thể
                    </option>
                    {productToAdd?.variants?.map((variant) => (
                      <option
                        key={variant.variantId}
                        value={variant.variantId}
                        className="text-gray-900 dark:text-white"
                      >
                        {[
                          variant.color,
                          variant.size,
                          variant.ram,
                          variant.storage,
                          variant.stock,
                        ]
                          .filter(
                            (val) =>
                              val !== "" && val !== null && val !== undefined
                          )
                          .join(" - ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedVariant && (
                <>
                  <div className="mt-4">
                    <label className="text-sm font-bold text-gray-900 dark:text-white">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-2.5 w-full mt-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      placeholder="Số lượng"
                      min="1"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-bold text-gray-900 dark:text-white">
                      Giá nhập
                    </label>
                    <input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-2.5 w-full mt-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      placeholder="Giá nhập"
                    />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleAddProduct}
                className="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 mt-4"
              >
                Thêm sản phẩm vào kho
              </button>
            </>
          )}
        </div>

        <div className="border-b pb-4 mb-6">
          <label className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Sản phẩm đã chọn
          </label>
          {selectedProducts.length > 0 ? (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-center">
                    <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      Tên sản phẩm
                    </th>
                    <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      Biến thể
                    </th>
                    <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      Số lượng
                    </th>
                    <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      Giá nhập
                    </th>
                    <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-green-600 dark:text-green-400 font-semibold">
                      Tổng giá trị
                    </th>
                    <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((item, index) => (
                    <tr
                      key={index}
                      className="text-center text-gray-900 dark:text-white"
                    >
                      <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                        {item.product.name}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                        {[item.variant.color, item.variant.size]
                          .filter(Boolean)
                          .join(" - ") || "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                        {item.unitPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-green-600 dark:text-green-400 font-semibold">
                        {(item.quantity * item.unitPrice).toLocaleString(
                          "vi-VN",
                          {
                            style: "currency",
                            currency: "VND",
                          }
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-bold text-right text-gray-900 dark:text-white"
                    >
                      Tổng giá trị:
                    </td>
                    <td
                      colSpan="2"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-bold text-xl text-red-600 dark:text-red-400"
                    >
                      {selectedProducts
                        .reduce(
                          (total, item) =>
                            total + item.quantity * item.unitPrice,
                          0
                        )
                        .toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-900 dark:text-white">
              Chưa có sản phẩm nào được chọn.
            </p>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang thêm..." : "Thêm nhập kho"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/inventory-list" />
      </div>
    </div>
  );
};

export default AddInventoryForm;
