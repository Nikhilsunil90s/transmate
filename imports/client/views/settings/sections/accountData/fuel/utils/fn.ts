import moment from "moment";
import { FuelPeriod } from "../fuel.d";

function getPeriodData(
  m: number,
  y: number,
  periods: FuelPeriod[]
  // eslint-disable-next-line no-undef
): Partial<FuelPeriod> {
  return periods.find(({ month, year }) => month === m && year === y) || {};
}

/**
 * purpose: show last three dates... when clicking expand, we show x more and so on...
 * latest on top
 * note: month is zero indexed!!!
 */
export const buildPeriods = (
  periodData: FuelPeriod[],

  /** year, month, day*/
  start: [number, number, number],
  count: number = 5
): FuelPeriod[] => {
  const iterator = moment(start);
  let i = 0;
  const results: FuelPeriod[] = [];
  while (!(i >= count)) {
    iterator.subtract(1, "month");
    i += 1;

    const month = iterator.month() + 1;
    const year = iterator.year();
    const { fuel, index } = getPeriodData(month, year, periodData);
    results.push({ month, year, fuel, index });
  }
  return results;
};
