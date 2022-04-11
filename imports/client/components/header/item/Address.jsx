import React from "react";
import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { Loader } from "semantic-ui-react";
import gql from "graphql-tag";
import ItemHeader from "../ItemHeader.jsx";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("header");

const ADDRESS_QUERY = gql`
  query getAddressHeader($addressId: String!) {
    address: getAddress(addressId: $addressId) {
      id
      name
    }
  }
`;

const AddressHeader = () => {
  const { t } = useTranslation();
  const {
    params: { _id: addressId }
  } = useRoute();

  const { data = {}, loading, error } = useQuery(ADDRESS_QUERY, {
    variables: { addressId }
  });

  debug("header query %o", { data, loading, error });

  const address = data.address || {};

  return (
    <ItemHeader>
      {loading ? (
        <Loader active inline size="tiny" />
      ) : (
        <div className="main">
          <div>
            {t("address.header.title")} <b>{address.name}</b>
          </div>
        </div>
      )}
    </ItemHeader>
  );
};

export default AddressHeader;
