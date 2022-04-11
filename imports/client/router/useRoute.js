import { useLocation, useHistory, useParams } from "react-router";
import {
  generateRoutePath,
  getCurrentRoute
} from "/imports/client/router/routes-helpers";

const useRoute = () => {
  const location = useLocation();
  const history = useHistory();
  const params = useParams();
  const { name, path } = getCurrentRoute() || {};

  const goRoute = (routeName, routeParams) => {
    const url = generateRoutePath(routeName, routeParams);

    history.push(url);
  };

  /** go to specific path */
  const goRoutePath = (pathString = "/") => {
    history.push(pathString);
  };

  const setRouteParams = ops => {
    const newParams = { ...params, ...ops };

    const url = generateRoutePath(name, newParams);

    history.replace(url);
  };

  const setQueryParams = (ops, reset = true) => {
    const { pathname, search } = location;

    const sString = search ? search.substring(1) : "";
    const queryParams = new URLSearchParams(reset ? "" : sString);
    // eslint-disable-next-line array-callback-return
    Object.entries(ops).map(([key, val]) => {
      if (!key) {
        return;
      }
      if (!val) {
        queryParams.delete(key);

        return;
      }
      queryParams.set(key, val);
    });

    const query = queryParams.toString();

    const fullUrl = `${pathname}${query ? `?${query}` : ""}`;

    history.replace(fullUrl);
  };

  const queryParams = {};

  new URLSearchParams(location.search).forEach((value, key) => {
    queryParams[key] = value;
  });

  return {
    name,
    path,
    location,
    history,
    url: location.pathname,
    params: params || {},
    setRouteParams,
    queryParams,
    setQueryParams,
    goRoute,
    goRoutePath
  };
};

export default useRoute;
