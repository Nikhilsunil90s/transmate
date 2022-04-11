import React from "react";
import get from "lodash.get";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";
import { useQuery } from "@apollo/client";

const debug = require("debug")("shipment:view:loader");

/** multiple select */
const ShipmentsViewFilterFixed = ({
  options,
  allowedValues = [],
  field,
  filter,
  onChange,
  loading
}) => {
  const { t } = useTranslation();
  const optionList =
    options ||
    allowedValues.map(val => ({
      key: val,
      value: val,
      text: val
    }));
  const { values = [] } = filter;

  return (
    <Dropdown
      clearable
      basic
      fluid
      multiple
      search
      selection
      scrolling
      loading={loading}
      value={values}
      options={optionList}
      placeholder={t("shipments.view.filter.type.fixed.default")}
      onChange={(_, { value: newVals }) => onChange(field, { values: newVals })}
    />
  );
};

export const ShipmentsViewFilterFixedLoader = ({
  query,
  queryKey,
  transformOptions = () => {},
  ...props
}) => {
  const { data: queryData = {}, loading, error } = useQuery(query);
  if (error) console.error(error);
  const dbData = (queryKey ? get(queryData, ["data", queryKey]) : queryData.data) || [];

  debug("fixed filter with data loader", dbData);
  const options = dbData.map(transformOptions);

  return <ShipmentsViewFilterFixed {...props} options={options} loading={loading} />;
};

ShipmentsViewFilterFixedLoader.propTypes = {
  query: PropTypes.object,
  transformOptions: PropTypes.func,
  field: PropTypes.string,
  filter: PropTypes.shape({
    values: PropTypes.arrayOf(PropTypes.string)
  }),
  onChange: PropTypes.func
};

export default ShipmentsViewFilterFixed;
