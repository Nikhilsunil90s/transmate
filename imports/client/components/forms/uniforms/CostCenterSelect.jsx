/* eslint-disable no-use-before-define */
import React from "react";
import { Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";
import { useQuery, gql } from "@apollo/client";

export const GET_COST_CENTERS = gql`
  query getAccountSettingsCostCenters {
    accountSettings: getAccountSettings {
      id
      costCenters {
        id
        label
      }
    }
  }
`;

export const prepareData = data => {
  return (data || []).map(({ id, label }, idx) => ({
    key: `costCenterItem-${idx}`,
    value: id,
    text: label,
    content: (
      <>
        {id}
        <span style={{ opacity: 0.8 }}>
          {" - "}
          {label}
        </span>
      </>
    )
  }));
};

export const CostCenterSelect = ({
  disabled,
  id,
  inputRef,
  loading,
  label,
  onChange,
  placeholder,
  required,
  error,
  value,
  className,
  options = []
}) => {
  return (
    <div className={classNames("field", { required, error }, className)}>
      <label htmlFor={id}>{label}</label>

      <Dropdown
        id={id}
        disabled={disabled}
        ref={inputRef}
        required={required}
        loading={loading}
        fluid
        search
        selection
        label={label}
        value={value}
        options={options}
        placeholder={placeholder}
        onChange={(_, { value: changedValue }) => {
          onChange(changedValue);
        }}
      />
    </div>
  );
};

export const CostCenterSelectLoader = ({ ...props }) => {
  const { data = {}, loading, error } = useQuery(GET_COST_CENTERS, {
    fetchPolicy: "network-only"

    // nextFetchPolicy: "cache-first"
  });

  if (error) console.error(error);
  const options = prepareData(data.accountSettings?.costCenters);

  return <CostCenterSelect loading={loading} options={options} {...props} />;
};

export default connectField(CostCenterSelectLoader);
