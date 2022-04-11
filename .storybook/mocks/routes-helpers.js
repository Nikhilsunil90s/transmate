import { generatePath } from "react-router";

const routesMap = {};
let currentRoute = null;

console.log("mock loaded");
export const generateRoutePath = (name, params) => {
  const pattern = routesMap[name];
  const path = generatePath(pattern, params);

  return path;
};

export const regiterPath = (name, path) => {
  if (!name || !path) {
    return;
  }
  routesMap[name] = path;
};

export const goRoute = (history, name, params) => {
  const url = generateRoutePath(name, params);
  history.push(url);
};

export const setCurrentRoute = route => {
  currentRoute = route;
};

export const getCurrentRoute = () => {
  if (!currentRoute) {
    return null;
  }
  const path = routesMap[currentRoute];

  return { name: currentRoute, path };
};
