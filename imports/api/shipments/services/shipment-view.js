/* eslint-disable no-use-before-define */
import moment from "moment";
import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import sortBy from "lodash/fp/sortBy";
import get from "lodash.get";
import pick from "lodash.pick";

import { InvoiceItem } from "../../invoices/Invoice-item";
import { Invoice } from "../../invoices/Invoice";
import { Rate } from "../../rates/Rate";
import { Cost } from "../../costs/Cost";
import { ShipmentProject } from "../../shipmentProject/ShipmentProject";

// import { pick } from "../../../utils/functions/fnObjectPick";

const mapI = map.convert({ cap: false });

class ShipmentView {
  constructor({ accountId, userId, shipment = {} }) {
    this.accountId = accountId;
    this.userId = userId;
    this.shipment = shipment;
    this.shipmentId = shipment._id;
  }

  getLinks() {
    this.shipment.links = [];
    [
      {
        key: "shipmentProjectInboundId",
        type: "projectInbound",
        pathBase: "project",
        pathParams: { section: "inbound" }
      },
      {
        key: "shipmentProjectOutboundId",
        type: "projectOutbound",
        pathBase: "project",
        pathParams: { section: "outbound" }
      },
      {
        key: "priceRequestId",
        type: "priceRequest",
        pathBase: "priceRequestEdit",
        pathParams: { section: "data" }
      }
    ].forEach(({ key, type, pathBase }) => {
      const id = this.shipment[key];
      const project = ShipmentProject.first(id, {
        fields: { title: 1, type: 1 }
      });

      if (id) {
        this.shipment.links.push({
          id,
          type,
          pathBase,
          data: pick(project, ["title", "type"])
        });
      }
    });
    return this;
  }

  getItems() {
    this.shipment.items = [];
    return this;
  }

  /**
   * shipments can have multiple invoices
   * - look up all invoice items
   * - get invoice header
   * - define currencies
   * - define exchange dates [can also be available in invoice cost items]
   * */
  getInvoices() {
    const items = InvoiceItem.where({ shipmentId: this.shipmentId });
    const invoiceIds = items.map(({ invoiceId }) => invoiceId);
    const invoiceHeader = Invoice.where(
      { _id: { $in: invoiceIds }, deleted: false },
      { fields: { number: 1, amount: 1, sellerId: 1 } }
    );

    this.invoices = invoiceHeader.map(invoice => {
      const { costs = [] } =
        items.find(({ invoiceId }) => invoiceId === invoice._id) || {};
      return {
        ...invoice,
        costs
      };
    });
    this.hasInvoices = this.invoices.length > 0;

    return this;
  }

  // TODO [#247]: cost description mapping & get the official cost description if missing
  getCosts() {
    const invoiceCurrencies = (this.invoices || []).map(inv =>
      get(inv, "amount.currency")
    );
    const shipmentCurrencies = (this.shipment.costs || []).map(cost =>
      get(cost, "amount.currency")
    );

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

    const currencyDateShipment = moment(this.shipment.getExchangeDate()).format(
      "YYYY-MM-DD"
    );

    // todo : apply conversion is async now!
    const shipmentCosts = flow(
      mapI((cost, orgIndex) => ({ ...cost, orgIndex })),
      map(cost => applyConversion(cost, baseCurrency, currencyDateShipment)),
      map(setCostLabel),
      sortBy(cost => -get(cost, ["amount", "value"])),
      sortBy(cost => cost.source.charCodeAt() * -1)
    )(this.shipment.costs || []);

    const totalShipmentCosts = calculateSubtotal({ costs: shipmentCosts });

    this.invoices = this.invoices.map(invoice => {
      const costs = flow(
        mapI((cost, orgIndex) => ({ ...cost, orgIndex })),
        map(cost => prepInvoiceItem(cost, baseCurrency)),
        map(setCostLabel),
        sortBy(cost => -get(cost, "amount.value")),
        sortBy(cost => cost.source.charCodeAt() * -1)
      )(invoice.costs || []);

      const subtotal = calculateSubtotal({ costs });

      return {
        baseCurrency: this.baseCurrency,
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        sellerId: invoice.sellerId,
        invoiceCurrency: get(invoice, "amount.currency") || "EUR",
        invoiceDate: moment(invoice.date).format("YYYY-MM-DD"),
        subtotal,
        costs
      };
    });

    const totalInvoiceCosts = this.invoices.reduce((memo, invoice) => {
      return memo + invoice.subtotal;
    }, 0);

    const totalInvoiceDelta = totalShipmentCosts - totalInvoiceCosts;

    this.costs = {
      baseCurrency,
      calculated: shipmentCosts,
      invoices: this.invoices,
      totalShipmentCosts,
      totalInvoiceCosts,
      totalInvoiceDelta
    };

    return this;
  }

  get() {
    return this;
  }
}

export { ShipmentView };

function currencyCheck(currencies = []) {
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  const unique = currencies.filter(onlyUnique);
  return { isMixed: unique > 1, currency: unique[0], all: unique };
}

/**
 *
 * @param {Object} cost (shipment) cost item
 * @param {String} baseCurrency ["EUR","USD",...]
 * @param {Date} currencyDate
 */
function applyConversion(cost, baseCurrency, currencyDate) {
  let { amount } = cost;
  let warning;
  const { currency, value } = amount || {};

  if (currency !== baseCurrency) {
    const date = get(cost, ["amount", "currencyDate"])
      ? moment(get(cost, ["amount", "currencyDate"])).format("YYYY-MM-DD")
      : currencyDate;
    const rate = Rate.first({ date });

    if (rate) {
      amount = {
        ...cost.amount,
        convertedQty: rate.convert(value, currency, baseCurrency)
      };
    } else {
      amount = {
        ...cost.amount,
        convertedQty: 0
      };
      warning = "no Conversion";
    }
  }

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

export function calculateSubtotal({ costs }) {
  return costs.reduce((memo, cost) => {
    if (cost.source === "input" && get(cost, "response.approved") === false) {
      return memo;
    }
    const val =
      get(cost, ["amount", "convertedQty"]) || get(cost, ["amount", "value"]);
    return memo + val;
  }, 0);
}
