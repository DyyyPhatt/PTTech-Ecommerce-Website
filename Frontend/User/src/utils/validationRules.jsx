export const validateFirstName = (value) => {
  if (!value) return "Họ không được để trống.";
  if (!/^[A-Za-zÀ-ỹ\s]+$/.test(value)) {
    return "Họ không được chứa ký tự đặc biệt hoặc số.";
  }
  return "";
};

export const validateLastName = (value) => {
  if (!value) return "Tên không được để trống.";
  if (!/^[A-Za-zÀ-ỹ\s]+$/.test(value)) {
    return "Tên không được chứa ký tự đặc biệt hoặc số.";
  }
  return "";
};

export const validateEmail = (value) => {
  if (!value) return "Email không được để trống.";
  if (!/\S+@\S+\.\S+/.test(value)) {
    return "Địa chỉ email không hợp lệ.";
  }
  return "";
};

export const validatePhone = (value) => {
  if (!value) return "Số điện thoại không được để trống.";
  if (!/^\d{10}$/.test(value)) {
    return "Số điện thoại phải gồm 10 chữ số.";
  }
  return "";
};

export const validatePassword = (value) => {
  if (!value) return "Mật khẩu không được để trống.";
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordPattern.test(value)) {
    return "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ viết hoa, 1 chữ viết thường và 1 số.";
  }
  return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Mật khẩu xác nhận không được để trống.";
  if (confirmPassword !== password) {
    return "Mật khẩu xác nhận không khớp.";
  }
  return "";
};
