import { useState } from "react";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const useAddProductSchedule = () => {
  const userToken = getUserToken();
  const [schedule, setSchedule] = useState({
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
    visibilityType: "",
    scheduledDate: "",
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const convertUtcToLocalFormat = (utcDate) => {
    if (!utcDate) return "";

    const localDate = new Date(utcDate);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const convertLocalToUtc = (localDate) => {
    const date = new Date(localDate);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString().slice(0, -1) + "+07:00";
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
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        [parent]: { ...prevSchedule[parent], [child]: value },
      }));
      return;
    }

    if (name.startsWith("specKey-") || name.startsWith("specValue-")) {
      const index = Number(name.split("-")[1]);
      const isKey = name.startsWith("specKey-");

      setSchedule((prevSchedule) => {
        const updatedSpecs = { ...prevSchedule.specifications };
        const key = Object.keys(updatedSpecs)[index];

        if (isKey) {
          const newKey = value;
          const newValue = updatedSpecs[key];
          delete updatedSpecs[key];
          updatedSpecs[newKey] = newValue;
        } else {
          updatedSpecs[key] = value;
        }

        return { ...prevSchedule, specifications: updatedSpecs };
      });
      return;
    }

    if (name.startsWith("variant-")) {
      const [, field, index] = name.split("-");
      const idx = Number(index);
      setSchedule((prevSchedule) => {
        const updatedVariants = [...prevSchedule.variants];
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
        return { ...prevSchedule, variants: updatedVariants };
      });
      return;
    }

    if (name.startsWith("tag-")) {
      const index = Number(name.split("-")[1]);
      setSchedule((prevSchedule) => {
        const updatedTags = [...prevSchedule.tags];
        updatedTags[index] = value;
        return { ...prevSchedule, tags: updatedTags };
      });
      return;
    }

    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [name]: value,
    }));
  };

  const uploadFile = async (productId, file, type) => {
    if (!file || typeof file === "string") return file;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `http://localhost:8081/api/products/upload-${type}/${productId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
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
    try {
      const response = await fetch(
        `http://localhost:8081/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
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
  const handleDeleteImage = (img) => {
    setSelectedImages(selectedImages.filter((image) => image !== img));
  };

  const handleDeleteVideo = (video) => {
    setSelectedVideos(selectedVideos.filter((vid) => vid !== video));
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

      console.log(updatedProduct);

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

    try {
      const createdAt = new Date().toISOString();

      const productData = {
        ...schedule,
        status: "inactive",
        scheduledDate: convertLocalToUtc(schedule.scheduledDate),
        blog: {
          ...schedule.blog,
          publishedDate: convertLocalToUtc(schedule.scheduledDate), // Gán publishedDate cho blog bằng scheduledDate
        },
        pricing: {
          ...schedule.pricing,
          history: [
            {
              previousPrice: schedule.pricing.current,
              newPrice: schedule.pricing.current,
              changedAt: createdAt,
            },
          ],
        },
      };

      const createResponse = await fetch(
        "http://localhost:8081/api/products/schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`, // Use the token here
          },
          body: JSON.stringify(productData),
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Lỗi khi tạo sản phẩm: ${errorText}`);
      }

      const createdProduct = await createResponse.json();
      const productId = createdProduct.productId;
      const id = createdProduct.id;

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
      console.error(error);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   try {
  //     const createdAt = new Date().toISOString();

  //     const productData = {
  //       ...schedule,
  //       status: "inactive",
  //       scheduledDate: convertLocalToUtc(schedule.scheduledDate),
  //       pricing: {
  //         ...schedule.pricing,
  //         history: [
  //           {
  //             previousPrice: schedule.pricing.current,
  //             newPrice: schedule.pricing.current,
  //             changedAt: createdAt,
  //           },
  //         ],
  //       },
  //     };

  //     const createResponse = await fetch(
  //       "http://localhost:8081/api/products/schedule",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${userToken}`,
  //         },
  //         body: JSON.stringify(productData),
  //       }
  //     );

  //     if (!createResponse.ok) {
  //       const errorText = await createResponse.text();
  //       throw new Error(`Lỗi khi tạo sản phẩm: ${errorText}`);
  //     }

  //     const createdProduct = await createResponse.json();
  //     const productId = createdProduct.productId;
  //     const id = createdProduct.id;

  //     const uploadedImages = await Promise.all(
  //       selectedImages.map((file) => uploadFile(id, file, "image"))
  //     );
  //     const uploadedVideos = await Promise.all(
  //       selectedVideos.map((file) => uploadFile(id, file, "video"))
  //     );

  //     await updateProductMedia(id, uploadedImages, uploadedVideos);

  //     setSelectedImages([]);
  //     setSelectedVideos([]);

  //     setShowSuccessMessage(true);
  //     setTimeout(() => setShowSuccessMessage(false), 3000);
  //   } catch (error) {
  //     console.error(error);
  //     setShowErrorMessage(true);
  //     setTimeout(() => setShowErrorMessage(false), 3000);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return {
    schedule,
    errors,
    isSubmitting,
    uploading,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    setSchedule,
    setErrors,
    selectedImages,
    selectedVideos,
    handleDeleteImage,
    handleDeleteVideo,
    convertUtcToLocalFormat,
  };
};

export default useAddProductSchedule;
