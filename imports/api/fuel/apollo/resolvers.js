import SecurityChecks from "/imports/utils/security/_security";
import { CheckAccountSecurity } from "/imports/utils/security/checkUserPermissionsForAccount";
import { FuelIndex } from "/imports/api/fuel/FuelIndex";

const FIELDS = { name: 1, base: 1 };
const ALL_FIELDS = {
  accountId: 1,
  created: 1,
  name: 1,
  description: 1,
  fuel: 1,
  acceptance: 1,
  costId: 1,
  base: 1,
  periods: 1
};

export const resolvers = {
  Query: {
    async getFuelIndexes(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const indeces = await FuelIndex.where(
        { accountId },
        { fields: { ...FIELDS } }
      );
      return indeces;
    },
    async getFuelIndex(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { fuelIndexId } = args;
      return FuelIndex.first(fuelIndexId, {
        fields: { ...ALL_FIELDS }
      });
    }
  },
  Mutation: {
    async addFuelIndex(root, args, context) {
      const { userId } = context;
      const { fuel } = args;

      SecurityChecks.checkLoggedIn(userId);
      return FuelIndex.create_async(fuel, context);
    },
    async updateFuelIndex(root, args, context) {
      const { userId, accountId } = context;
      const { fuelIndexId, updates } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const fuelIdx = await FuelIndex.first(fuelIndexId);
      SecurityChecks.checkIfExists(fuelIdx);

      const check = new CheckAccountSecurity({}, { accountId, userId });
      await check.getUserRoles();
      check
        .can({
          action: "canEditFuelModel",
          data: { fuelAccountId: fuelIdx.accountId }
        })
        .throw();
      return fuelIdx.update_async(updates);
    },
    async removeFuelIndex(root, args, context) {
      const { userId, accountId } = context;
      const { fuelIndexId } = args;

      SecurityChecks.checkLoggedIn(userId);
      const fuelIdx = await FuelIndex.first(fuelIndexId);
      SecurityChecks.checkIfExists(fuelIdx);

      const check = new CheckAccountSecurity({}, { accountId, userId });
      await check.getUserRoles();
      check
        .can({
          action: "canEditFuelModel",
          data: { fuelAccountId: fuelIdx.accountId }
        })
        .throw();

      await fuelIdx.destroy_async();
      return true;
    }
  }
};
