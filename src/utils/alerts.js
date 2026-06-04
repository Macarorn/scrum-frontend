import { toast } from "react-toastify";

const toastConfig = {
  position: "top-right",
  draggable: true,
  theme: "light",
  style: { zIndex: 9999 },
};

export const showError = (message) => {
  toast.error(message, {
    ...toastConfig,
    toastId: message,
  });
};

export const showSuccess = (message) => {
  toast.success(message, {
    ...toastConfig,
    toastId: message,
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    ...toastConfig,
    toastId: message,
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    ...toastConfig,
    toastId: message,
  });
};
