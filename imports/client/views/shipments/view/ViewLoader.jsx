import React, { useMemo } from "react";
import { useQuery } from "@apollo/client";

import Loader from "/imports/client/components/utilities/Loader.jsx";
import ShipmentView from "./View.jsx";

import { GET_VIEW } from "./utils/queries";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("shipment:view");

const ShipmentViewLoader = () => {
  const { params } = useRoute();
  const viewId = useMemo(() => params._id, []);

  const { data, loading, error } = useQuery(GET_VIEW, {
    variables: { viewId },
    skip: !viewId
  });
  if (error) {
    console.error(`>>>>>>> error`, error);
    return null;
  }

  const { view = {} } = data || {};
  debug("view data", data);

  return loading ? <Loader loading /> : <ShipmentView {...{ view }} />;
};

export default ShipmentViewLoader;
