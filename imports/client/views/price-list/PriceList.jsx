import React, { useState, useCallback, useMemo, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { useQuery, useApolloClient } from "@apollo/client";
import { Container, Menu } from "semantic-ui-react";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import Footer from "./components/Footer.jsx";
import {
  EquipmentTab,
  FuelTab,
  GeneralTab,
  LaneTab,
  LeadTimeTab,
  NoteTab,
  RateTab,
  RateListTab,
  VolumeTab,
  ConversionsTab
} from "./tabs";

import { GET_PRICELIST, SAVE_PRICE_LIST } from "./utils/queries";
import { initializeSecurity } from "./utils/security";
import { initializeTabs } from "./utils/initializeTabs";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";
import useRoute from "../../router/useRoute.js";
import LoginContext from "/imports/client/context/loginContext";
import { generateRoutePath } from "../../router/routes-helpers";
import { markNotificationsRead } from "/imports/utils/UI/markNotificationsRead";

const debug = require("debug")("priceList:main");

export const PriceListPage = ({ redirect, ...props }) => {
  const { priceList, security } = props;
  const priceListId = priceList.id;
  const { params, history } = useRoute();

  debug("data: %o", { priceList, security });

  //#region tab menu
  const allTabs = initializeTabs({ priceList });
  const section = useMemo(() => params.section, []);
  const initialTab = section || allTabs[0];
  const [activeTab, setActiveTab] = useState(initialTab);

  const selectTab = useCallback(
    name => {
      const url = generateRoutePath("priceList", { _id: priceListId, section: name || allTabs[0] });
      history.replace(url);

      setActiveTab(name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [priceListId]
  );

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
            "data-test": `${key.replace(" ", ".")}Tab`,
            name: key,
            content: <Trans i18nKey={`price.list.tab.${key.replace(" ", ".")}`} />,
            active: key === activeTab
          }))}
          onItemClick={handleTabClick}
        />
        <Container fluid>
          {activeTab === "general" && <GeneralTab {...allProps} />}
          {activeTab === "fuel" && <FuelTab {...allProps} />}
          {activeTab === "lanes" && <LaneTab {...allProps} />}
          {activeTab === "equipments" && <EquipmentTab {...allProps} />}
          {activeTab === "leadTimes" && <LeadTimeTab {...allProps} />}
          {activeTab === "notes" && <NoteTab {...allProps} />}
          {activeTab === "rates" && <RateTab {...allProps} />}
          {activeTab === "ratesAdditional" && <RateListTab {...allProps} />}
          {activeTab === "volumes" && <VolumeTab {...allProps} />}
          {activeTab === "conversions" && <ConversionsTab {...allProps} />}
        </Container>
      </div>
      <Footer {...allProps} {...{ redirect }} />
    </>
  );
};

const PriceListLoader = () => {
  const { accountId, userId } = useContext(LoginContext);
  const client = useApolloClient();
  const { queryParams, params, goRoutePath } = useRoute();
  const priceListId = params._id;
  const redirect = useMemo(() => queryParams.redirect, []);

  useEffect(() => {
    markNotificationsRead("price-list", [], { priceListId }, client);
  }, [priceListId]);

  const { data: fetchData = {}, loading, error, refetch } = useQuery(GET_PRICELIST, {
    variables: { priceListId }
  });
  if (error) console.error(error);

  debug("priceList data from apollo", { fetchData, loading, error });

  if (loading) {
    return <Loader loading text="Loading priceList" />;
  }

  const priceList = removeEmpty(fetchData.priceList || {}, true);

  if (!priceList.id) {
    // redirect if it is not returning priceRequest
    console.error("PriceList not found!", priceListId);
    goRoutePath("/404");
    return toast.error(`PriceList ${priceListId} not found, or you have no access to see it!`);
  }

  const security = initializeSecurity({ priceList }, { accountId, userId });

  const onSave = async (updates, cb) => {
    debug("updates: %o", updates);
    try {
      const { data = {}, errors } = await client.mutate({
        mutation: SAVE_PRICE_LIST,
        variables: {
          input: {
            priceListId,
            updates
          }
        }
      });
      if (errors) throw errors;
      if (cb) cb();
      debug("result after update %o", data);
      toast.success("Changes stored");
    } catch (error) {
      console.error({ error });
      toast.error("Could not save update");
    }
  };

  return <PriceListPage {...{ priceListId, priceList, security, onSave, refetch, redirect }} />;
};

// TODO -> map the attached documents in bidder array to get meta: {type,  name }, url()

export default PriceListLoader;
