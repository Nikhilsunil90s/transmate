import { toast } from "react-toastify";
import React, { useState, useCallback, useContext, useEffect } from "react";
import { Trans } from "react-i18next";
import { useQuery, useApolloClient } from "@apollo/client";
import { Container, Menu } from "semantic-ui-react";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import Footer from "./components/Footer.jsx";
import { ProfileTab, NotesTab, ReviewTab, BillingTab } from "./tabs";
import { GET_PARTNER, UPDATE_PARTNER } from "./utils/queries";
import { initializeSecurity } from "./utils/security";
import { initializeTabs } from "./utils/initializeTabs";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";
import LoginContext from "../../context/loginContext";
import useRoute from "../../router/useRoute.js";
import { generateRoutePath, goRoute } from "../../router/routes-helpers";
import { markNotificationsRead } from "/imports/utils/UI/markNotificationsRead";

const debug = require("debug")("tender");

const DEFAULT_TAB = "profile";

export const PartnerPage = ({ ...props }) => {
  const { params, history } = useRoute();
  const { partner, partnerId, security } = props;
  //#region tab menu
  const allTabs = initializeTabs({ partner, security });

  const { section } = params;
  const initialTab = section || DEFAULT_TAB;
  const [activeTab, setActiveTab] = useState(initialTab);

  const selectTab = useCallback(
    name => {
      history.replace(
        generateRoutePath("partner", { _id: partnerId, section: name || DEFAULT_TAB })
      );

      setActiveTab(name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partnerId]
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
            "data-test": `${key}Tab`,
            name: key,
            content: <Trans i18nKey={`partner.tabs.${key}`} />,
            active: key === activeTab
          }))}
          onItemClick={handleTabClick}
        />
        <Container fluid>
          {activeTab === "profile" && <ProfileTab {...allProps} />}
          {activeTab === "notes" && <NotesTab {...allProps} />}
          {activeTab === "billing" && <BillingTab {...allProps} />}
          {activeTab === "review" && <ReviewTab {...allProps} />}
        </Container>
      </div>
      <Footer {...allProps} />
    </>
  );
};

const PartnerPageLoader = () => {
  const { params } = useRoute();
  const context = useContext(LoginContext);
  const client = useApolloClient();
  const partnerId = params._id;

  useEffect(() => {
    markNotificationsRead(
      "partnership",
      ["accepted", "rejected"],
      { accountId: partnerId },
      client
    );
    markNotificationsRead("partnership", ["requested"], { requestedBy: partnerId }, client);
  }, [partnerId]);

  const { data: fetchData = {}, loading, error, refetch } = useQuery(GET_PARTNER, {
    variables: { partnerId }
  });
  if (error) console.error(error);

  debug("partner data from apollo", { fetchData, loading, error });

  if (loading) {
    return <Loader loading />;
  }

  const partner = removeEmpty(fetchData.partner || {});

  if (!partner) {
    // redirect if it is not returning priceRequest
    console.error("Partner not found!", partnerId);
    goRoute("partners");
    return toast.error(`Partner ${partnerId} not found`);
  }

  const security = initializeSecurity({ partner, context });

  const onSave = async ({ update, root }, cb) => {
    debug("update partner: %o", { update, root });

    client
      .mutate({ mutation: UPDATE_PARTNER, variables: { input: { partnerId, update, root } } })
      .then(res => {
        debug("updated res", res);
        toast.success("Changes stored");
        refetch();
        if (cb) cb();
      })
      .catch(error => {
        console.error(error);
        toast.error(error);
      });
  };

  return <PartnerPage {...{ partnerId, partner, security, onSave, refetch }} />;
};

export default PartnerPageLoader;
