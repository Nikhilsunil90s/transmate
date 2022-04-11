import React from "react";
import { Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import useRoute from "./useRoute";
import { setCurrentRoute } from "./routes-helpers";

const MyTitle = ({ title }) => {
  const { params } = useRoute();

  const theTitle = typeof title === "function" ? title({ params }) : title;

  return (
    <Helmet>
      <title>{theTitle}</title>
    </Helmet>
  );
};

const MyRoute = ({ onEnter, name, children, title, ...otherProps }) => {
  const { goRoute, location } = useRoute();

  const request = { path: location.pathname };

  setCurrentRoute(name);

  if (onEnter && !onEnter(request, goRoute)) {
    return null;
  }
  return (
    <Route {...otherProps}>
      {title && <MyTitle title={title} />}
      {children}
    </Route>
  );
};

export default MyRoute;
