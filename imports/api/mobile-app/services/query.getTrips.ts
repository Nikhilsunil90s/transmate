import { queryBuilder } from "./queryBuilder";

export const getTrips = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get() {
    const resultArray = await queryBuilder({ accountId, userId })
      .getStageByFilter()
      .getShipment()
      .getItems(false)
      .fetch();

    return resultArray;
  }
});
