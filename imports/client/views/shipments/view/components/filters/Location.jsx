import React from "react";
import { useTranslation } from "react-i18next";

import { Dropdown } from "semantic-ui-react";
import { Address } from "/imports/api/addresses/Address";

const ShipmentsViewFilterLocation = ({ filter, field, onChange }) => {
  const { t } = useTranslation();
  const values = filter.location?.countryCode || [];
  const countryList = Address.countryCodes().map(({ name, code }) => ({
    key: code,
    flag: code.toLowerCase(),
    text: name,
    value: code
  }));
  return (
    <Dropdown
      clearable
      fluid
      multiple
      search
      selection
      scrolling
      value={values}
      options={countryList}
      placeholder={t("shipments.view.filter.type.location.default")}
      onChange={(_, { value: newVals }) => onChange(field, { location: { countryCode: newVals } })}
    />
  );
};

export default ShipmentsViewFilterLocation;
