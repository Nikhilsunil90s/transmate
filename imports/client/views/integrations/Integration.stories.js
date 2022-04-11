import React from "react";

import ExactIntegrationLoader, { ExactIntegration } from "./Exact.jsx";
import IntegrationSuccess from "./Success.jsx";

export default {
  title: "Integration"
};

// result of the getDevisions fetch:
const divisions = [
  {
    Code: 830287,
    Country: "BE ",
    Created: "/Date(1603141167713)/",
    Currency: "EUR",
    Current: true,
    CustomerName: "Transmate",
    Description: "Transmate",
    Email: "jan@transmate.eu"
  },
  {
    Code: 830716,
    Country: "BE ",
    Created: "/Date(1603292114720)/",
    Currency: "EUR",
    Current: false,
    CustomerName: "Transmate",
    Description: "Transmate2",
    Email: null
  }
];

export const exact = () => {
  const props = { divisions };
  return <ExactIntegration {...props} />;
};

export const exactLoader = () => {
  return <ExactIntegrationLoader />;
};

export const success = () => {
  return <IntegrationSuccess />;
};
