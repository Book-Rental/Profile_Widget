export type ToastType = "success" | "error" | "info" | "warning";

export const showToast = (
  message: string,
  type: ToastType
) => {
  window.dispatchEvent(
    new CustomEvent("app-toast-notification", {
      detail: {
        message,
        type,
      },
    })
  );    
};