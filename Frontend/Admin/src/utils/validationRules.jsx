// Hàm validate cho email
export const validateEmail = (value) => {
  if (!value) return "Email không được để trống.";
  if (!/\S+@\S+\.\S+/.test(value)) {
    return "Địa chỉ email không hợp lệ.";
  }
  return "";
};

// Hàm validate cho mật khẩu
export const validatePassword = (value) => {
  if (!value) return "Mật khẩu không được để trống.";
  if (value.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự.";
  }
  if (!/[A-Z]/.test(value)) {
    return "Mật khẩu phải chứa ít nhất một chữ cái viết hoa.";
  }
  if (!/[a-z]/.test(value)) {
    return "Mật khẩu phải chứa ít nhất một chữ cái viết thường.";
  }
  if (!/[0-9]/.test(value)) {
    return "Mật khẩu phải chứa ít nhất một chữ số.";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt.";
  }
  return "";
};

// Hàm validate cho số điện thoại
export const validatePhoneNumber = (value) => {
  if (!value) return "Số điện thoại không được để trống.";
  if (!/^\d+$/.test(value)) {
    return "Số điện thoại chỉ được chứa chữ số.";
  }
  if (value.length < 10 || value.length > 11) {
    return "Số điện thoại phải có 10-11 chữ số.";
  }
  return "";
};

// Hàm validate cho tên đăng nhập
export const validateUsername = (value) => {
  if (!value) return "Tên đăng nhập không được để trống.";
  if (value.length < 3 || value.length > 20) {
    return "Tên đăng nhập phải từ 3-20 ký tự.";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    return "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới.";
  }
  return "";
};

// Hàm validate cho các trường địa chỉ
export const validateAddressField = (value, fieldName) => {
  if (!value) return `${fieldName} không được để trống.`;
  return "";
};

// Hàm validate cho ảnh đại diện
export const validateAvatar = (file) => {
  if (!file) return "Ảnh đại diện không được để trống.";
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return "Ảnh đại diện phải là định dạng JPEG, PNG hoặc GIF.";
  }
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return "Ảnh đại diện phải nhỏ hơn 5MB.";
  }
  return "";
};

export const validateRequired = (value) => {
  return value.trim() === "" ? "Trường này là bắt buộc." : "";
};

// Hàm validate cho thêm thương hiệu
export const validateAddBrandForm = (brand) => {
  const errors = {};

  if (!brand.name) errors.name = "Tên thương hiệu là bắt buộc";
  if (!brand.description) errors.description = "Mô tả thương hiệu là bắt buộc";

  if (!brand.country) errors.country = "Quốc gia là bắt buộc";
  if (!brand.website || !/^https?:\/\/.+\..+/i.test(brand.website)) {
    errors.website = "Website phải là một URL hợp lệ";
  }

  return errors;
};

// Hàm validate cho thêm danh mục
export const validateAddCategoryForm = (category) => {
  const errors = {};

  if (!category.name) errors.name = "Tên danh mục là bắt buộc";
  if (!category.description) errors.description = "Mô tả danh mục là bắt buộc";
  if (!category.image) {
    errors.image = "Hình ảnh là bắt buộc";
  } else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(category.image)) {
    errors.image = "Hình ảnh phải là một URL hợp lệ (ảnh JPG, PNG, GIF)";
  }

  return errors;
};

// Hàm validate cho thêm mã giảm giá
export const validateAddDiscountForm = (discount) => {
  const errors = {};

  if (!discount.code) errors.code = "Mã giảm giá là bắt buộc";

  if (!discount.description)
    errors.description = "Mô tả mã giảm giá là bắt buộc";

  if (
    !discount.discountValue ||
    isNaN(discount.discountValue) ||
    discount.discountValue <= 0
  )
    errors.discountValue = "Giá trị giảm giá phải là một số lớn hơn 0";

  if (discount.minimumPurchaseAmount !== undefined) {
    if (
      isNaN(discount.minimumPurchaseAmount) ||
      discount.minimumPurchaseAmount < 0
    )
      errors.minimumPurchaseAmount =
        "Số tiền mua tối thiểu không thể là số âm và phải là một số";
  }

  if (discount.usageLimit !== undefined) {
    if (isNaN(discount.usageLimit) || discount.usageLimit < 0)
      errors.usageLimit = "Số lần sử dụng không thể là số âm và phải là một số";
  }

  if (!discount.startDate) {
    errors.startDate = "Ngày bắt đầu là bắt buộc";
  } else if (new Date(discount.startDate) >= new Date(discount.endDate)) {
    errors.startDate = "Ngày bắt đầu phải trước ngày kết thúc";
  }

  if (!discount.endDate) errors.endDate = "Ngày kết thúc là bắt buộc";

  if (!discount.appliesTo) errors.appliesTo = "Loại áp dụng là bắt buộc";

  return errors;
};

// Hàm validate cho thêm chính sách
export const validateAddPolicyForm = (formData) => {
  const errors = {};

  if (!formData.type) {
    errors.type = "Loại chính sách là bắt buộc";
  }

  if (!formData.title) {
    errors.title = "Tiêu đề là bắt buộc";
  }

  if (!formData.description) {
    errors.description = "Mô tả là bắt buộc";
  }

  if (!formData.content) {
    errors.content = "Nội dung chính sách là bắt buộc";
  }

  return errors;
};

// Hàm validate cho thêm quảng cáo
export const validateAddAdForm = (ad) => {
  const errors = {};

  if (!ad.title) errors.title = "Tiêu đề quảng cáo là bắt buộc.";
  if (!ad.imageUrl) errors.imageUrl = "URL hình ảnh là bắt buộc.";
  if (!ad.link) errors.link = "Liên kết quảng cáo là bắt buộc.";
  if (!ad.description) errors.description = "Mô tả quảng cáo là bắt buộc.";
  if (!ad.startDate) errors.startDate = "Ngày bắt đầu là bắt buộc.";
  if (ad.endDate && new Date(ad.endDate) < new Date(ad.startDate))
    errors.endDate = "Ngày kết thúc phải lớn hơn ngày bắt đầu.";

  return errors;
};

// Hàm validate cho chỉnh sửa quảng cáo
export const validateEditAdForm = (ad) => {
  const errors = {};

  if (!ad.title) errors.title = "Tiêu đề quảng cáo là bắt buộc.";
  if (!ad.imageUrl) errors.imageUrl = "URL hình ảnh là bắt buộc.";
  if (!ad.link) errors.link = "Liên kết quảng cáo là bắt buộc.";
  if (!ad.description) errors.description = "Mô tả quảng cáo là bắt buộc.";
  if (!ad.startDate) errors.startDate = "Ngày bắt đầu là bắt buộc.";
  if (ad.endDate && new Date(ad.endDate) < new Date(ad.startDate))
    errors.endDate = "Ngày kết thúc phải lớn hơn ngày bắt đầu.";

  return errors;
};

// Hàm validate cho thêm liên hệ
export const validateAddContactForm = (contact) => {
  const errors = {};

  if (!contact.companyName) {
    errors.companyName = "Tên công ty là bắt buộc.";
  }
  if (!contact.email) {
    errors.email = "Email là bắt buộc.";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(contact.email)) {
    errors.email = "Địa chỉ email không hợp lệ.";
  }
  if (!contact.phoneNumber) {
    errors.phoneNumber = "Số điện thoại là bắt buộc.";
  } else if (!/^\d+$/i.test(contact.phoneNumber)) {
    errors.phoneNumber = "Số điện thoại chỉ được chứa số.";
  }
  if (contact.socialMedia?.zalo && !/^\d+$/i.test(contact.socialMedia.zalo)) {
    errors.zalo = "Zalo chỉ được chứa số.";
  }
  return errors;
};

export const validateStatistics = (num) => {
  return num.toLocaleString();
};
