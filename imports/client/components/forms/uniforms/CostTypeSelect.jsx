/* eslint-disable no-use-before-define */
import React from "react";
import groupBy from "lodash.groupby";
import { Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";
import { useQuery, gql } from "@apollo/client";

export const GET_COST_TYPES = gql`
  query getCostTypes($includeDummy: Boolean) {
    costs: getCostTypes(includeDummy: $includeDummy) {
      id
      type
      group
      cost
      isDummy
    }
  }
`;

let key = 0;
export const prepareData = (data = []) => {
  const options = [];
  Object.entries(groupBy(data, "type")).forEach(([lvl1, v1]) => {
    key += 1;

    // type:
    options.push({ key, text: lvl1, disabled: true });
    Object.entries(groupBy(v1, "group")).forEach(([lvl2, v2 = []]) => {
      key += 1;

      // group:
      options.push({
        key,
        text: lvl2,
        content: (
          <span style={{ opacity: 0.8 }}>
            {"\u00a0".repeat(2)} <i>{lvl2}</i>
          </span>
        ),
        disabled: true
      });
      v2.forEach(({ id, cost }) => {
        // cost item:
        options.push({
          key: id,
          value: id,
          text: cost,
          content: (
            <span>
              {"\u00a0".repeat(4)} {cost}
            </span>
          )
        });
      });
    });
  });

  return options;
};

export const CostTypeSelect = ({
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
  options = []
}) => {
  return (
    <div className={classNames("field", { required, error })}>
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

export const CostTypeSelectLoader = ({ ...props }) => {
  const { data = {}, loading, error } = useQuery(GET_COST_TYPES, {
    variables: { includeDummy: true },
    fetchPolicy: "cache-first"
  });

  if (error) console.error(error);

  const options = prepareData(data.costs);

  return <CostTypeSelect loading={loading} options={options} {...props} />;
};

export default connectField(CostTypeSelectLoader);
