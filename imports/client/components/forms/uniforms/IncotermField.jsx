import React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { connectField } from "uniforms";
import { Icon, Dropdown } from "semantic-ui-react";

import {
  incoterm2020,
  incotermExtra
} from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_units.js";

const IncotermField = ({
  className,
  required,
  error,
  label,
  id,
  disabled,
  value = "",
  onChange
}) => {
  const { t } = useTranslation();
  const handleSelection = (e, { value: incoterm }) => {
    onChange(incoterm);
  };

  return (
    <div className={classNames("field", className, { required, error })}>
      {label && <label htmlFor={id}>{label}</label>}
      <Dropdown
        id={id}
        disabled={disabled}
        error={error}
        value={value}
        placeholder={t("form.select")}
        text={value}
        className="selection"
        clearable
      >
        <Dropdown.Menu>
          <Dropdown.Header icon="anchor" content={t("price.list.form.incoterm")} />

          {incoterm2020.map((key, i) => (
            <Dropdown.Item
              key={i}
              {...{
                value: key,
                text: key,
                content: (
                  <>
                    <b>{key}</b>{" "}
                    <span style={{ opacity: 0.5 }}>{t(`price.list.form.incoterms.${key}`)}</span>
                  </>
                )
              }}
              onClick={handleSelection}
            />
          ))}

          <Dropdown.Divider />
          <Dropdown.Header
            icon={
              <Icon.Group>
                <Icon name="anchor" />
                <Icon corner="top right" name="add" />
              </Icon.Group>
            }
            content={t("price.list.form.incoterm_extra")}
          />

          {incotermExtra.map((key, i) => (
            <Dropdown.Item
              key={i}
              {...{
                value: key,
                text: key,
                content: (
                  <>
                    <b>{key}</b>{" "}
                    <span style={{ opacity: 0.5 }}>{t(`price.list.form.incoterms.${key}`)}</span>
                  </>
                )
              }}
              onClick={handleSelection}
            />
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default connectField(IncotermField);
