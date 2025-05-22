import React from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

function ToastNotification({ type, message, show }) {
  // Type-specific styles and icons
  const typeStyles = {
    success: {
      bg: "bg-green-500",
      icon: <FaCheckCircle className="text-white text-xl" />,
    },
    error: {
      bg: "bg-red-500",
      icon: <FaExclamationCircle className="text-white text-xl" />,
    },
    info: {
      bg: "bg-blue-500",
      icon: <FaInfoCircle className="text-white text-xl" />,
    },
    warning: {
      bg: "bg-yellow-500",
      icon: <FaExclamationCircle className="text-white text-xl" />,
    },
  };

  const toastStyle = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`fixed right-4 top-4 w-80 h-16 flex items-center px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out z-50 ${
        show
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-6 pointer-events-none"
      } ${toastStyle.bg}`}
    >
      <div className="mr-4">{toastStyle.icon}</div>
      <div className="text-white font-semibold">{message}</div>
    </div>
  );
}

export default ToastNotification;
