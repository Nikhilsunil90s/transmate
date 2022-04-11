import React from "react";
import { string, number, object, node, oneOfType } from "prop-types";

const NumberTag = props => {
  const { value, locale = "default", digits = 2, suffix, prefix, style = {} } = props;

  let formattedValue;
  try {
    const formatter = new Intl.NumberFormat(locale, {
      maximumSignificantDigits: digits
    });
    formattedValue = formatter.format(value || 0); /* 2,500.00 */
  } catch (e) {
    console.error({ numberTagError: value });
    formattedValue = " - ";
  }

  return (
    <span style={style}>
      {prefix && <>{prefix} </>}
      {formattedValue}
      {suffix && <> {suffix}</>}
    </span>
  );
};

NumberTag.propTypes = {
  locale: string,
  value: number,
  digits: number,
  suffix: oneOfType([string, node]),
  prefix: oneOfType([string, node]),
  style: object
};

export default NumberTag;
