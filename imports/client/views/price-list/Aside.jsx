/* eslint-disable meteor/no-session */
import React, { useContext, useState } from "react";
import { Session } from "meteor/session";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import { Image, Segment, Header, Dropdown, Form, List, Icon } from "semantic-ui-react";
import capitalize from "lodash.capitalize";

import ExportModal from "./components/ExportModal";

import { GET_PRICELIST_ASIDE } from "./utils/queries";
import useRoute from "../../router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("priceList:aside");

const FormatPaymentTerms = ({ terms }) => {
  if (!terms) return " - ";
  const { condition: k, days } = terms;

  return (
    <>
      {days} <Trans i18nKey={`price.list.form.days.${k}`} />
    </>
  );
};

export const PriceListAside = ({ priceList, priceListId, accountId }) => {
  const [show, showModal] = useState(false);
  const { params } = useRoute();
  const { section } = params;

  const isCustomer = priceList.customerId === accountId;
  const pageFilters = Session.get("price-list::rates::pageFilters");
  const showFilters = section === "rates" && pageFilters?.length > 0;

  const handleFilterChange = ({ value, filter }) => {
    debug("filter", { value, filter });
    Session.set("price-list::rates::activeFilters", []);
  };

  return (
    <Segment basic padded="very">
      {priceList.carrier?.logo && <Image className="partnerLogo" src={priceList.carrier?.logo} />}
      {isCustomer ? (
        <>
          <Header as="h5" content={<Trans i18nKey="price.list.aside.carrier" />} />
          <div>
            {priceList.carrier?.name}
            <a href="{{pathFor 'partner' _id=carrier.id}}" target="blank">
              <Icon name="share square" />
            </a>
          </div>
        </>
      ) : (
        <>
          <Header as="h5" content={<Trans i18nKey="price.list.aside.customer" />} />
          <div>{priceList.customer?.name}</div>
        </>
      )}

      <Header as="h6" content={priceList.title} />
      {showFilters && (
        <>
          <Header as="h5" content={<Trans i18nKey="price.list.aside.selection" />} />
          <Form>
            {pageFilters.map((filter, i) => (
              <Form.Field key={i}>
                <label>{filter.fieldName}</label>
                <Dropdown
                  options={filter.options}
                  value={filter.value}
                  onChange={(_, { value }) => handleFilterChange({ value, filter })}
                />
              </Form.Field>
            ))}
          </Form>
        </>
      )}

      <Header as="h5" dividing content={<Trans i18nKey="price.list.aside.details" />} />
      <List>
        <List.Item
          content={
            <>
              <Trans i18nKey="price.list.aside.category" />
              {": "}
              {capitalize(priceList.category)}
            </>
          }
        />
        <List.Item
          content={
            <>
              <Trans i18nKey="price.list.aside.mode" />
              {": "}
              {capitalize(priceList.mode)}
            </>
          }
        />
        <List.Item
          content={
            <>
              <Trans i18nKey="price.list.aside.type" />
              {": "}
              {capitalize(priceList.type)}
            </>
          }
        />
        <List.Item
          content={
            <>
              <Trans i18nKey="price.list.aside.paymentTerms" />
              {": "}
              <FormatPaymentTerms terms={priceList.terms} />
            </>
          }
        />
      </List>

      <Header as="h5" dividing content={<Trans i18nKey="price.list.aside.actions.title" />} />
      <List selection>
        {showFilters && (
          <List.Item
            icon="download"
            content={<Trans i18nKey="price.list.aside.actions.export" />}
            onClick={() => showModal(true)}
          />
        )}
        {/* <List.Item
          icon="lightning"
          disabled
          content={<Trans i18nKey={"price.list.aside.actions.analyze"} />}
        />
        <List.Item
          icon="comment"
          disabled
          content={<Trans i18nKey={"price.list.aside.actions.contact"} />}
        /> */}
      </List>
      <ExportModal {...{ show, showModal, priceListId, filters: pageFilters }} />
    </Segment>
  );
};

const PriceListAsideLoader = () => {
  const { accountId } = useContext(LoginContext);
  const { params } = useRoute();
  const priceListId = params._id;

  const { data: fetchData = {}, loading, error } = useQuery(GET_PRICELIST_ASIDE, {
    variables: { priceListId },
    fetchPolicy: "cache-only"
  });
  if (error) console.error(error);

  debug("priceList data from apollo", { fetchData, loading, error });

  if (loading) return "Loading ...";

  const priceList = fetchData.priceList || {};

  if (!priceList) return null;

  return <PriceListAside {...{ priceListId, priceList, accountId }} />;
};

export default PriceListAsideLoader;
