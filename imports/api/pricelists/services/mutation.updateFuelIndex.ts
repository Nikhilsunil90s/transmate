/* eslint-disable no-undef */
import {
  CheckPriceListSecurity,
  dbFields
} from "/imports/utils/security/checkUserPermissionsForPriceList";
import { PriceList } from "/imports/api/pricelists/PriceList";
import { fnContext } from "../../_interfaces/context";
import { FuelModel } from "../../fuel/FuelIndexModel.d";
import { FuelIndex } from "../../fuel/FuelIndex";
import { PriceListModel } from "../PriceListModel.d";

interface UpdateFuelIndex {
  context: fnContext;
  priceListId?: string;
  fuelIndexId?: string;

  init: (a: { priceListId: string }) => Promise<UpdateFuelIndex>;
  runChecks: () => UpdateFuelIndex;
  update: (a: { fuelIndexId: string }) => Promise<UpdateFuelIndex>;
  getUIResponse: () => Promise<{
    priceList: Partial<PriceListModel>;
    fuel: Partial<FuelModel>;
  }>;
}

export const updateFuelIndex = ({
  accountId,
  userId
}: fnContext): UpdateFuelIndex => ({
  context: { accountId, userId },
  async init({ priceListId }) {
    this.priceListId = priceListId;
    this.priceList = await PriceList.first(
      { _id: priceListId },
      { fields: dbFields }
    );

    return this;
  },
  runChecks() {
    new CheckPriceListSecurity(
      { priceList: this.priceList },
      { userId: this.context.userId, accountId: this.context.accountId }
    )
      .can({ action: "canAddFuelModel" })
      .throw();
    return this;
  },
  async update({ fuelIndexId }) {
    this.fuelIndexId = fuelIndexId;
    await this.priceList.update_async({ fuelIndexId });
    return this;
  },
  async getUIResponse() {
    const fuel = await FuelIndex.first(this.fuelIndexId);
    return {
      priceList: {
        id: this.priceListId,
        fuelIndexId: this.fuelIndexId
      },
      fuel
    };
  }
});
