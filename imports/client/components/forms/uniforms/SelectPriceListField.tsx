// @ts-nocheck FIXME
import React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import {
  SelectField,
  SelectFieldProps
} from "/imports/client/components/forms/uniforms/SelectField";
import { connectField } from "uniforms";

const debug = require("debug")("pricelist:dropdown");

export interface QueryType {
  type?: string;
  carrierId?: string;
  status?: string;
}

// eslint-disable-next-line no-undef
type SelectPriceListFieldType = Pick<
  SelectFieldProps,
  "disabled" | "string" | "className" | "label" | "required"
> & {
  name?: string;
  value?: string;
  query?: QueryType;
  onChange: (priceListId: string) => void;
};

export const GET_OWN_PRICELISTS_QUERY = gql`
  query getOwnPriceListsSelectPriceList($input: GetPriceListsInput!) {
    priceLists: getOwnPriceLists(input: $input) {
      id
      title
      carrierName
      type
      status
    }
  }
`;

export const SelectPriceListField = ({
  disabled,
  label,
  required,
  className,
  value,
  query = {},
  onChange
}: SelectPriceListFieldType) => {
  const { data = {}, loading, error } = useQuery(GET_OWN_PRICELISTS_QUERY, {
    variables: { input: { type: "contract", ...query } },
    fetchPolicy: "no-cache"
  });
  debug("data in select pricelist %o", data);
  if (error) {
    console.error(`>>>>>>> error`, error);
    return null;
  }

  const priceListOptions = (data.priceLists || []).map(
    ({ id, carrierName, title }) => ({
      key: id,
      value: id,
      text: (
        <>
          {title}
          <span style={{ opacity: "0.5", marginLeft: ".5em" }}>
            {carrierName}
          </span>
        </>
      )
    })
  );

  return (
    <SelectField
      label={label}
      required={required}
      className={className}
      loading={loading}
      disabled={disabled}
      value={value}
      onChange={priceListId => {
        onChange(priceListId);
      }}
      options={priceListOptions}
    />
  );
};

export default connectField(SelectPriceListField);
