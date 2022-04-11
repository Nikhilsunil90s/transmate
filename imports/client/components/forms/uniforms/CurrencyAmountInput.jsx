/* eslint-disable new-cap */
import React, { useMemo, useState } from "react";
import { Input } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";

import { CurrencyDropdown } from "./CurrencySelect";

const debug = require("debug")("pricerequest:quickbid:curencyamountinput");

/** currency amount input
 * @returns {value: Number, unit: String}
 */
const CurrencyAmountInput = ({
  disabled,
  id,
  inputRef,
  label,
  onChange,
  placeholder,
  required,
  error,
  value = {},
  options = {}
}) => {
  const untiedValue = { value: 0, unit: "EUR", ...value };
  const [stateValue, setStateValue] = useState(untiedValue);
  const { value: amount, unit } = stateValue;
  const handleAmount = (e, { value: newAmount }) => {
    setStateValue(pre => {
      const newState = { ...pre, value: parseFloat(newAmount) || "" };
      onChange(newState);

      return newState;
    });
  };
  const handleCurrency = newUnit => {
    setStateValue(pre => {
      debug({ newUnit });
      const newState = { ...pre, unit: newUnit };
      onChange(newState);

      return newState;
    });
  };

  // debug("repaint currencyAmount", options);
  const currencyDropdown = useMemo(
    () =>
      CurrencyDropdown({
        asLabel: true,
        value: unit,
        disabled: options.disableCurrency,
        additionalOptions: options.additionalOptions,
        onChange: handleCurrency
      }),
    [unit]
  );
  return (
    <div className={classNames("field", { required, error })}>
      <label htmlFor={id}>{label}</label>

      <Input
        id={id}
        disabled={disabled}
        ref={inputRef}
        value={amount}
        type="number"
        label={currencyDropdown}
        labelPosition="right"
        placeholder={placeholder}
        onChange={handleAmount}
      />
    </div>
  );
};

export default connectField(CurrencyAmountInput);
