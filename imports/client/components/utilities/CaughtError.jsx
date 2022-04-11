import React from "react";

const ErrorMessage = () => (
  <div style={{ textAlign: "center", maxHeight: "300px" }}>
    <img
      src="https://assets.transmate.eu/app/error_graphic.png"
      alt="error"
      style={{ height: "50%" }}
    />
    <br />
    <h1>Something went wrong...</h1>
  </div>
);

export default ErrorMessage;
