/* eslint-disable meteor/no-session */

import { Session } from "meteor/session";
import React, { useContext, useEffect, useState } from "react";
import { gql, useQuery, useApolloClient } from "@apollo/client";
import { Icon } from "semantic-ui-react";
import { Emitter, Events } from "/imports/client/services/events";
import PriceRequestsTable from "./components/PriceRequestsTable";
import OverviewPanelWrapper from "../../components/tables/components/OverviewPanelWrapper.jsx";
import { DEFAULT_VIEW, VIEWS } from "/imports/api/priceRequest/enums/views";
import { query } from "/imports/utils/UI/query";
import { GET_PRICEREQUEST_VIEW } from "./utils/queries";
import useRoute from "../../router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("price-request:overview");

const overviewName = "price.request.overview";

const GET_SERVER_TIME = gql`
  query getCurrentTimeForPriceRequest {
    getCurrentTime
  }
`;

function preparePriceRequests(priceRequests = []) {
  return priceRequests;
}

export const PriceRequestsOverview = ({
  currentViewKey,
  setView,
  setDefaultView,
  priceRequests,
  isRequestsLoading,
  serverTimeDifference: tDiff
}) => {
  const { goRoute } = useRoute();
  const { account } = useContext(LoginContext);
  const isCarrier = account.type === "carrier";
  return (
    <OverviewPanelWrapper
      overviewName={overviewName}
      currentViewLabel={VIEWS[currentViewKey].text}
      setView={setView}
      setDefaultView={setDefaultView}
      views={VIEWS}
      dataExport={
        isCarrier && (
          <a
            className="button"
            style={{ cursor: "pointer" }}
            onClick={() => goRoute("priceRequestsDownload")}
            data-tooltip="Configure view (change columns or filters)"
            data-position="left center"
          >
            <Icon name="download" />
            Download
          </a>
        )
      }
    >
      <PriceRequestsTable {...{ priceRequests, isRequestsLoading, serverTimeDifference: tDiff }} />
    </OverviewPanelWrapper>
  );
};

const PriceRequestsOverviewLoader = () => {
  const client = useApolloClient();
  const [currentViewKey, setView] = useState(
    Session.get(`${overviewName}::viewkey`) || DEFAULT_VIEW
  );
  const { data = {}, loading, error } = useQuery(GET_SERVER_TIME);
  debug("server time response: %o ", { data, loading, error });
  const serverTimeDifference = new Date(data.getCurrentTime) - new Date();
  const [priceRequests, setPriceRequests] = useState([]);
  const [isRequestsLoading, setRequestsLoading] = useState(false);

  async function getPriceRequests(callback, viewKey, filters = {}) {
    query(
      {
        client,
        query: {
          query: GET_PRICEREQUEST_VIEW,
          variables: { input: { viewKey, filters } },
          fetchPolicy: "network-only"
        }
      },
      callback
    );
  }

  const setDefaultView = () => {
    setView(DEFAULT_VIEW);
  };

  useEffect(() => {
    setRequestsLoading(true);

    getPriceRequests(res => {
      const refinedPriceRequests = preparePriceRequests(res.priceRequests);
      setRequestsLoading(false);
      setPriceRequests(refinedPriceRequests);
    }, currentViewKey);
  }, [currentViewKey]);
  useEffect(() => {
    Emitter.on(Events.TABLE_BAR_SEARCH, ({ query: q }) => {
      const mongoFilter =
        q.length > 1
          ? {
              $text: {
                $search: q
              }
            }
          : {};

      getPriceRequests(
        result => {
          const refinedPriceRequests = preparePriceRequests(result.priceRequests);
          setPriceRequests(refinedPriceRequests);

          setRequestsLoading(false);
        },
        currentViewKey,
        mongoFilter
      );
    });
    return () => Emitter.off(Events.TABLE_BAR_SEARCH);
  });
  return (
    <PriceRequestsOverview
      {...{
        priceRequests,
        isRequestsLoading,
        currentViewKey,
        setView,
        setDefaultView,
        serverTimeDifference
      }}
    />
  );
};

export default PriceRequestsOverviewLoader;
