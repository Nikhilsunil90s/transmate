import { Random } from "/imports/utils/functions/random.js";
import { Shipment } from "/imports/api/shipments/Shipment";
import SecurityChecks from "/imports/utils/security/_security";
import get from "lodash.get";
import { shipmentAggregation } from "./query.pipelineBuilder";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";
import { invoiceService } from "/imports/api/invoices/services/invoiceServices";
import { BASE_COSTID } from "/imports/api/_jsonSchemas/enums/costs";
import { ExchangeRate } from "/imports/utils/functions/recalculateCosts.js";

const debug = require("debug")("shipment:resolvers:costs");

const shipmentFields = {
  accountId: 1,
  carrierIds: 1,
  shipperId: 1,
  costs: 1,
  created: 1,
  status: 1,
  costParams: 1
};

export const editShipmentCosts = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },

  async init({ shipmentId, index, invoiceCostIndex, cost }) {
    this.shipmentId = shipmentId;
    this.index = index;
    this.invoiceCostIndex = invoiceCostIndex;
    this.cost = cost;

    this.shipment = await Shipment.first(shipmentId, {
      fields: shipmentFields
    });
    this.exchangeDate = get(this.shipment, "costParams.currencyDate", null);
    SecurityChecks.checkIfExists(this.shipment);

    this.security = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { userId, accountId }
    );
    await this.security.getUserRoles();

    return this;
  },

  checkIndex() {
    if (typeof this.index !== "number")
      throw Error("editShipmentCosts index has not been set!");
  },

  async remove() {
    debug("removing costItem %s", this.index);
    this.checkIndex();
    const { costs = [] } = this.shipment;
    this.security
      .can({
        action: "removeManualCost",
        data: { cost: costs[this.index] }
      })
      .throw();

    costs.splice(this.index, 1);
    await Shipment._collection.update(
      { _id: this.shipmentId },
      { $set: { costs } }
    );
    await this.shipment.addUpdate(
      "costs",
      { index: this.index, event: "remove" },
      this.context
    );
    return true;
  },
  async update() {
    debug("updating costItem %s", this.index);
    this.checkIndex();
    const { costs = [] } = this.shipment;
    this.security
      .can({
        action: "updateManualCost",
        data: { cost: costs[this.index] }
      })
      .throw();

    await this.shipment.addUpdate(
      "costs",
      { index: this.index, event: "update" },
      this.context
    );

    await Shipment._collection.update(
      { _id: this.shipmentId },
      {
        $set: {
          [`costs.${this.index}.amount`]: this.cost.amount,
          [`costs.${this.index}.description`]: this.cost.description
        }
      }
    );
    return true;
  },
  async add() {
    debug("adding costItem");
    this.security.can({ action: "addManualCost" }).throw();
    const exchange = new ExchangeRate();

    // if rate is not set we will set it now
    if (
      this.cost.amount &&
      this.cost.amount.currency &&
      !this.cost.amount.rate
    ) {
      const exchangeRate = await (this.exchangeDate
        ? exchange.useExchangeDate(this.exchangeDate)
        : exchange.useLatestExchangeRate());
      this.cost.amount.rate = exchangeRate.convert(
        1,
        this.cost.amount.currency,
        "EUR"
      );
    }
    const addApprovalFlag = true; // todo make this variable
    const newCost = {
      source: "input", // can be overwritten (e.g. source = 'invoice')
      ...this.cost,
      added: {
        by: this.userId,
        at: new Date()
      },
      accountId: this.accountId,
      id: Random.id(6).toUpperCase(),
      isManualBaseCost: false,
      ...(addApprovalFlag ? { forApproval: true } : undefined) // if i can also approve -> this is not needed; TODO
    };

    if (this.cost.type === "base") {
      // adding a base cost
      this.security
        .can({
          action: "addBaseCost"
        })
        .throw();
      newCost.costId = BASE_COSTID;
      newCost.isManualBaseCost = true;
    }
    if (this.cost.source === "invoice") {
      // adding an invoice cost
      this.security
        .can({
          action: "addCostFromInvoice",
          data: { cost: { ...this.cost, isInvoice: true } }
        })
        .throw();
      const { invoiceId } = this.cost;
      check(invoiceId, String); // is required
      check(this.invoiceCostIndex, Number); // is required

      invoiceService()
        .init({ invoiceId })
        .invoiceCostAddedToShipment({
          shipmentId: this.shipmentId,
          index: this.invoiceCostIndex
        });
    }

    delete newCost.type;
    debug("add cost %o", newCost);
    await this.shipment.push({ costs: newCost });
    await this.shipment.addUpdate("costs", { event: "add" }, this.context);

    // set flags:
    if (newCost.accountId !== this.shipment.shipperId) {
      await this.shipment.reload();
      await this.shipment.updateFlags("approve-costs");
    }
    return true;
  },
  async delegateAction() {
    if (!this.cost && this.index > -1) await this.remove();
    if (this.cost && this.index > -1) await this.update();
    if (this.cost && !(this.index > -1)) await this.add();

    await this.shipment.reload();
    await this.shipment.updateFlags(["approve-costs"]);
    return this;
  },

  async fetchReturnData() {
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });
    await srv.getUserEntities();
    srv.matchId({ shipmentId: this.shipmentId });
    srv.match({
      options: { noAccountFilter: true },
      fieldsProjection: {
        accountId: 1,
        status: 1,
        carrierIds: 1,
        costs: 1, // costs
        costParams: 1, // costs
        created: 1 // costs
      }
    });

    // .getCostDescriptions();

    const res = await srv.fetchDirect();
    debug("aggregation fetchReturnData result %o", res);
    debug("aggregation fetchReturnData costs %o", (res || {}).costs);

    return res[0] || {};
  }
});
