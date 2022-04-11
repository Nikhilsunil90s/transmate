import { toast } from "react-toastify";
import React, { useState, useEffect, useContext } from "react";
import { useApolloClient, useQuery } from "@apollo/client";
import get from "lodash.get";
import HeaderMenu from "./components/HeaderMenu";
import ShipmentsTable from "./components/ShipmentsTable";
import generateColumnsFromView from "./utils/generateColumns";
import { Emitter, Events } from "/imports/client/services/events";
import Loader from "/imports/client/components/utilities/Loader.jsx";

import {
  GET_SHIPMENT_VIEWS,
  GET_SHIPMENT_VIEW_COLUMNS,
  GET_PAGED_SHIPMENT_OVERVIEW
} from "./utils/queries";
import LoginContext from "../../context/loginContext";

const debug = require("debug")("shipment:overview-all");

/**
 * Proces flow:
 * 1. get user preferences & shipment views with subscription -> sub 1 ready
 * 2. select a shipmentView (viewId) -> automatic
 * 3. get overview data for that shipmentView (with method call) -> sub 2 ready
 */

const getInitialView = vData => {
  let initialView;
  const views = get(vData, "views") || [];
  const preferedViewId = get(vData, ["preferences", "views", "shipments"]);
  if (preferedViewId) {
    initialView = views.find((shipmentView = {}) => shipmentView.id === preferedViewId);
  }

  if (!initialView) {
    initialView = views.find((shipmentView = {}) => shipmentView.type === "global");
  }
  return { initialView, views };
};

function populateViews({ views = [], userId, accountId }) {
  debug("populateViews call");

  const globalViews = views.filter(({ type }) => type === "global");
  const myListViews = views.filter(view => view.created?.by === userId);
  const sharedViews = views.filter(view => {
    return view.accountId === accountId && view?.created?.by !== userId && view.isShared;
  });

  return { globalViews, myListViews, sharedViews };
}

/** mail holder with header & table component */
const ShipmentOverviewRender = ({ view, handleChangeViewId, sortedViews, columns }) => {
  const client = useApolloClient();
  const { name: viewName, id: viewId } = view || {};

  const initialColumns = [
    {
      Header: "number",
      accessor: "shipment.number",
      orderable: true
    },
    {
      Header: "reference",
      accessor: "references.number",
      orderable: true
    },
    {
      Header: "status",
      accessor: "shipment.status",
      orderable: true
    }
  ];
  const [selectedShipments, setSelectedShipments] = useState([]); // passes on to header
  const [dbData, setData] = useState({}); // {data: [], totalRecords :}
  const [loading, setLoading] = useState(true);

  const [fetchShipmentArguments, setFetchShipmentArguments] = useState({});

  useEffect(() => {
    Emitter.on(Events.TOP_BAR_SEARCH, ({ query }) => {
      // eslint-disable-next-line no-use-before-define
      fetchShipments({
        filters: {
          $or: [
            { "delivery.location.name": { $regex: query, $options: "i" } },
            { "pickup.location.name": { $regex: query, $options: "i" } },
            { number: { $regex: query, $options: "i" } }
          ]
        },
        ...fetchShipmentArguments
      });
    });
    return () => Emitter.off(Events.TOP_BAR_SEARCH);
  });

  async function fetchShipments({ pageSize, pageIndex, maxRows: length, sortBy, filters = {} }) {
    setLoading(true);
    setFetchShipmentArguments({ pageSize, pageIndex, maxRows: length, sortBy });

    const rowToStartFrom = pageIndex * pageSize;

    debug("server call args", { viewId, length, start: rowToStartFrom, sortBy, columns });
    const sort = {};
    if (get(sortBy, "[0].id")) {
      sort.column = sortBy[0].id;
      sort.dir = sortBy[0].desc ? "desc" : "asc";
    }
    debug("sort table with ", sort);

    // fetchShipmentData({
    //   variables: { input: { viewId, length, start: rowToStartFrom, filters, sort } }
    // });
    try {
      const res = await client.query({
        query: GET_PAGED_SHIPMENT_OVERVIEW,
        variables: {
          input: { viewId, length, start: rowToStartFrom, filters, sort }
        },
        fetchPolicy: "no-cache"
      });
      const { data = {}, errors } = res;
      debug("shipmentViewRes, %o", res);
      if (errors) throw errors;
      setData(data.result || { data: [], recordsTotal: 0 });
      setLoading(false);
    } catch (error) {
      setData({ data: [], recordsTotal: 0 });
      setLoading(false);
      console.error({ error });
      toast.error("Error fetching data. Please refresh the page");
    }
  }

  return (
    <div>
      {/* when data loads, the react table retriggers selectedShipment which causes the component to rerender */}
      <HeaderMenu
        viewId={viewId}
        viewName={viewName}
        sortedViews={sortedViews}
        selectedShipments={selectedShipments}
        onChangeView={handleChangeViewId}
      />

      <ShipmentsTable
        {...{
          dbData,
          loading,
          setSelectedShipments,
          viewId,
          fetchShipments,
          columns: columns || initialColumns,
          fetchTrigger: viewId
        }}
      />
    </div>
  );
};

const ShipmentOverviewPreRender = ({ initialView, sortedViews }) => {
  const [view, changeView] = useState(initialView);
  const { data: vData = {}, loading: isColLoading, error, refetch: refetchColumns } = useQuery(
    GET_SHIPMENT_VIEW_COLUMNS,
    {
      variables: { viewId: view.id },
      fetchPolicy: "no-cache"
    }
  );

  function handleChangeViewId(updatedView) {
    debug("call handleChangeViewId: ", updatedView);

    // only change if views are ready
    changeView(updatedView);
    refetchColumns();
  }

  if (error) console.error(error);
  if (isColLoading) return <Loader loading />;
  debug("view columns %o", vData.view);
  const columns = generateColumnsFromView(vData.view);

  return (
    <ShipmentOverviewRender
      {...{
        changeView,
        view,
        sortedViews,
        handleChangeViewId,
        columns
      }}
    />
  );
};

// main component that trigger subscriptions and will render once viewdata is in
const ShipmentOverview = () => {
  const { accountId, userId } = useContext(LoginContext);
  const { data: vData = {}, loading, error } = useQuery(GET_SHIPMENT_VIEWS);

  debug("views & preferences %o", vData);
  if (error) console.error(error);
  if (loading) return <Loader loading />;
  const { initialView, views } = getInitialView(vData);
  const sortedViews = populateViews({ views, userId, accountId });

  return <ShipmentOverviewPreRender {...{ initialView, views, sortedViews }} />;
};

export default ShipmentOverview;
