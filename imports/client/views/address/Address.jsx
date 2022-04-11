import { toast } from "react-toastify";
import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";

import { useTranslation } from "react-i18next";
import { Container, Menu } from "semantic-ui-react";

import { NotesTab, InfoTab, ProfileTab } from "./tabs";
import Footer from "./components/Footer";

import { GET_ADDRESS_WITH_ANNOTATION, ANNOTATE_ADDRESS } from "./utils/queries";
import { initializeSecurity } from "./utils/security";
import LoginContext from "../../context/loginContext";
import useRoute from "../../router/useRoute";

const TABS = ["info", "profile", "notes"];
const DEFAULT_TAB = "info";

const debug = require("debug")("address:UI");

const AddressPage = ({ ...props }) => {
  const { t } = useTranslation();
  const { security = {} } = props;
  const { params, setRouteParams } = useRoute();
  //#region tab menu
  const section = params.section || 0;
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
          items={TABS.map(key => ({
            key,
            name: key,
            content: t(`address.form.tabs.${key}`),
            active: key === activeTab
          }))}
          onItemClick={handleTabClick}
        />
        <Container fluid>
          {activeTab === "info" && <InfoTab {...allProps} />}
          {activeTab === "profile" && <ProfileTab {...allProps} />}
          {activeTab === "notes" && <NotesTab {...allProps} />}
        </Container>
      </div>

      <Footer {...{ security }} />
    </>
  );
};

const AddressPageLoader = () => {
  const { params } = useRoute();
  const addressId = params._id;
  const context = useContext(LoginContext);
  const [annotateAddress] = useMutation(ANNOTATE_ADDRESS);
  const { data = {}, loading, error, refetch } = useQuery(GET_ADDRESS_WITH_ANNOTATION, {
    variables: { addressId }
  });
  if (error) console.error(error);

  debug("data from apollo", { data, loading, error });

  if (loading) {
    return "loading";
  }

  const { address } = data;
  const security = initializeSecurity({ address, context });
  const onSave = (updates, cb) => {
    debug("saving annotation %o", { updates });
    annotateAddress({
      variables: { input: { addressId, updates } },
      onError(err) {
        debug("error while annotating address %o", err);
        toast.error("Could not annotate address");
      },
      onCompleted() {
        toast.success("Changes stored");
        if (typeof cb === "function") cb();
      }
    });
  };
  debug("address security", { security });

  return <AddressPage {...{ addressId, address, security, onSave, refetch }} />;
};

export default AddressPageLoader;
