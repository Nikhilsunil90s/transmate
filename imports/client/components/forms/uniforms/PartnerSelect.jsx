/* eslint-disable no-use-before-define */
import { useTranslation } from "react-i18next";
import React from "react";
import { useQuery, gql } from "@apollo/client";
import PropTypes from "prop-types";
import { connectField } from "uniforms";
import { SelectField } from "./SelectField";

const debug = require("debug")("partners:ui");

export const GET_PARTNERS = gql`
  query getPartnersSelectField(
    $types: [ACCOUNT_TYPE]
    $includeOwnAccount: Boolean
    $includeInactive: Boolean
    $excludeAccounts: [String]
  ) {
    partners: getPartners(
      types: $types
      includeOwnAccount: $includeOwnAccount
      includeInactive: $includeInactive
      excludeAccounts: $excludeAccounts
    ) {
      id
      name
      type
    }
  }
`;

export const PartnerSelectField = ({ loading, label, partners, ...props }) => {
  const { t } = useTranslation();
  return (
    <SelectField
      {...props}
      label={label || t("form.partner")}
      search
      loading={loading}
      options={partners.map(({ id, name }) => ({ value: id, text: name, description: id }))}
    />
  );
};

export const PartnerSelectFieldLoader = ({ options = {}, setRefData, ...props }) => {
  const { includeOwnAccount, type, types, excludeAccounts, includeInactive = true } = options;
  debug("get data for %o", { includeOwnAccount, type, types, excludeAccounts, includeInactive });
  const { data = {}, loading, error } = useQuery(GET_PARTNERS, {
    variables: {
      includeInactive,
      ...(includeOwnAccount ? { includeOwnAccount } : undefined),
      ...(excludeAccounts ? { excludeAccounts } : undefined),
      ...(types ? { types } : undefined),
      ...(type ? { types: [type] } : undefined)
    }
  });
  debug("partner graphql data %o", { data, loading, error });
  if (error) console.error(error);
  const partners = data.partners || [];

  return <PartnerSelectField {...{ ...props, partners, loading }} />;
};

PartnerSelectFieldLoader.propTypes = {
  setRefData: PropTypes.func,
  options: PropTypes.shape({
    includeOwnAccount: PropTypes.bool,
    includeInactive: PropTypes.bool,
    excludeAccounts: PropTypes.arrayOf(PropTypes.string),
    types: PropTypes.arrayOf(PropTypes.string),
    type: PropTypes.string
  })
};

export default connectField(PartnerSelectFieldLoader);
