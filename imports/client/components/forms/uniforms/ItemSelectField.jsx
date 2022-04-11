import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Input, Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";
import { useQuery, gql } from "@apollo/client";
import get from "lodash.get";

import { DEFAULT_UNITS, ITEM_TYPE_ICONS } from "/imports/api/_jsonSchemas/enums/shipmentItems";
import { basePropTypes } from "./utils/propTypes";

const debug = require("debug")("shipment:items");

/** @returns {{amount: Number, code: String}} */

//#region components
export const GET_SETTINGS_DATA = gql`
  query getAccountSettingsItemSelectField {
    accountSettings: getAccountSettings {
      id
      itemUnits {
        type
        name
        description
        code
        unitType
        taxKeys
        isPackingUnit
        dimensions {
          length
          width
          height
          uom
        }
      }
    }
  }
`;

const ItemSelectField = ({
  disabled,
  id,
  inputRef,
  error,
  optionData = DEFAULT_UNITS,
  options, // filter options
  onChange, // uniforms method
  onSelectUnit,
  value = "",
  className,
  required,
  label
}) => {
  const { t } = useTranslation();
  const [opts, setOpts] = useState(optionData);
  const [state, setState] = useState(value);
  const handlingUnits = opts.filter(
    ({ type, isPackingUnit }) => type === "HU" && (options?.onlyPackingUnits ? isPackingUnit : true)
  );

  const handleSearch = e => {
    const searchQuery = e.target.value.toLowerCase();
    if (searchQuery === "") {
      setOpts(optionData);
    } else {
      const filteredOptions = opts.filter(
        o =>
          o.description?.toLowerCase().includes(searchQuery) ||
          o.code.toLowerCase().includes(searchQuery)
      );
      setOpts(filteredOptions);
    }
  };
  const handleSelection = (e, { value: code }) => {
    onChange(code);
    setState(code);
    debug("selectedValue %o", code);

    if (typeof onSelectUnit === "function") {
      const itemInfo = handlingUnits.find(({ code: iCode }) => iCode === code);
      onSelectUnit(itemInfo);
    }
  };

  return (
    <div className={classNames("field", className, { required, error })}>
      {label && <label htmlFor={id}>{label}</label>}
      <Dropdown
        id={id}
        disabled={disabled}
        error={error}
        ref={inputRef}
        value={state}
        placeholder={t("shipment.form.item.quantity")}
        text={value}
        className="selection"
      >
        <Dropdown.Menu>
          <Input
            icon="search"
            iconPosition="left"
            className="search"
            onClick={e => e.stopPropagation()} // prevents the dropdown from closing when clicking input
            onChange={handleSearch}
          />
          <Dropdown.Divider />
          <Dropdown.Header
            icon={ITEM_TYPE_ICONS.HU}
            content={t("shipment.form.item.quantityType.HU")}
          />
          <Dropdown.Menu scrolling>
            {handlingUnits.map((option, i) => (
              <Dropdown.Item
                key={i}
                value={option.code}
                text={option.description}
                onClick={handleSelection}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

//#endregion

const ItemSelectLoader = ({ ...props }) => {
  const { options } = props;

  // :fetch items by gql
  const { data, loading, error } = useQuery(GET_SETTINGS_DATA, {
    fetchPolicy: "no-cache"
  });

  if (error) {
    console.error("error itemUnits", error);
  }
  const optionsRaw = get(data, ["accountSettings", "itemUnits"]);
  const unitOptions = !!optionsRaw ? optionsRaw : undefined;

  debug("quantity type options", options, unitOptions);
  if (loading) return <Dropdown loading className="selection" value="" />;
  return <ItemSelectField {...props} loading={loading} optionData={unitOptions} />;
};

ItemSelectLoader.propTypes = {
  ...basePropTypes,
  options: PropTypes.shape({
    types: PropTypes.arrayOf(PropTypes.oneOf(["HU", "TU"])),
    onlyPackingUnits: PropTypes.bool
  }),
  onSelectUnit: PropTypes.func
};

export default connectField(ItemSelectLoader);
