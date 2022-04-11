import { toast } from "react-toastify";
import React, { useState, useCallback, useEffect, useContext } from "react";
import LoginContext from "/imports/client/context/loginContext";
import dot from "dot-object";
import pick from "lodash.pick";
import { Trans } from "react-i18next";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { Container, Menu } from "semantic-ui-react";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import Footer from "./components/Footer.jsx";
import {
  DashboardTab,
  IntroductionTab,
  NDATab,
  RequirementsTab,
  PartnersTab,
  ScopeTab,
  ScopeDataTab,
  ProfileTab,
  AnalyticsTab
} from "./tabs";
import {
  GET_TENDER,
  UPDATE_TENDER,
  SAVE_TENDER_DETAILS,
  SAVE_BIDDER_TIMESTAMP,
  UPDATE_BID
} from "./utils/queries";
import { initializeSecurity } from "./utils/security";
import { initializeTabs } from "./utils/initializeTabs";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";
import { mutate } from "/imports/utils/UI/mutate";
import useRoute from "../../router/useRoute.js";
import { generateRoutePath } from "../../router/routes-helpers";
import { markNotificationsRead } from "/imports/utils/UI/markNotificationsRead";

const debug = require("debug")("tender");

const DEFAULT_TAB = "introduction";

export const TenderPage = ({ ...props }) => {
  const { tenderId } = props;
  const [saveBidderTimestamp] = useMutation(SAVE_BIDDER_TIMESTAMP);
  const { tender, security } = props;
  const { params, history } = useRoute();
  //#region tab menu
  const allTabs = initializeTabs({ tender, security });

  const { section } = params;
  const initialTab = section || DEFAULT_TAB;
  const [activeTab, setActiveTab] = useState(initialTab);

  const selectTab = useCallback(
    name => {
      history.replace(generateRoutePath("tender", { _id: tenderId, section: name || DEFAULT_TAB }));

      setActiveTab(name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tenderId]
  );

  const handleTabClick = (e, { name }) => selectTab(name);
  //#endregion

  const allProps = { ...props, selectTab };

  // sets the timestamp for the bidder:
  useEffect(() => {
    if (security.isBidder) {
      saveBidderTimestamp({ variables: { tenderId: tender.id } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            content: <Trans i18nKey={`tender.tabs.${key}`} />,
            active: key === activeTab
          }))}
          onItemClick={handleTabClick}
        />
        <Container fluid>
          {activeTab === "dashboard" && <DashboardTab {...allProps} />}
          {activeTab === "introduction" && <IntroductionTab {...allProps} />}
          {activeTab === "NDA" && <NDATab {...allProps} />}
          {activeTab === "requirements" && <RequirementsTab {...allProps} />}
          {activeTab === "partners" && <PartnersTab {...allProps} />}
          {activeTab === "scope" && <ScopeTab {...allProps} />}
          {activeTab === "data" && <ScopeDataTab {...allProps} />}
          {activeTab === "profile" && <ProfileTab {...allProps} />}
          {activeTab === "analytics" && <AnalyticsTab {...allProps} />}
        </Container>
      </div>
      <Footer {...allProps} />
    </>
  );
};

const TenderPageLoader = () => {
  const curLogin = useContext(LoginContext);
  const client = useApolloClient();
  const [lastSave, setLastSave] = useState();
  const { goRoute, params } = useRoute();
  const tenderId = params._id;

  useEffect(() => {
    markNotificationsRead("tender", ["released"], { tenderId }, client);
  }, [tenderId]);

  const [saveTenderDetails] = useMutation(SAVE_TENDER_DETAILS);
  const { data: fetchData = {}, loading, error, refetch: refreshData } = useQuery(GET_TENDER, {
    variables: { tenderId }
  });
  if (error) console.error(error);

  debug("tender data from apollo", { data: fetchData, loading, error });

  if (loading) {
    return <Loader loading />;
  }

  const tender = removeEmpty(fetchData.tender || {});

  if (!tender) {
    // redirect if it is not returning priceRequest
    console.error("Tender not found!", tenderId);
    goRoute("tenders");
    return toast.error(`Tender ${tenderId} not found, or you have no access to see it!`);
  }

  const security = initializeSecurity({ tender, context: curLogin });

  const onSave = async (update, cb = () => {}) => {
    debug("updates: %O", update);
    mutate(
      {
        client,
        query: {
          mutation: UPDATE_TENDER,
          variables: { input: { tenderId, update } }
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

  const onSaveDetails = async (changes = [], cb) => {
    const updates = changes.map(({ rowData, update }) => {
      const updateD = dot.object(update);
      return {
        item: {
          ...pick(
            rowData,
            "laneId",
            "volumeGroupId",
            "volumeRangeId",
            "goodsDG",
            "equipmentId",
            "name"
          ),
          tenderId: tender.id
        },
        update: updateD.quantity
      };
    });

    const {
      data: { saveTenderDetails: response },
      loading: mutationLoading,
      error: mutationError
    } = await saveTenderDetails({ variables: { input: updates } });

    debug("save detail: %o", { updates, response, mutationLoading, mutationError });

    if (mutationError) {
      toast.error(mutationError.reason);
      console.error("submitted error", mutationError);
      return null;
    }
    if (cb) return cb();
    toast.info("Changes stored...");
    return setLastSave(new Date());
  };

  const onSaveBid = async (topic, update) => {
    debug("update bid: %o", update);
    try {
      const { errors } = await client.mutate({
        mutation: UPDATE_BID,
        variables: { input: { tenderId, topic, update } }
      });
      if (errors) throw errors;
      toast.success("Bid saved");
      setLastSave(new Date());
    } catch (error) {
      console.error({ error });
      toast.error("Failed to save bid");
    }
  };

  return (
    <TenderPage
      {...{ tenderId, tender, security, onSave, onSaveDetails, onSaveBid, refreshData, lastSave }}
    />
  );
};

// TODO -> map the attached documents in bidder array to get meta: {type,  name }, url()

export default TenderPageLoader;
