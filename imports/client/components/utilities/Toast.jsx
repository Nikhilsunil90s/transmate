import React from "react";
import { ToastContainer as T } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import toast function of react-toastify on pages
export const ToastContainer = () => {
  return (
    <T
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover
    />
  );
};
