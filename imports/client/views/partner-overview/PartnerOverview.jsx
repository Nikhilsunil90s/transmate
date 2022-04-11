import React, { useState } from "react";
/* eslint-disable meteor/no-session */
import { Session } from "meteor/session";
import { useQuery } from "@apollo/client";
import PartnersTable from "./components/PartnersTable";
import OverviewPanelWrapper from "../../components/tables/components/OverviewPanelWrapper.jsx";
import { DEFAULT_VIEW, VIEWS } from "/imports/api/partnerships/enums/views";

import { GET_PARTNERS_VIEW } from "./utils/queries";

const debug = require("debug")("partners:overview");

const OVERVIEW_NAME = "partner.overview";

const PartnerOverviewLoader = () => {
  const [currentViewKey, setView] = useState(
    Session.get(`${OVERVIEW_NAME}::viewkey`) || DEFAULT_VIEW
  );
  const { data = {}, loading, error } = useQuery(GET_PARTNERS_VIEW, {
    variables: { input: { viewKey: currentViewKey, filters: {} } }
  });

  debug("apollo data %o", { data, loading, error });

  const setDefaultView = () => {
    setView(DEFAULT_VIEW);
  };

  const partners = data.partners || [];
  return (
    <PartnersOverview
      {...{
        data: partners,
        isDataLoading: loading,
        currentViewKey,
        setView,
        setDefaultView
      }}
    />
  );
};

export const PartnersOverview = ({
  currentViewKey,
  setView,
  setDefaultView,
  data,
  isDataLoading
}) => {
  return (
    <OverviewPanelWrapper
      overviewName={OVERVIEW_NAME}
      currentViewLabel={VIEWS[currentViewKey].text}
      setView={setView}
      setDefaultView={setDefaultView}
      views={VIEWS}
    >
      <PartnersTable {...{ data, isDataLoading }} />
    </OverviewPanelWrapper>
  );
};

export default PartnerOverviewLoader;
