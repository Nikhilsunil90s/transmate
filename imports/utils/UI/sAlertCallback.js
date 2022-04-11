import { toast } from "react-toastify";

// eslint-disable-next-line consistent-return
export const sAlertCallback = (err, res, options) => {
  const { onSuccessCb, onSuccessMsg, onErrorMsg, onErrorCb, errorMsgOnly } =
    options || {};
  if (err) {
    if (onErrorCb && typeof onErrorCb === "function") {
      onErrorCb();
    }
    return toast.error(onErrorMsg || err.reason, {
      onRouteClose: false
    });
  }

  // success:
  if (onSuccessCb) {
    onSuccessCb();
  }

  if (!errorMsgOnly) {
    toast.success(onSuccessMsg || "Changes stored", {
      onRouteClose: false
    });
  }
};
