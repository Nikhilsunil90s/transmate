import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Dropdown, Icon, Input } from "semantic-ui-react";

import {
  ShipmentsViewFilterPeriod,
  ShipmentsViewFilterPartner,
  ShipmentsViewFilterInput,
  ShipmentsViewFilterFixed,
  ShipmentsViewFilterLocation,
  ShipmentsViewFilterFixedLoader
} from "./filters";
import { getFilterOptions } from "./filterFields";

const Fields = {
  period: ShipmentsViewFilterPeriod,
  location: ShipmentsViewFilterLocation,
  partner: ShipmentsViewFilterPartner,
  input: ShipmentsViewFilterInput,
  fixed: ShipmentsViewFilterFixed
};

const ICON_MAP = {
  fixed: "checkmark box",
  fixedLoader: "checkmark box",
  location: "dot circle outline",
  partner: "shipping",
  period: "clock",
  flag: "flag",
  input: "pencil alternate"
};

const ICON_DEFAULT = "pencil alternate";
const ICON_NEW = "ellipsis horizontal";

// dynamically sets the component:
const Component = ({ type, ...props }) => {
  if (typeof Fields[type] !== "undefined") {
    if (type === "fixed" && !!props.query) {
      return React.createElement(ShipmentsViewFilterFixedLoader, { ...props });
    }
    return React.createElement(Fields[type], { ...props });
  }
  return React.createElement(() => <div />);
};

const ShipmentsViewFilterField = ({ field, filter, onChange, removeFilter }) => {
  const { t } = useTranslation();
  const allFields = getFilterOptions(t);
  const fieldData = allFields.find(({ name }) => name === field);
  const props = {
    ...fieldData, // returns label, allowedValues
    field, // name of the field
    filter, // selected filters for the field
    onChange
  };

  // users can filter the typeslist:
  const [typeList, setTypes] = useState(allFields);
  const types = [...new Set(typeList.map(({ type }) => type))];
  function getFieldList(curType) {
    return allFields.filter(({ type }) => type === curType);
  }
  function filterFieldOptions(str) {
    const filteredList = allFields.filter(({ label }) =>
      label.toLowerCase().includes(str.toLowerCase())
    );
    setTypes(filteredList);
  }

  return (
    <div className="filter-input">
      {field ? (
        <div className="ui dropdown labeled icon button disabled name">
          <Icon name={ICON_MAP[fieldData.type] || ICON_DEFAULT} />
          <span>{fieldData.label}</span>
        </div>
      ) : (
        <Dropdown
          labeled
          className="icon name"
          icon={ICON_NEW}
          button
          text={t("shipments.view.filter.choose")}
        >
          <Dropdown.Menu>
            <Input
              icon="search"
              iconPosition="left"
              className="search"
              placeholder={t("shipments.view.filter.search")}
              onClick={e => e.stopPropagation()}
              onChange={(e, { value }) => filterFieldOptions(value)}
            />
            <Dropdown.Divider />
            <Dropdown.Menu scrolling>
              {types.map(type => (
                <React.Fragment key={type}>
                  <Dropdown.Header
                    icon={ICON_MAP[type] || ICON_DEFAULT}
                    content={t(`shipments.view.filter.group.${type}`)}
                  />
                  <Dropdown.Divider />
                  {getFieldList(type).map(({ name, label, defaultValue }) => (
                    <Dropdown.Item
                      key={name}
                      content={label}
                      onClick={() => onChange(name, defaultValue ?? {})}
                    />
                  ))}
                </React.Fragment>
              ))}
            </Dropdown.Menu>
          </Dropdown.Menu>
        </Dropdown>
      )}

      {field && (
        <>
          <Component {...props} />
          <Button floated="right" icon="remove" onClick={() => removeFilter(field)} />
        </>
      )}
    </div>
  );
};

export default ShipmentsViewFilterField;
