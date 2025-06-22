import { useState } from "react";

const useAddProduct = () => {
  const [product, setProduct] = useState({
    productId: "",
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    pricing: {
      original: 0,
      current: 0,
      history: [
        {
          previousPrice: 0,
          newPrice: 0,
          changedAt: "",
        },
      ],
    },

    specifications: {},
    variants: [],
    tags: [],
    images: [],
    videos: [],
    blog: { title: "", description: "", content: "", publishedDate: "" },
    warranty: { duration: "", terms: "" },
    status: "active",
    visibilityType: "Mới",
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files?.length) {
      if (name === "images") {
        setSelectedImages((prev) => [...prev, ...Array.from(files)]);
      } else if (name === "videos") {
        setSelectedVideos((prev) => [...prev, ...Array.from(files)]);
      }
      return;
    }

    const nestedFields = name.split(".");
    if (nestedFields.length === 2) {
      const [parent, child] = nestedFields;
      setProduct((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
      return;
    }

    if (name.startsWith("specKey-") || name.startsWith("specValue-")) {
      const index = Number(name.split("-")[1]);
      const isKey = name.startsWith("specKey-");

      setProduct((prev) => {
        const updatedSpecs = { ...prev.specifications };
        const key = Object.keys(updatedSpecs)[index];

        if (isKey) {
          const newKey = value;
          const newValue = updatedSpecs[key];
          delete updatedSpecs[key];
          updatedSpecs[newKey] = newValue;
        } else {
          updatedSpecs[key] = value;
        }

        return { ...prev, specifications: updatedSpecs };
      });
      return;
    }

    if (name.startsWith("variant-")) {
      const [, field, index] = name.split("-");
      const idx = Number(index);
      setProduct((prev) => {
        const updatedVariants = [...prev.variants];
        if (!updatedVariants[idx]) {
          updatedVariants[idx] = {
            color: "",
            hexCode: "",
            size: "",
            ram: "",
            storage: "",
            condition: "",
            stock: 0,
          };
        }
        updatedVariants[idx][field] = value;
        return { ...prev, variants: updatedVariants };
      });
      return;
    }

    if (name.startsWith("tag-")) {
      const index = Number(name.split("-")[1]);
      setProduct((prev) => {
        const updatedTags = [...prev.tags];
        updatedTags[index] = value;
        return { ...prev, tags: updatedTags };
      });
      return;
    }

    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteImage = (img) => {
    setSelectedImages(selectedImages.filter((image) => image !== img));
  };

  const handleDeleteVideo = (video) => {
    setSelectedVideos(selectedVideos.filter((vid) => vid !== video));
  };

  const uploadFile = async (productId, file, type) => {
    if (!file || typeof file === "string") return file;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const token = getUserToken();
    try {
      const response = await fetch(
        `http://localhost:8081/api/products/upload-${type}/${productId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.text();
      if (!response.ok) throw new Error(`Tải ${type} thất bại: ${result}`);

      return result;
    } catch (error) {
      setErrors((prev) => ({ ...prev, [type]: error.message }));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const fetchProductById = async (productId) => {
    const token = getUserToken();
    try {
      const response = await fetch(
        `http://localhost:8081/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Không thể lấy thông tin sản phẩm.");
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const updateProductMedia = async (
    productId,
    uploadedImages,
    uploadedVideos
  ) => {
    const token = getUserToken();
    try {
      const product = await fetchProductById(productId);
      if (!product) throw new Error("Không tìm thấy sản phẩm.");

      const updatedProduct = {
        ...product,
        images: uploadedImages.filter(Boolean),
        videos: uploadedVideos.filter(Boolean),
      };

      const response = await fetch(
        `http://localhost:8081/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      if (!response.ok) throw new Error("Lỗi khi cập nhật ảnh & video.");

      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get the user token
    const token = getUserToken();

    // Log the token to check if it's being retrieved correctly
    console.log("User Token: ", token);

    // Check if the token exists
    if (!token) {
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      console.error("No token found. Please log in again.");
      return; // Exit if no token is available
    }

    try {
      const createdAt = new Date().toISOString(); // Lấy ngày hiện tại

      // Gán ngày xuất bản cho blog
      const productData = {
        ...product,
        blog: {
          ...product.blog,
          publishedDate: createdAt, // Thêm ngày xuất bản vào blog
        },
        pricing: {
          ...product.pricing,
          history: [
            {
              previousPrice: product.pricing.current,
              newPrice: product.pricing.current,
              changedAt: createdAt,
            },
          ],
        },
      };

      // Log the product data to ensure it is correctly structured
      console.log("Product Data: ", productData);

      // Send the request to create the product
      const createResponse = await fetch("http://localhost:8081/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token here
        },
        body: JSON.stringify(productData),
      });

      // Log the response to check if it's successful or returns an error
      console.log("Create Product Response: ", createResponse);

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Error Creating Product: ", errorText);
        throw new Error(`Lỗi khi tạo sản phẩm: ${errorText}`);
      }

      const createdProduct = await createResponse.json();
      console.log("Created Product: ", createdProduct);

      const productId = createdProduct.productId;
      const id = createdProduct.id;

      // Handle image and video uploads (if any)
      const uploadedImages = await Promise.all(
        selectedImages.map((file) => uploadFile(id, file, "image"))
      );

      const uploadedVideos = await Promise.all(
        selectedVideos.map((file) => uploadFile(id, file, "video"))
      );

      await updateProductMedia(id, uploadedImages, uploadedVideos);

      setSelectedImages([]);
      setSelectedVideos([]);

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error during product creation:", error);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    product,
    errors,
    isSubmitting,
    uploading,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    setProduct,
    setErrors,
    selectedImages,
    selectedVideos,
    handleDeleteImage,
    handleDeleteVideo,
  };
};

export default useAddProduct;
