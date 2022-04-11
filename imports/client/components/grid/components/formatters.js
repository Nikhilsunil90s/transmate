export const numberFormatter = ({ value }) => {
  let formattedValue;
  try {
    const formatter = new Intl.NumberFormat("default", {
      roundingType: "fractionDigits",
      maximumFractionDigits: 2
    });
    formattedValue = formatter.format(value || 0); /* 2,500.00 */
  } catch (e) {
    formattedValue = " - ";
  }

  return formattedValue;
};
