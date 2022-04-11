/* eslint-disable no-use-before-define */

import { useQuery } from "@apollo/client";
import React, { useState } from "react";

/* eslint-disable meteor/no-session */
import { Session } from "meteor/session";

import TenderBidTable from "./components/TenderBidTable";
import OverviewPanelWrapper from "../../components/tables/components/OverviewPanelWrapper.jsx";
import { DEFAULT_VIEW, VIEWS } from "/imports/api/tender-bids/enums/views";
import { GET_TENDER_BIDS } from "./utils/queries";

const debug = require("debug")("tenderBid:overview");

const overviewName = "tender.overview";

export const TenderBidOverview = ({
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
      <TenderBidTable {...{ data, isDataLoading }} />
    </OverviewPanelWrapper>
  );
};

const TenderBidOverviewLoader = () => {
  const [currentViewKey, setView] = useState(
    Session.get(`${overviewName}::viewkey`) || DEFAULT_VIEW
  );

  const setDefaultView = () => {
    setView(DEFAULT_VIEW);
  };

  const { data = {}, loading: isDataLoading, error } = useQuery(GET_TENDER_BIDS, {
    variables: { viewKey: currentViewKey }
  });

  if (error) {
    console.error(`>>>>>>> error`, error);
    return null;
  }

  const refinedData = data.tenderBids || [];
  debug("data for key:%s: %o", currentViewKey, refinedData);

  return (
    <TenderBidOverview
      {...{
        data: refinedData,
        isDataLoading,
        currentViewKey,
        setView,
        setDefaultView
      }}
    />
  );
};

export default TenderBidOverviewLoader;
