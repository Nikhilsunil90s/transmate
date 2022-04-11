import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Dropdown } from "semantic-ui-react";
import { connectField } from "uniforms";
import classNames from "classnames";
import { SelectCheckboxes } from "/imports/client/components/forms/uniforms/SelectCheckboxes";

const debug = require("debug")("component:priceListSelect");

export const GET_MY_PRICELISTS = gql`
  query getOwnPriceListsDropdownSelect($input: GetPriceListsInput!) {
    priceLists: getOwnPriceLists(input: $input) {
      id
      title
      carrierId
      carrierName
      type
      status
    }
  }
`;

export const DropdownSelectPriceListsField = ({
  value = [],
  className,
  required,
  error,
  label,
  id: fieldId,
  onChange
}) => {
  const [selectedPriceListIds, setSelected] = useState(value);
  const { data: priceListdata = {}, loading, error: apolloError } = useQuery(GET_MY_PRICELISTS, {
    variables: { input: { type: "contract" } }
  });
  if (apolloError) console.error(apolloError);
  debug("priceList data from apollo", { priceListdata, loading, error: apolloError });

  const priceListOptions = (priceListdata.priceLists || []).map(({ id, title, carrierName }) => ({
    id,
    label: (
      <>
        {title} <span style={{ opacity: 0.5 }}>{carrierName}</span>
      </>
    )
  }));

  const onChangeSelection = selectedIds => {
    setSelected(selectedIds);
    onChange(selectedIds);
  };

  return (
    <div className={classNames("field", className, { required, error })}>
      {label && <label htmlFor={fieldId}>{label}</label>}
      {loading ? (
        <Dropdown text={label} icon="filter" labeled button loading disabled className="icon" />
      ) : (
        <SelectCheckboxes
          label={label}
          options={priceListOptions}
          value={selectedPriceListIds}
          onChange={onChangeSelection}
        />
      )}
    </div>
  );
};

export default connectField(DropdownSelectPriceListsField);
