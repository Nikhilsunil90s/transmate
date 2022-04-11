import React from "react";
import get from "lodash.get";
import { Form, Dropdown } from "semantic-ui-react";
import { getFieldOptions } from "/imports/api/imports/helpers/getFieldOptions";
import { QuantityUnitSelectionWithLoader } from "/imports/client/views/shipment/sections/items/modals/components/QuantityUnitDropDown";
import { DropdownCountryFlag } from "/imports/client/components/forms/uniforms/DropdownCountryFlag";

const ImportMappingValue = ({ importValue, value, options, onChange }) => {
  return (
    <Form.Field style={{ marginLeft: "60px" }}>
      <label>{importValue}</label>
      <Dropdown
        search
        selection
        options={options}
        value={value}
        lazyLoad
        onChange={(e, { value: newVal }) => onChange(importValue, newVal)}
      />
    </Form.Field>
  );
};

const ImportMappingQuantityUnit = ({ importValue, value, onChange }) => {
  function onChangeHandler({ code }) {
    onChange(importValue, code);
  }
  return (
    <Form.Field style={{ marginLeft: "60px" }}>
      <label>{importValue}</label>
      <QuantityUnitSelectionWithLoader
        value={value}
        onChange={onChangeHandler}
        selection
        includeBaseUOMS
      />
    </Form.Field>
  );
};

const ImportMappingCountry = ({ importValue, value, onChange }) => {
  function onChangeHandler(changedValue) {
    onChange(importValue, changedValue);
  }
  return (
    <DropdownCountryFlag
      style={{ marginLeft: "60px" }}
      label={importValue}
      onChange={onChangeHandler}
      value={value}
    />
  );
};

const ImportMappingValueLoader = props => {
  const { imp, header } = props;
  const field = get(imp, ["mapping", "headers", header]);
  const options = getFieldOptions(field);

  if (typeof options === "string" && options === "quantityUnit")
    return <ImportMappingQuantityUnit {...props} />;

  if (typeof options === "string" && options === "countryCode")
    return <ImportMappingCountry {...props} />;

  return <ImportMappingValue {...props} options={options} />;
};

export default ImportMappingValueLoader;
