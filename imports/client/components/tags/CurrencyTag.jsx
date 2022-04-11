import React from "react";
import { string, number } from "prop-types";

const DEFAULT_CURRENCY = "EUR";

export const currencyFormatter = ({ locale = "default", currency, options = {} }) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || DEFAULT_CURRENCY,
    ...options
  });

const CurrencyTag = props => {
  const { value, currency, locale, prefix } = props;

  const formatter = currencyFormatter({ locale, currency });

  let formattedValue = formatter.format(value || 0); /* $2,500.00 */

  if (prefix) {
    formattedValue = `${prefix} ${formattedValue}`;
  }

  return <span>{formattedValue}</span>;
};

CurrencyTag.propTypes = {
  currency: string,
  locale: string,
  value: number,
  prefix: string
};

export default CurrencyTag;
