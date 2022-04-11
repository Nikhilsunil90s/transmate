import PropTypes from "prop-types";
import { currencyFormat } from "/imports/utils/UI/helpers";
import get from "lodash.get";

const DEFAULT_CURRENCY = "EUR";

export const totalCostSum = (costs = []) =>
  costs.reduce((acc, cur) => {
    const convertedValue =
      get(cur, ["amount", "value"], 0) *
      (get(cur, ["amount", "rate"]) || cur.calculatedExchange || 1);

    return convertedValue + acc;
  }, 0);

// takes costs array that has calculatedExchange.
const TotalCostTag = ({ costs = [], currency = DEFAULT_CURRENCY }) => {
  const totalCost = totalCostSum(costs);

  return currencyFormat(totalCost, currency);
};

TotalCostTag.propTypes = {
  costs: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.shape({
        currency: PropTypes.string,
        value: PropTypes.number,
        rate: PropTypes.number
      }),
      calculatedExchange: PropTypes.number
    })
  ),
  currency: PropTypes.string
};

export default TotalCostTag;
