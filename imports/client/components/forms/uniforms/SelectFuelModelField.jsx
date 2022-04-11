import React from "react";
import { useQuery, gql } from "@apollo/client";
import SelectField from "./SelectField";

export const GET_MY_FUEL_INDEXES = gql`
  query getFuelIndexesForDropdown {
    fuelIndexes: getFuelIndexes {
      id
      name
    }
  }
`;

const SelectFuelModelField = props => {
  // get fuel data
  const { data = {}, loading, error } = useQuery(GET_MY_FUEL_INDEXES);
  if (error) console.error(error);

  const fuelOptions = (data.fuelIndexes || []).map(({ id, name }) => ({ value: id, text: name }));

  return <SelectField {...props} loading={loading} options={fuelOptions} />;
};

SelectFuelModelField.propTypes = {};

export default SelectFuelModelField;
