import get from "lodash.get";
import { InvoiceItem } from "/imports/api/invoices/Invoice-item";
import { Shipment } from "/imports/api/shipments/Shipment";

// purpose: sets the currency exchange rate in the shipment equal to the one that we received in the invoice
// either the date is stored at invoiceDetails> costParams.currencyDate ; either the costItem itself

export const resetCurrencyExchangeRates = ({ accountId, userId }) => ({
  accountId,
  userId,
  async reset({ invoiceId, shipmentIds }) {
    const cursor = await InvoiceItem.find({
      deleted: false,
      invoiceId,
      ...(shipmentIds
        ? {
            shipmentId: {
              $in: shipmentIds
            }
          }
        : {})
    });

    for await (const invoiceItem of cursor) {
      if (!invoiceItem.shipmentId) return;

      const shipment = await Shipment.first(invoiceItem.shipmentId, {
        fields: { costParams: 1, pickup: 1, created: 1 }
      });

      // look for a date (! for now: we take the first date we can find and use that as ref)
      // TODO [#141]: if there are costs in the shipment that are mapped to a certain invoice then the exchange rates need to apply
      if (!shipment) {
        return;
      }
      const itemsfltr = (invoiceItem.costs || []).find(
        costItem => costItem.amount.currencyDate != null
      );
      const invRefDate =
        get(invoiceItem, ["costParams", "currencyDate"]) ||
        (itemsfltr && itemsfltr.amount.currencyDate);

      if (invRefDate) {
        shipment.update_async({
          "costParams.currencyDate": invRefDate
        });
        if (!get(invoiceItem, ["costParams", "currencyDate"])) {
          // invoice has no date set... take the one of the shipment! & store this
          invoiceItem.update_async({
            "costParams.currencyDate": invRefDate
          });
        }
      } else {
        const currencyDate = await shipment.getExchangeDate();
        invoiceItem.update_async({
          "costParams.currencyDate": currencyDate
        });
      }
    }
  }
});
