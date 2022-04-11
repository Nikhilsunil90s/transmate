import React, { Suspense } from "react";
import LogoLoading from "../../components/utilities/LogoLoading";
import ErrorBoundary from "/imports/client/components/utilities/ErrorBoundery";

const MinimalLayout = ({ name, main }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LogoLoading />}>
        <div className="app">
          <main className={name}>{main || null}</main>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default MinimalLayout;
