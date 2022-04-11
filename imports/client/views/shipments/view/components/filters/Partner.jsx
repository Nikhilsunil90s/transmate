import React from "react";
import { useQuery, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";

import { Dropdown } from "semantic-ui-react";

const debug = require("debug")("shipment:view");

const GET_PARTNERS = gql`
  query getPartnersForShipmentsViewFilterField(
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

const ShipmentsViewFilterPartner = ({ ...props }) => {
  const { t } = useTranslation();
  const { filter, field, onChange } = props;
  const { values = [] } = filter;

  const { data = {}, loading, errors } = useQuery(GET_PARTNERS, {
    variables: { includeOwnAccount: false }
  });
  debug("partner selection %o", { data, loading, errors });
  const partners = data.partners || [];
  return (
    <Dropdown
      basic
      scrolling
      search
      multiple
      selection
      loading={loading}
      options={partners.map(({ id, name }) => ({ value: id, text: name, description: id }))}
      value={values}
      placeholder={t("shipments.view.filter.type.partner.default")}
      onChange={(_, { value: newVals }) => onChange(field, { values: newVals })}
    />
  );
};

export default ShipmentsViewFilterPartner;
