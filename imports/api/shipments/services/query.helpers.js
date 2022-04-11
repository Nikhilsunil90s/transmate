import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import sortBy from "lodash/fp/sortBy";
import get from "lodash.get";
import moment from "moment";

import { ExchangeRate } from "/imports/utils/functions/recalculateCosts.js";

import { Cost } from "../../costs/Cost";
import { Shipment } from "../Shipment";

const debug = require("debug")("shipment:query:helper");

//#region costCalculation functions
const mapI = map.convert({ cap: false });

function currencyCheck(currencies = []) {
  const unique = [...new Set(currencies)].length;
  debug("currencycheck currencies %o, unique %o", currencies, unique);
  return { isMixed: unique > 1, currency: unique[0], all: unique };
}

/**
 *
 * @param {Object} cost (shipment) cost item
 * @param {String} baseCurrency ["EUR","USD",...]
 * @param {Function} rateConversion obj
 */
function applyConversion(cost, baseCurrency, rateConversion) {
  let { amount } = cost;
  let warning;
  const { currency, value } = amount || {};

  if (currency !== baseCurrency) {
    if (rateConversion) {
      amount = {
        ...cost.amount,
        convertedQty: rateConversion.convert(value, currency, baseCurrency)
      };
    } else {
      amount = {
        ...cost.amount,
        convertedQty: 0
      };
      warning = "no Conversion";
    }
  }
  debug("applyConversion %o, amount %o, warning? %o", cost, amount, warning);
  return {
    ...cost,
    amount,
    warning
  };
}

// invoice has either rate stored as rate or as date.
// if no date and need to convert -> take shipment rate date
function prepInvoiceItem(cost, baseCurrency) {
  let { amount } = cost || {};
  const { currency, value } = amount;

  if (currency !== baseCurrency) {
    // invoice has either rate stored as rate or as date.
    // if no date and need to convert -> take shipment rate date
    amount = {
      ...amount,
      convertedQty: value / (amount.rate || 1)
    };
  }
  return {
    ...cost,
    amount,
    source: "invoice",
    isInvoice: true
  };
}

function setCostLabel(cost) {
  return {
    ...cost,
    description: cost.description || Cost.first(cost.costId).cost
  };
}

//#endregion

export function calculateSubtotal({ costs }) {
  debug("calculateSubtotal %o", costs);
  return costs.reduce((memo, cost) => {
    if (cost.source === "input" && get(cost, "response.approved") === false) {
      return memo;
    }
    const val = get(cost, "amount.convertedQty") || get(cost, "amount.value");
    return memo + val;
  }, 0);
}

export const calculateShipmentAndInvoiceTotal = ({
  invoices = [],
  shipment
}) => ({
  invoices,
  shipment: Shipment.init(shipment),
  async get() {
    const invoiceCurrencies = this.invoices.map(inv =>
      get(inv, "amount.currency")
    );
    const shipmentCurrencies = (this.shipment.costs || []).map(cost =>
      get(cost, "amount.currency")
    );
    debug("currencies %o, %o ", shipmentCurrencies, invoiceCurrencies);
    this.invoiceCurrencies = currencyCheck(invoiceCurrencies);
    this.shipmentCurrencies = currencyCheck(shipmentCurrencies);

    // if invoice isMixed -> userDefault ?
    // if invoice !ismixed -> invoiceCurrency is leading
    // if !invoice -> shipment isMixed? -> userDefault?
    // if !invoice -> shipment !isMixed? -> currency
    let baseCurrency = "EUR"; // or userDefault?
    if (this.hasInvoice && !this.invoiceCurrencies.isMixed) {
      baseCurrency = this.invoiceCurrencies.currency;
    } else if (!this.shipmentCurrencies.isMixed) {
      baseCurrency = this.shipmentCurrencies.currency;
    }

    const currencyDateShipment = await this.shipment.getExchangeDate();
    debug("use currencyDateShipment %o", currencyDateShipment);
    const exchangeRate = await new ExchangeRate().useExchangeDate(
      currencyDateShipment
    );

    const shipmentCosts = flow(
      mapI((cost, orgIndex) => ({ ...cost, orgIndex })),
      map(cost => applyConversion(cost, baseCurrency || "EUR", exchangeRate)),
      map(setCostLabel),
      sortBy(cost => -get(cost, ["amount", "value"])),
      sortBy(cost => cost.source.charCodeAt() * -1)
    )(this.shipment.costs || []);

    const totalShipmentCosts = calculateSubtotal({ costs: shipmentCosts });
    debug("totalShipmentCosts %o", totalShipmentCosts);
    this.invoices = this.invoices.map(invoice => {
      const costs = flow(
        mapI((cost, orgIndex) => ({ ...cost, orgIndex })),
        map(cost => prepInvoiceItem(cost, baseCurrency)),
        map(setCostLabel),
        sortBy(cost => -get(cost, "amount.value")),
        sortBy(cost => cost.source.charCodeAt() * -1)
      )(invoice.items || []);

      const subtotal = calculateSubtotal({ costs });
      debug("subtotal %o", subtotal);
      return {
        baseCurrency: this.baseCurrency,
        invoiceId: invoice.id,
        number: invoice.number,
        sellerId: invoice.sellerId,
        invoiceCurrency: get(invoice, "amount.currency") || "EUR",
        invoiceDate: moment(invoice.date).format("YYYY-MM-DD"),
        subtotal,
        costItems: costs
      };
    });

    const totalInvoiceCosts = this.invoices.reduce((memo, invoice) => {
      return memo + invoice.subtotal;
    }, 0);

    const totalInvoiceDelta = totalShipmentCosts - totalInvoiceCosts;
    debug("result :%o", {
      baseCurrency,
      calculated: shipmentCosts,
      invoices: this.invoices,
      totalShipmentCosts,
      totalInvoiceCosts,
      totalInvoiceDelta
    });
    return {
      baseCurrency,
      calculated: shipmentCosts,
      invoices: this.invoices,
      totalShipmentCosts,
      totalInvoiceCosts,
      totalInvoiceDelta
    };
  }
});
