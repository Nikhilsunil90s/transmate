import { toast } from "react-toastify";
import React, { useState, useMemo, useContext, useEffect } from "react";
import { useQuery, useApolloClient } from "@apollo/client";

import { Trans } from "react-i18next";
import { Container, Menu } from "semantic-ui-react";

import { NotesTab, GeneralTab, DataTab, PartnersTab, AnalyticsTab } from "./tabs";
import Footer from "./components/Footer.jsx";
import LoginContext from "/imports/client/context/loginContext";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import { initializeSecurity } from "./utils/security";
import { GET_PRICE_REQUEST, UPDATE_PRICE_REQUEST } from "./utils/queries";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";
import { mutate } from "/imports/utils/UI/mutate";
import useRoute from "../../router/useRoute";
import { markNotificationsRead } from "/imports/utils/UI/markNotificationsRead";

const ALL_TABS = ["general", "partners", "data", "notes", "analytics"];
const DEFAULT_TAB = "general";

const debug = require("debug")("priceRequest:UI");

const initializeTabs = (security, params) => {
  const priceRequestId = params._id;
  const isNew = priceRequestId === "new";
  let tabs = isNew ? [DEFAULT_TAB] : ALL_TABS;
  if (!security.canViewPartners) tabs = tabs.filter(t => t !== "partners");
  if (!security.canViewAnalytics) tabs = tabs.filter(t => t !== "analytics");
  return tabs;
};

const PriceRequestPage = ({ ...props }) => {
  //#region tab menu
  const { params, setRouteParams } = useRoute();
  const allTabs = useMemo(() => initializeTabs(props.security, params), []);
  const { section } = params;
  const initialTab = section || DEFAULT_TAB;
  const [activeTab, setActiveTab] = useState(initialTab);

  const selectTab = name => {
    setRouteParams({ section: name || DEFAULT_TAB });
    setActiveTab(name);
  };

  const handleTabClick = (e, { name }) => selectTab(name);
  //#endregion

  const allProps = { ...props, selectTab };

  return (
    <>
      <div>
        <Menu
          pointing
          secondary
          className="tabs"
          items={allTabs.map(key => ({
            key,
            "data-test": `${key}Tab`,
            name: key,
            content: <Trans i18nKey={`price.request.tab.${key}`} />,
            active: key === activeTab
          }))}
          onItemClick={handleTabClick}
        />
        <Container fluid>
          {activeTab === "general" && <GeneralTab {...allProps} />}
          {activeTab === "partners" && <PartnersTab {...allProps} />}
          {activeTab === "data" && <DataTab {...allProps} />}
          {activeTab === "notes" && <NotesTab {...allProps} />}
          {activeTab === "analytics" && <AnalyticsTab {...allProps} />}
        </Container>
      </div>
      <Footer {...allProps} />
    </>
  );
};

const PriceRequestPageLoader = () => {
  const client = useApolloClient();
  const curLogin = useContext(LoginContext);
  const { params, goRoute } = useRoute();
  const priceRequestId = params._id;
  debug("PriceRequestPageLoader for id:", priceRequestId);

  useEffect(() => {
    if (!priceRequestId) {
      markNotificationsRead("price-request", [], { priceRequestId }, client);
    }
  }, [priceRequestId]);
  if (!priceRequestId) return "no priceRequestId??";

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const { data: fetchData = {}, loading, error, refetch: refreshData } = useQuery(
    GET_PRICE_REQUEST,
    { variables: { priceRequestId } }
  );
  if (error) console.error(error);

  debug("pr data from apollo %o", { fetchData, loading, error });

  if (loading) {
    return <Loader loading />;
  }

  const priceRequest = removeEmpty(fetchData.priceRequest || {}, true);

  if (!priceRequest.id) {
    // redirect if it is not returning priceRequest
    console.error("price request not found!", priceRequestId);
    goRoute("priceRequests");
    return toast.error(
      `Price request ${priceRequestId} not found, or you have no access to see it!`
    );
  }

  const security = initializeSecurity({ priceRequest, context: curLogin });
  debug("security %o", security);
  const onSave = ({ update }, cb) => {
    debug("updating price request %o", { update, priceRequestId });
    mutate(
      {
        client,
        query: {
          mutation: UPDATE_PRICE_REQUEST,
          variables: { input: { priceRequestId, update } }
        },
        successMsg: "changes stored",
        errorMsg: "Could not save changes"
      },
      cb
    );
  };

  return <PriceRequestPage {...{ priceRequestId, priceRequest, security, onSave, refreshData }} />;
};

export default PriceRequestPageLoader;
