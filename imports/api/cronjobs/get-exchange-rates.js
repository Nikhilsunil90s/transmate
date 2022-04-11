import { Rate } from "/imports/api/rates/Rate";
import { getRateForDate } from "/imports/api/rates/openexchange-rates.js";
import { addCron } from "./cron";

const debug = require("debug")("synced-cron:get-exchange-rates");

/**
 * cron job that:
 *
 *  checks if rates are there and gets them if not
 * creates "expiring" notification for the owner
 */
// date array
function getDateArray(start, end) {
  const arr = [];
  const dt = new Date(start);

  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
}
export async function getMissingRateDates(days = 365) {
  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const dateArray = getDateArray(start, new Date()).map(date =>
    date.toISOString().slice(0, 10)
  );
  debug("get db entries for %o ", dateArray.length);
  const datesInDb = await Rate.where(
    {
      date: {
        $in: dateArray
      }
    },
    {
      fields: {
        date: 1
      }
    }
  );
  debug("exchange rates in db : %o", datesInDb.length);

  // return dates that were not found in db
  return (dateArray || []).filter(
    checkDate => !(datesInDb || []).find(el => el.date === checkDate)
  );
}

export async function fixMissingRates(days = 365, log = []) {
  log.push("get dates");
  const datesWithoutRates = await getMissingRateDates(days);
  log.push(`dates without rates:${datesWithoutRates.join(",")}`);
  if (datesWithoutRates.length > 0) {
    log.push("get rates for dates without rates");
    const rates = await Promise.all(
      datesWithoutRates.map(date => {
        return getRateForDate(date);
      })
    );
    log.push(`insert rates:${rates.length}`);
    const ratesWithData = rates.filter(el => el.rates && el.date);
    debug("rates with date %o", ratesWithData.length);
    if (ratesWithData.length > 0) {
      await Promise.all(
        ratesWithData.map(rate => Rate._collection.insert(rate))
      );
      log.push("inserts done");
    } else {
      log.push("no data in result!");
    }
  } else {
    log.push("no dates to get data for!");
  }
  return log;
}

addCron({
  name: "Get new Exchange Rates",
  logging: true,

  // schedule: "1 hour", // don't use 60 minutes , minutes only <60
  interval: 60 * 60,
  async job(cronLog = []) {
    // async is not working here only meteor fibers!

    try {
      cronLog.push("start");
      await fixMissingRates(365, cronLog);
      return { result: "done.." };
    } catch (error) {
      return { error: error.message };
    }
  }
});
