import React from "react";
import { string, number } from "prop-types";

const PercentTag = props => {
  const { value, locale = "default", digits = 2 } = props;

  const formatter = new Intl.NumberFormat(locale, {
    maximumSignificantDigits: digits
  });

  const formattedValue = formatter.format(value || 0); /* 2,500.00 */

  return <div>{formattedValue} %</div>;
};

PercentTag.propTypes = {
  digits: number,
  locale: string,
  value: number
};

export default PercentTag;
