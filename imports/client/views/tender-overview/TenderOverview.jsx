/* eslint-disable no-use-before-define */

import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import moment from "moment";
/* eslint-disable meteor/no-session */
import { Session } from "meteor/session";

import TenderTable from "./components/TenderTable";
import OverviewPanelWrapper from "../../components/tables/components/OverviewPanelWrapper.jsx";
import { DEFAULT_VIEW, VIEWS } from "/imports/api/tenders/enums/views";
import { GET_TENDERS } from "./utils/queries";

const debug = require("debug")("tender:overview");

const overviewName = "tender.overview";

function prepareData(data = []) {
  return data.map(doc => ({
    ...doc,
    createdAt: moment(doc.created.at).format("LL"),
    closedDate: moment(doc.closedDate).format("LL")
  }));
}

export const TenderOverview = ({
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
      <TenderTable {...{ data, isDataLoading }} />
    </OverviewPanelWrapper>
  );
};

const TenderOverviewLoader = () => {
  const [currentViewKey, setView] = useState(
    Session.get(`${overviewName}::viewkey`) || DEFAULT_VIEW
  );

  const setDefaultView = () => {
    setView(DEFAULT_VIEW);
  };

  const { data = {}, loading: isDataLoading, error } = useQuery(GET_TENDERS, {
    variables: { viewKey: currentViewKey }
  });

  if (error) {
    console.error(`>>>>>>> error`, error);
    return null;
  }

  const refinedData = prepareData(data.tenders || []);
  debug("data %o", refinedData);

  return (
    <TenderOverview
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

export default TenderOverviewLoader;
