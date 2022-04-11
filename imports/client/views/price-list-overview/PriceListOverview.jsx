import React, { useEffect, useState } from "react";
import capitalize from "lodash.capitalize";
import moment from "moment";
/* eslint-disable meteor/no-session */
import { Session } from "meteor/session";
import { Emitter, Events } from "/imports/client/services/events";
import { useApolloClient } from "@apollo/client";
import OverviewPanelWrapper from "../../components/tables/components/OverviewPanelWrapper.jsx";
import PriceListsTable from "./components/PriceListsTable.jsx";

import { DEFAULT_VIEW, VIEWS } from "/imports/api/pricelists/enums/views";
import { GET_PRIE_VIEW_LIST_QUERY } from "./utils/queries.js";

const debug = require("debug")("priceList:overview");

const overviewName = "price.list.overview";

async function getPriceList(client, callback, viewKey, filters = {}) {
  // TODO: check fields
  const { data, errors } = await client.query({
    query: GET_PRIE_VIEW_LIST_QUERY,
    fetchPolicy: "no-cache",
    variables: { input: { viewKey, filters } }
  });

  if (errors && errors.length) {
    return callback(errors[0]);
  }

  if (data) {
    return callback(null, data.getPriceViewList);
  }

  return null;
}

function preparePriceList(priceList = []) {
  return priceList.map((price = {}) => {
    const { mode, validTo } = price || {};

    price.validTo = validTo && moment(validTo).format("YYYY-MM-DD");
    price.mode = mode && capitalize(mode);

    return price;
  });
}

const PriceListOverviewLoader = () => {
  const [currentViewKey, setView] = useState(
    Session.get(`${overviewName}::viewkey`) || DEFAULT_VIEW
  );
  const [priceLists, setPriceLists] = useState([]);
  const [isLoadingPriceLists, setLoadingPriceLists] = useState(false);
  const client = useApolloClient();

  const setDefaultView = () => {
    setView(DEFAULT_VIEW);
  };

  useEffect(() => {
    setLoadingPriceLists(true);

    getPriceList(
      client,
      (error, result) => {
        const refinedPriceList = preparePriceList(result);
        setPriceLists(refinedPriceList);

        setLoadingPriceLists(false);
      },
      currentViewKey
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewKey]);

  useEffect(() => {
    Emitter.on(Events.TABLE_BAR_SEARCH, ({ query: q }) => {
      debug("modify view based on search %o", q);
      const mongoFilter =
        q.length > 1
          ? {
              $text: {
                $search: q
              }
            }
          : {};
      setLoadingPriceLists(true);
      getPriceList(
        client,
        (error, result) => {
          const refinedPriceList = preparePriceList(result);
          setPriceLists(refinedPriceList);

          setLoadingPriceLists(false);
        },
        currentViewKey,
        mongoFilter
      );
    });
    return () => Emitter.off(Events.TABLE_BAR_SEARCH);
  });

  debug("priceLists from query %o", priceLists);

  return (
    <PriceListOverview
      {...{ priceLists, isLoadingPriceLists, currentViewKey, setView, setDefaultView }}
    />
  );
};

const PriceListOverview = ({
  currentViewKey,
  setView,
  setDefaultView,
  priceLists,
  isLoadingPriceLists
}) => {
  return (
    <OverviewPanelWrapper
      overviewName={overviewName}
      currentViewLabel={VIEWS[currentViewKey].text}
      setView={setView}
      setDefaultView={setDefaultView}
      views={VIEWS}
    >
      <PriceListsTable {...{ priceLists, isLoadingPriceLists }} />
    </OverviewPanelWrapper>
  );
};

export default PriceListOverviewLoader;
