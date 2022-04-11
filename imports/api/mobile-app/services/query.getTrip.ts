import { queryBuilder } from "./queryBuilder";
import { StopType } from "../interfaces/Trip";

export const getTrip = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ stageId, type }: { stageId: string; type: StopType }) {
    const res = await queryBuilder({ accountId, userId })
      .getStage({ stageId })
      .getShipment()
      .getItems(true)
      .getDocuments()
      .getNonConformances()
      .fetch();

    const { id, shipment, items, stage, nonConformances } = res[0] || {};
    return { id, type, shipment, items, stage, nonConformances };
  }
});
