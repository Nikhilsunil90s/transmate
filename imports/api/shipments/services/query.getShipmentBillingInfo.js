import { Shipment } from "/imports/api/shipments/Shipment.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { shipmentAggregation } from "./query.pipelineBuilder";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";

const FIELDS = { accountId: 1, status: 1, costParams: 1, shipperId: 1 };

export const getShipmentBillingInfo = ({ userId, accountId }) => ({
  userId,
  accountId,
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, FIELDS);

    return this;
  },
  async runChecks() {
    const check = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { accountId: this.accountId, userId: this.userId }
    );
    await check.getUserRoles();
    check.can({ action: "editBilling" }).throw();

    const features = await AllAccounts.getFeatures(accountId);
    if (!features.includes("shipmentBilling"))
      throw new Error("Account is not set up for billing");
    return this;
  },
  async get() {
    // billing currency
    // fetch current total cost
    // fetch billing items
    // { totalFreight:0, billingItems: [{}]}

    let currency = this.shipment.billing?.currency;
    if (!currency) {
      // TODO: get billing currency from partner > annotation > billing currency
      currency = "EUR";
    }

    const srv = shipmentAggregation({ accountId, userId });
    await srv.getUserEntities();
    srv
      .matchId({ shipmentId: this.shipmentId })
      .match({
        fieldsProjection: {
          accountId: 1,
          status: 1,
          carrierIds: 1,
          costs: 1, // costs
          costParams: 1, // costs
          created: 1 // costs
        }
      })
      .getCostExchangeRates({ currency })
      .calculateTotalCosts();

    const data = (await srv.fetchDirect())[0];

    return {
      id: this.shipmentId,
      totals: data.totals,
      billing: {
        currency: "EUR",
        items: [
          {
            description: "Administration fee",
            amount: 50,
            invoiceId: null
          },
          {
            description: "Freight",
            amount: 50,
            isFreight: false,
            invoiceId: "invoiceId1"
          },
          {
            description: "Freight",
            amount: 50,
            isFreight: false,
            invoiceId: "invoiceId1"
          }
        ]
      }
    };
  }
});
