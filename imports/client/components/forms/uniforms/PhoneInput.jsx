import React from "react";
import classNames from "classnames";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/semantic-ui.css";

import { connectField } from "uniforms";

/** https://www.npmjs.com/package/react-phone-input-2 */
const PhoneField = ({
  onlyCountries,
  enableSearch,
  disabled,
  id,
  inputRef,
  label,
  onChange,
  placeholder,
  required,
  value,
  error
}) => {
  return (
    <div className={classNames("field", { required, error })}>
      <label htmlFor={id}>{label}</label>
      <PhoneInput
        id={id}
        disableCountryCode={false}
        disabled={disabled}
        ref={inputRef}
        required={required}
        onlyCountries={onlyCountries}
        enableSearch={enableSearch}
        value={value}
        label={label}
        placeholder={placeholder}
        onChange={changedValue => {
          onChange(changedValue);
        }}
      />
    </div>
  );
};

export default connectField(PhoneField);
