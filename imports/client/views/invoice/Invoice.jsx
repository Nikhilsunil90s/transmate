import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";

import PropTypes from "prop-types";
import { Menu, Container } from "semantic-ui-react";

import { tabPropTypes } from "./utils/_tabProptypes";

import { DataTab, GeneralTab, MappingTab, UploadTab, SelectTab } from "./tabs";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import InvoiceFooter from "./components/Footer";

import { GET_INVOICE } from "./utils/queries";
import useRoute from "../../router/useRoute";

const debug = require("debug")("invoice:UI");

const TABS = ["general", "data"]; // hidden: [upload, select, mapping] || analytics
const DEFAULT_TAB = "general";

function prepareData(invoice = {}) {
  return { ...invoice, date: new Date(invoice.date) };
}

export const InvoicePage = ({ loading, ...props }) => {
  const { params, setRouteParams } = useRoute();
  const section = params.section || 0;
  const initialTab = section || DEFAULT_TAB;

  const [activeTab, setActiveTab] = useState(initialTab);

  const onSelectTab = name => {
    setRouteParams({ section: name || DEFAULT_TAB });
    setActiveTab(name);
  };

  const handleTabClick = (e, { name }) => onSelectTab(name);

  const canEdit = true;

  const allProps = { ...props, canEdit, onSelectTab };

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
            content: <Trans i18nKey={`partner.billing.invoice.tabs.${key}`} />,
            active: key === activeTab
          }))}
          onItemClick={handleTabClick}
        />
        {loading ? (
          <Loader loading />
        ) : (
          <Container fluid>
            {activeTab === "general" && <GeneralTab {...allProps} />}
            {activeTab === "data" && <DataTab {...allProps} />}
            {/* hidden tabs */}
            {activeTab === "mapping" && <MappingTab {...allProps} />}
            {activeTab === "upload" && <UploadTab {...allProps} />}
            {activeTab === "select" && <SelectTab {...allProps} />}
          </Container>
        )}
      </div>
      <InvoiceFooter {...props} />
    </>
  );
};

InvoicePage.propTypes = {
  ...tabPropTypes,
  loading: PropTypes.bool
};

// gets the data in a method call:
const InvoiceLoader = () => {
  const { params } = useRoute();
  const invoiceId = params._id;

  const { data = {}, loading: isLoading, error, refetch } = useQuery(GET_INVOICE, {
    variables: { invoiceId }
  });
  if (error) console.error(error);
  debug("query result %o", data);

  const invoice = prepareData(data.invoice);
  const security = {
    canArchive: true,
    canDelete: true,
    canSettle: true
  };

  return <InvoicePage {...{ invoiceId, invoice, security, loading: isLoading, refetch }} />;
};

export default InvoiceLoader;
