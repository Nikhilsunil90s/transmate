/* eslint-disable class-methods-use-this */
import React from "react";
// eslint-disable-next-line import/no-namespace
import * as Sentry from "@sentry/react";
import ErrorMessage from "./CaughtError.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    console.error(error, errorInfo);
    Sentry.addBreadcrumb({
      category: "componentDidCatch",
      message: `componentDidCatch occured`,
      level: Sentry.Severity.Info,
      data: errorInfo
    });
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI

      return (
        <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>} showDialog>
          <ErrorMessage />
        </Sentry.ErrorBoundary>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
