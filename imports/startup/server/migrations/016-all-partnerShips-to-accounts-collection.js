/* eslint-disable no-undef */
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Partnership } from "/imports/api/partnerships/Partnership";

Migrations.add({
  version: 16,
  name: "Add partnershipData in Accounts Collection",
  up: () => {
    // this migrates the partnership structure
    // allAccounts.partners: [{accountId, status}]

    AllAccounts._collection.update(
      {},
      { $unset: { partners: "" } },
      { multi: true }
    );
    Partnership.all().forEach(partnerShip => {
      const { status } = partnerShip;
      const [{ id: id1 }, { id: id2 }] = partnerShip.partners;

      // note: first one is the requestor...

      AllAccounts._collection.update(
        { _id: id1 },
        {
          $addToSet: {
            partners: {
              accountId: id2,
              status,

              // partnerShipId: partnerShip._id,
              requestor: false
            }
          }
        }
      );
      AllAccounts._collection.update(
        { _id: id2 },
        {
          $addToSet: {
            partners: {
              accountId: id1,
              status,

              // partnerShipId: partnerShip._id,
              requestor: true
            }
          }
        }
      );
    });
  }
});
