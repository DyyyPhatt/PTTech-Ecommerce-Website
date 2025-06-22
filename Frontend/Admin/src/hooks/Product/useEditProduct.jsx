import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useEditProduct = (id) => {
  const [product, setProduct] = useState({
    productId: "",
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    specifications: {},
    variants: [],
    tags: [],
    images: [],
    videos: [],
    blog: { title: "", description: "", content: "" },
    warranty: { duration: "", terms: "" },
    status: "",
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
    ratings: {
      average: 0,
      totalReviews: 0,
    },
    visibilityType: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const token = getUserToken();
        const response = await axios.get(
          `http://localhost:8081/api/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { images, videos, ...editableFields } = response.data;
        setProduct({
          ...editableFields,
          images,
          videos,
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDeleteImage = async (imageUrl) => {
    try {
      const token = getUserToken();
      await axios.delete(
        `http://localhost:8081/api/products/delete-image/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { imageUrl },
        }
      );

      setProduct((prevProduct) => ({
        ...prevProduct,
        images: prevProduct.images.filter((image) => image !== imageUrl),
      }));

      console.log("Xóa ảnh thành công");
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      setErrors((prev) => ({ ...prev, image: "Không thể xóa ảnh" }));
    }
  };

  const handleDeleteVideo = async (videoUrl) => {
    try {
      const token = getUserToken();
      await axios.delete(
        `http://localhost:8081/api/products/delete-video/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { videoUrl },
        }
      );

      setProduct((prevProduct) => ({
        ...prevProduct,
        videos: prevProduct.videos.filter((video) => video !== videoUrl),
      }));

      console.log("Xóa video thành công");
    } catch (error) {
      console.error("Lỗi khi xóa video:", error);
      setErrors((prev) => ({ ...prev, video: "Không thể xóa video" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("blog.") || name.startsWith("warranty.")) {
      const [group, field] = name.split(".");
      setProduct((prev) => ({
        ...prev,
        [group]: { ...prev[group], [field]: value },
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = (tag) => {
    if (!tag.trim() || product.tags.includes(tag)) return;
    setProduct({ ...product, tags: [...product.tags, tag] });
  };

  const handleRemoveTag = (tag) => {
    setProduct({ ...product, tags: product.tags.filter((t) => t !== tag) });
  };

  const handleChangeSpec = (e, oldKey, field) => {
    const value = e.target.value;

    setProduct((prev) => {
      const updatedSpecs = { ...prev.specifications };

      if (field === "key") {
        delete updatedSpecs[oldKey];
        updatedSpecs[value] = prev.specifications[oldKey];
      } else {
        updatedSpecs[oldKey] = value;
      }

      return { ...prev, specifications: updatedSpecs };
    });
  };

  const handleRemoveSpecification = (key) => {
    setProduct((prev) => {
      const updatedSpecs = { ...prev.specifications };
      delete updatedSpecs[key];
      return { ...prev, specifications: updatedSpecs };
    });
  };

  const handleAddSpecification = () => {
    setProduct((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, "": "" },
    }));
  };

  const handleChangeVariant = (e, index, field) => {
    const value = e.target.value;

    setProduct((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };

      return { ...prev, variants: updatedVariants };
    });
  };

  const handleAddVariant = () => {
    setProduct((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: "",
          hexCode: "",
          size: "",
          ram: "",
          storage: "",
          condition: "",
          stock: 0,
        },
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    setProduct((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants.splice(index, 1);

      return { ...prev, variants: updatedVariants };
    });
  };

  const uploadFile = async (file, type) => {
    if (!file || typeof file === "string") return file;

    const formData = new FormData();
    formData.append("file", file);

    const token = getUserToken();
    try {
      const response = await axios.post(
        `http://localhost:8081/api/products/upload-${type}/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      setErrors((prev) => ({ ...prev, [type]: `Lỗi khi tải ${type} lên` }));
      return null;
    }
  };

  const handleImageUpload = async (file) => {
    const uploadedImage = await uploadFile(file, "image");
    if (!uploadedImage) return;

    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, uploadedImage],
    }));
  };

  const handleVideoUpload = async (file) => {
    const uploadedVideo = await uploadFile(file, "video");
    if (!uploadedVideo) return;

    setProduct((prev) => ({
      ...prev,
      videos: [...prev.videos, uploadedVideo],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedPricing =
      product.pricing.original === 0 && product.pricing.current === 0
        ? product.pricing
        : product.pricing;

    const updateData = {
      ...product,
      pricing: updatedPricing,
    };

    console.log(updateData);

    try {
      const token = getUserToken();
      await axios.put(`http://localhost:8081/api/products/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/product-list");
      }, 3000);
    } catch (error) {
      setErrors(error.response?.data || {});
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
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    handleImageUpload,
    handleDeleteImage,
    handleVideoUpload,
    handleDeleteVideo,
    handleAddSpecification,
    handleRemoveSpecification,
    handleAddVariant,
    handleRemoveVariant,
    handleAddTag,
    handleRemoveTag,
    handleChangeSpec,
    handleChangeVariant,
  };
};

export default useEditProduct;
