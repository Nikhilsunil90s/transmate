/* eslint-disable meteor/no-session */
import { Session } from "meteor/session";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Emitter, Events } from "/imports/client/services/events";

import AddressTable from "./components/AddressTable";
import OverviewPanelWrapper from "../../components/tables/components/OverviewPanelWrapper.jsx";
import { DEFAULT_VIEW, VIEWS } from "/imports/api/addresses/enums/views";
import { GET_ADDRESS_OVERVIEW } from "./utils/queries";

const debug = require("debug")("address:overview");

const overviewName = "address.overview";

export const AddressOverview = ({
  currentViewKey,
  setView,
  setDefaultView,
  data,
  isDataLoading
}) => {
  return (
    <OverviewPanelWrapper
      overviewName={overviewName}
      currentViewLabel={VIEWS[currentViewKey].text}
      setView={setView}
      setDefaultView={setDefaultView}
      views={VIEWS}
    >
      <AddressTable {...{ data, isDataLoading }} />
    </OverviewPanelWrapper>
  );
};

const AddressOverviewLoader = () => {
  const [nameFilter, setNameFilter] = useState(null);
  const [currentViewKey, setView] = useState(
    Session.get(`${overviewName}::viewkey`) || DEFAULT_VIEW
  );

  const setDefaultView = () => {
    setView(DEFAULT_VIEW);
  };

  const { data = {}, loading: isDataLoading, error } = useQuery(GET_ADDRESS_OVERVIEW, {
    variables: { input: { viewKey: currentViewKey, nameFilter } }
  });

  const addressData = data.addresses || [];
  debug("data %o", addressData);

  useEffect(() => {
    Emitter.on(Events.TOP_BAR_SEARCH, ({ query: nameFilterValue }) => {
      setNameFilter(nameFilterValue);
    });
    return () => Emitter.off(Events.TOP_BAR_SEARCH);
  });

  if (error) {
    console.error(`>>>>>>> error`, error);
    return null;
  }

  return (
    <AddressOverview
      {...{
        data: addressData,
        isDataLoading,
        currentViewKey,
        setView,
        setDefaultView
      }}
    />
  );
};

export default AddressOverviewLoader;
