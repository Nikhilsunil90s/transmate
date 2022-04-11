import { toast } from "react-toastify";
import React, { useState, useCallback, useContext, useEffect } from "react";
import LoginContext from "/imports/client/context/loginContext";

import { useQuery, useApolloClient } from "@apollo/client";
import { Container, Menu } from "semantic-ui-react";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import Footer from "./components/Footer.jsx";
import {
  GeneralTab,
  OfferTab,
  NotesTab,
  SourceTab,
  SheetTab,
  SettingsTab,
  DiscussionTab
} from "./tabs";
import { GET_TENDERBID, GET_SETTINGS } from "./utils/queries";

import { initializeSecurity } from "./utils/security";
import { initializeTabs } from "./utils/initializeTabs";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";
import { mutate } from "/imports/utils/UI/mutate";
import { SettingsProvider } from "./utils/settingsContext";
import { generateSettings } from "./utils/generateSettings";
import useRoute from "../../router/useRoute.js";
import { generateRoutePath } from "../../router/routes-helpers";
import { markNotificationsRead } from "/imports/utils/UI/markNotificationsRead";

const debug = require("debug")("tenderBid");

const DEFAULT_TAB = "general";

export const TenderifyPage = ({ ...props }) => {
  const { tenderBidId, tenderBid, security } = props;
  //#region tab menu
  const allTabs = initializeTabs({ tenderBid, security });

  const { params, history } = useRoute();
  const { section } = params;
  const initialTab = section || DEFAULT_TAB;
  const [activeTab, setActiveTab] = useState(initialTab);

  const selectTab = useCallback(
    name => {
      history.replace(generateRoutePath("bid", { _id: tenderBidId, section: name || DEFAULT_TAB }));

      setActiveTab(name);
    },
    [tenderBidId]
  );

  const handleTabClick = (e, { name }) => selectTab(name);
  const selectNextTab = () => {
    const idx = (allTabs.indexOf(activeTab) || 0) + 1;
    const nextIdx = idx % allTabs.length;

    selectTab(allTabs[nextIdx]);
  };
  //#endregion

  const allProps = { ...props, activeTab, selectTab, selectNextTab };
  return (
    <>
      <div style={{ overflow: "unset" }}>
        <Menu
          pointing
          secondary
          className="tabs"
          items={allTabs.map(key => ({
            key,
            "data-test": `${key}Tab`,
            name: key,
            content: key, // TODO: translation
            active: key === activeTab
          }))}
          onItemClick={handleTabClick}
        />
        <Container fluid>
          {activeTab === "general" && <GeneralTab {...allProps} />}
          {activeTab === "source" && <SourceTab {...allProps} />}
          {activeTab === "sheet" && <SheetTab {...allProps} />}
          {activeTab === "offer" && <OfferTab {...allProps} />}
          {activeTab === "notes" && <NotesTab {...allProps} />}
          {activeTab === "settings" && <SettingsTab {...allProps} />}
          {activeTab === "discussions" && <DiscussionTab {...allProps} />}
        </Container>
      </div>{" "}
      <Footer {...allProps} />
    </>
  );
};

const TenderifyPageLoader = () => {
  const curLogin = useContext(LoginContext);
  const client = useApolloClient();
  const [lastSave, setLastSave] = useState();
  const {
    params: { _id: tenderBidId },
    goRoute
  } = useRoute();
  debug("tenderBidId", tenderBidId);

  useEffect(() => {
    markNotificationsRead("tenderBid", ["released"], { tenderBidId }, client);
  }, [tenderBidId]);

  const { data: fetchData = {}, loading, error, refetch: refreshData } = useQuery(GET_TENDERBID, {
    variables: { tenderBidId }
  });

  const { data: settingsData = {}, loading: settingsLoading, error: settingsError } = useQuery(
    GET_SETTINGS,
    {
      fetchPolicy: "cache-first"
    }
  );
  if (error) console.error(error);
  debug("settings", { data: settingsData, error: settingsError });
  debug("tenderBid data from apollo", { data: fetchData, loading, error });

  if (loading || settingsLoading) {
    return <Loader loading />;
  }

  const tenderBid = removeEmpty(fetchData.tenderBid || {});

  if (!tenderBid) {
    // redirect if it is not returning priceRequest
    console.error("tenderBid not found!", tenderBidId);
    goRoute("bids-overview");
    return toast.error(`tenderBid ${tenderBidId} not found, or you have no access to see it!`);
  }

  const security = initializeSecurity({ tenderBid, context: curLogin });

  const onSave = async (update, cb = () => {}) => {
    debug("updates: %O", update);
    mutate(
      {
        client,
        query: {
          mutation: UPDATE_TENDER_BID,
          variables: { input: { tenderBidId, update } }
        },
        successMsg: "Changes stored",
        errorMsg: "Could not save updates"
      },
      () => {
        setLastSave(new Date());
        cb();
      }
    );
  };

  return (
    <SettingsProvider value={generateSettings(settingsData.settings || {})}>
      <TenderifyPage
        {...{
          tenderBidId,
          tenderBid,
          security,
          onSave,

          refreshData,
          lastSave
        }}
      />
    </SettingsProvider>
  );
};

export default TenderifyPageLoader;
