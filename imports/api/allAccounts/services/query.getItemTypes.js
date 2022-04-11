import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";
import { DEFAULT_UNITS } from "/imports/api/_jsonSchemas/enums/shipmentItems";
import { UOMS } from "/imports/api/_jsonSchemas/enums/units";

export const getItemTypes = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ includeBaseUOMS }) {
    const settings = await AllAccountsSettings.first(this.accountId, {
      fields: { itemUnits: 1 }
    });

    let options = settings?.itemUnits || DEFAULT_UNITS;

    if (includeBaseUOMS) {
      options = [
        ...options,
        ...UOMS.map(uom => ({
          type: "UOM",
          description: uom,
          code: uom,
          itemType: "container"
        }))
      ];
    }
    return options;
  }
});
