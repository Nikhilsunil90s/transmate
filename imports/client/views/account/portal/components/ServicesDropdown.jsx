import React, { useState } from "react";
import classNames from "classnames";
import { Dropdown, Icon } from "semantic-ui-react";
import { connectField } from "uniforms";
import { startCase } from "../utils/helpers";
import { LabelsTag } from "/imports/client/components/tags";

import { SERVICE_CATEGORIES } from "../utils/serviceOptions";

const serviceOptions = Object.entries(SERVICE_CATEGORIES).reduce((acc, [k, v]) => {
  const categoryText = v.translations.EN || k;
  const srv = [
    ...acc,
    {
      value: k,
      text: categoryText,
      disabled: true,
      content: <b>{categoryText}</b>
    },
    ...v.services.map(key => ({
      cat: k,
      value: `${k}.${key}`,
      text: `${startCase(key)} (${categoryText})`,
      content: (
        <>
          <Icon name="chevron right" />
          {startCase(key)}
        </>
      )
    }))
  ];
  return srv;
}, []);

function getServiceOptionsWithCustom(value) {
  const srvOptKeys = serviceOptions.map(({ value: v }) => v);
  const toAdd = (value || []).filter(k => !srvOptKeys.includes(k));
  if (toAdd) {
    return [
      ...serviceOptions,
      {
        value: "other",
        text: "Other",
        disabled: true,
        content: <b>Other</b>
      },
      ...toAdd.map(key => ({
        cat: "other",
        value: key,
        text: startCase(key),
        content: (
          <>
            <Icon name="chevron right" />
            {startCase(key)}
          </>
        )
      }))
    ];
  }
  return serviceOptions;
}

export const ServicesDropdown = ({
  disabled,
  className,
  label,
  id,
  inputRef,
  error,
  required,
  onChange,
  value
}) => {
  const [state, setState] = useState(value || []);
  const [options, setOptions] = useState(getServiceOptionsWithCustom(value || []));

  function afterChange(e, { value: newVal }) {
    setState(newVal);
    onChange(newVal);
  }

  function onAddItem(e, { value: newVal }) {
    setState([...state, newVal]);
    setOptions([...options, { key: newVal, value: newVal, text: `${startCase(newVal)} (Other)` }]);
  }
  return disabled ? (
    <LabelsTag value={value} emptyMsg="No services set" />
  ) : (
    <div className={classNames("field", className, { required, error })}>
      {label && <label htmlFor={id}>{label}</label>}
      <Dropdown
        id={id}
        error={error}
        ref={inputRef}
        text="Select services ..."
        search
        selection
        multiple
        fluid
        allowAdditions
        options={options}
        onChange={afterChange}
        onAddItem={onAddItem}
        value={state}
      />
    </div>
  );
};

export default connectField(ServicesDropdown);
