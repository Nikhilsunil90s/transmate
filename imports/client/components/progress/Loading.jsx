import React from "react";
import classNames from "classnames";

const Loading = ({ isLoading, children }) => {
  const className = classNames({ "ui loading segment": isLoading, "loading-container": true });

  return <div className={className}>{children}</div>;
};

export default Loading;
