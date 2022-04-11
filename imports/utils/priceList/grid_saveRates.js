import { chunk } from "lodash";
import { toast } from "react-toastify";
import { SAVE_PRICELIST_RATE_GRID } from "/imports/client/views/price-list/utils/queries";

const debug = require("debug")("price-list:grid");

// this context should pass in client
export async function saveRates({ priceListId, updates }, callback) {
  debug("saving rates %o", { priceListId, updates });
  if (!(updates.length > 0))
    return toast.error("No updates found to store in the database");
  if (!this.client) return console.error("no client");

  try {
    let cellUpdated = false;
    let headerUpdated = false;
    const cellUpdate = { nMatched: 0, nModified: 0, nUpserted: 0, nRemoved: 0 };
    const headerUpdate = {
      nMatched: 0,
      nModified: 0,
      nUpserted: 0,
      nRemoved: 0
    };
    const promises = chunk(updates, 30).map(async updatesChunk => {
      const { data, errors } = await this.client.mutate({
        mutation: SAVE_PRICELIST_RATE_GRID,
        variables: { priceListId, updates: updatesChunk }
      });
      if (errors) throw errors;
      debug("save ok", data);

      const { cellUpdate: cell, headerUpdate: header } =
        data.updatePriceListRatesGrid?.results || {};
      if (cell) {
        cellUpdated = true;
        cellUpdate.nMatched += cell.nMatched;
        cellUpdate.nModified += cell.nModified;
        cellUpdate.nRemoved += cell.nRemoved;
        cellUpdate.nUpserted += cell.nUpserted;
      }
      if (header) {
        headerUpdated = true;
        headerUpdate.nMatched += header.nMatched;
        headerUpdate.nModified += header.nModified;
        headerUpdate.nRemoved += header.nRemoved;
        headerUpdate.nUpserted += header.nUpserted;
      }
    });

    await Promise.all(promises);

    if (typeof callback === "function") callback();
    if (cellUpdated)
      toast.info(
        `
          Matched: ${cellUpdate.nMatched}, 
          Modified: ${cellUpdate.nModified}, 
          New: ${cellUpdate.nUpserted}, 
          
          Removed: ${cellUpdate.nRemoved}
        `
      );
    if (headerUpdated)
      toast.info(`
      After updating header: 
      Matched: ${headerUpdate.nMatched}, 
      Modified: ${headerUpdate.nModified}, 
      New: ${headerUpdate.nUpserted}, 
      
      Removed: ${headerUpdate.nRemoved}
  `);
  } catch (error) {
    console.error({ error });
    toast.error("Could not save rate");
  }
  return null;
}
