import React from "react";
import PropTypes from "prop-types";

const SocialButton = ({
  icon: Icon,
  text,
  bgColor,
  hoverColor,
  textColor,
  darkBgColor,
  darkHoverColor,
  darkTextColor,
}) => (
  <button
    type="button"
    className={`flex items-center justify-center 
      ${bgColor} ${textColor} hover:${hoverColor} 
      dark:${darkBgColor} dark:${darkTextColor} dark:hover:${darkHoverColor} 
      py-3 px-4 rounded-lg transition-colors font-medium`}
  >
    <Icon className="mr-2" size={24} /> {text}
  </button>
);

SocialButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  text: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  darkBgColor: PropTypes.string,
  darkHoverColor: PropTypes.string,
  darkTextColor: PropTypes.string,
};

SocialButton.defaultProps = {
  darkBgColor: "bg-gray-800",
  darkHoverColor: "bg-gray-700",
  darkTextColor: "text-white",
};

export default SocialButton;
