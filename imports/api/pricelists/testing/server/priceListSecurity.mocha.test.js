/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
/* eslint-env mocha */
import { Meteor } from "meteor/meteor";
import moment from "moment";
import { expect } from "chai";

// collections
import { PriceList } from "/imports/api/pricelists/PriceList";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";

import {
  CheckPriceListSecurity,
  dbFields
} from "/imports/utils/security/checkUserPermissionsForPriceList";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const PRICE_LIST_ID = "n8pYLq3LEzZDHqYS4";
const CARRIER_ID = "C11051";
const CARRIER_USER_ID = "pYFLYFDMJEnKADYXX";
const PARTNER_ID = "C000001";
const PARTNER_USER_ID = "pYFLYFDMJEnKADYZZ";

const printError = (checks, t) => `${t} - ${JSON.stringify(checks)}`;

describe("priceList", function() {
  let defaultMongo;
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetCollections([
      "accounts",
      "users",
      "roleAssingments",
      "priceLists",
      "priceListRates"
    ]);
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });

  describe("security", function() {
    let priceList;
    const shipperId = ACCOUNT_ID;
    const carrierId = CARRIER_ID;

    const ownerContext = { accountId: ACCOUNT_ID, userId: USER_ID };
    const partnerContext = { accountId: CARRIER_ID, userId: CARRIER_USER_ID };
    const otherContext = { accountId: PARTNER_ID, userId: PARTNER_USER_ID };
    before(async function() {
      priceList = await PriceList.first(PRICE_LIST_ID, { fields: dbFields });
      priceList.status = "draft";
      priceList.creatorId = shipperId; // owner
      priceList.customerId = shipperId;
      priceList.carrierId = carrierId;
    });
    describe("canEditLaneInGrid", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          ownerContext
        );
        await srv.getUserRoles();
        await srv.getUserRoles();
        srv.can({ action: "canEditLaneInGrid" });
        expect(srv.check()).to.equal(true);
      });
      it("denies when filling out", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );

        await srv.getUserRoles();
        srv.can({ action: "canEditLaneInGrid" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );

        await srv.getUserRoles();
        srv.can({ action: "canEditLaneInGrid" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canEditCharge", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);

        await srv.getUserRoles();
        srv.can({ action: "canEditCharge" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canEditCharge" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );

        await srv.getUserRoles();
        srv.can({ action: "canEditCharge" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canAddMasterNotes", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);
        await srv.getUserRoles();
        srv.can({ action: "canAddMasterNotes" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canAddMasterNotes" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canAddMasterNotes" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canEditEquipmentInGrid", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);
        await srv.getUserRoles();

        srv.can({ action: "canEditEquipmentInGrid" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );

        await srv.getUserRoles();
        srv.can({ action: "canEditEquipmentInGrid" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );

        await srv.getUserRoles();
        srv.can({ action: "canEditEquipmentInGrid" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canEditVolumesInGrid", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);
        await srv.getUserRoles();

        srv.can({ action: "canEditVolumesInGrid" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canEditVolumesInGrid" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );

        await srv.getUserRoles();
        srv.can({ action: "canEditVolumesInGrid" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canModifyConversions", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);
        await srv.getUserRoles();

        srv.can({ action: "canModifyConversions" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canModifyConversions" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canModifyConversions" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canModifyGridStructure", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);
        await srv.getUserRoles();

        srv.can({ action: "canEditEquipmentInGrid" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canEditEquipmentInGrid" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canEditEquipmentInGrid" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canAddGridComments", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);
        await srv.getUserRoles();

        srv.can({ action: "canEditEquipmentInGrid" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canEditEquipmentInGrid" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canEditEquipmentInGrid" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canAddFuelModel", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);
        await srv.getUserRoles();

        srv.can({ action: "canAddFuelModel" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canAddFuelModel" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canAddFuelModel" });

        expect(srv.check()).to.equal(false);
      });
    });

    // also allows when filling out
    describe("canModifyLeadTime", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          ownerContext
        );
        await srv.getUserRoles();

        const { checks, allowed } = srv.can({ action: "canModifyLeadTime" });
        expect(allowed).to.equal(true, printError(checks, "canModifyLeadTime"));
      });
      it("allows when filling out", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "requested" }
          },
          ownerContext
        );
        await srv.getUserRoles();

        const { checks, allowed } = srv.can({ action: "canModifyLeadTime" });
        expect(allowed).to.equal(true, printError(checks, "canModifyLeadTime"));
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );

        await srv.getUserRoles();
        srv.can({ action: "canModifyLeadTime" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canModifyLeadTime" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canEditRateInGrid", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);
        await srv.getUserRoles();

        srv.can({ action: "canEditRateInGrid" });

        expect(srv.check()).to.equal(true);
      });
      it("allows when filling out", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "requested" }
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canEditRateInGrid" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );

        await srv.getUserRoles();
        srv.can({ action: "canEditRateInGrid" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );

        await srv.getUserRoles();
        srv.can({ action: "canEditRateInGrid" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canEditRateInList", function() {
      it("allows when status draft || requested, owner", async function() {
        const srv = new CheckPriceListSecurity({ priceList }, ownerContext);
        await srv.getUserRoles();

        srv.can({ action: "canEditRateInList" });

        expect(srv.check()).to.equal(true);
      });
      it("allows when filling out", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: {
              ...priceList,
              status: "requested",
              settings: {
                canEditAdditionalCosts: true
              }
            }
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canEditRateInList" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          partnerContext
        );
        await srv.getUserRoles();

        srv.can({ action: "canEditRateInList" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canEditRateInList" });

        expect(srv.check()).to.equal(false);
      });
    });

    // check status modifiers:
    describe("canBeReleased", function() {
      it("allows when status requested, bidder", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "requested" }
          },
          partnerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeReleased" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when not bidder/owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "requested" }
          },
          otherContext
        );
        await srv.getUserRoles();
        const { checks } = srv.can({ action: "canBeReleased" });

        expect(srv.check()).to.equal(false, printError(checks));
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeReleased" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when expired ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: {
              ...priceList,
              status: "requested",
              validTo: moment()
                .subtract(1, "day")
                .toDate()
            }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeReleased" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canBeApproved", function() {
      it("allows when status for-approval, customer", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "for-approval" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        const { checks } = srv.can({ action: "canBeApproved" });
        expect(srv.check()).to.equal(true, printError(checks, "canBeApproved"));
      });
      it("denies when not customer ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "for-approval" }
          },
          partnerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeApproved" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeApproved" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when expired ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: {
              ...priceList,
              status: "for-approval",
              validTo: moment()
                .subtract(1, "day")
                .toDate()
            }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeReleased" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canBeSetBackToDraft", function() {
      it("allows when status active, owner", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeSetBackToDraft" });

        expect(srv.check()).to.equal(true);
      });
      it("allows when bidder (from 'for-approval' or 'active')", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "for-approval" }
          },
          partnerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeSetBackToDraft" });

        expect(srv.check()).to.equal(true);
      });
      it("denies when bidder (from e.g. 'inactive')", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "inactive" }
          },
          partnerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeSetBackToDraft" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "canceled" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeSetBackToDraft" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canBeDeactivated", function() {
      it("allows when status active, owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        const { checks } = srv.can({ action: "canBeDeactivated" });

        expect(srv.check()).to.equal(
          true,
          printError(checks, "canBeDeactivated")
        );
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "for-approval" }
          },
          partnerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeDeactivated" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "for-approval" }
          },
          partnerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeDeactivated" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when expired ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: {
              ...priceList,
              status: "active",
              validTo: moment()
                .subtract(1, "day")
                .toDate()
            }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeDeactivated" });

        expect(srv.check()).to.equal(false);
      });
    });
    describe("canBeActivated", function() {
      it("allows when status active, owner || customer", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "inactive" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        const { checks } = srv.can({ action: "canBeActivated" });
        expect(srv.check()).to.equal(
          true,
          printError(checks, "canBeActivated")
        );
      });
      it("denies when not owner or customer ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "inactive" }
          },
          partnerContext
        );
        await srv.getUserRoles();
        const { checks, allowed } = srv.can({ action: "canBeActivated" });
        expect(allowed).to.equal(false, printError(checks, "canBeActivated"));
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "for-approval" }
          },
          ownerContext
        );

        await srv.getUserRoles();
        const { checks, allowed } = srv.can({ action: "canBeActivated" });
        expect(allowed).to.equal(false, printError(checks, "canBeActivated"));
      });
      it("denies when expired ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: {
              ...priceList,
              status: "inactive",
              validTo: moment()
                .subtract(1, "day")
                .toDate()
            }
          },
          ownerContext
        );
        await srv.getUserRoles();
        const { checks, allowed } = srv.can({ action: "canBeActivated" });
        expect(allowed).to.equal(false, printError(checks, "canBeActivated"));
      });
    });
    describe("canBeArchived", function() {
      it("allows when status active, owner", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "inactive" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        const { checks, allowed } = srv.can({ action: "canBeArchived" });
        expect(allowed).to.equal(true, printError(checks, "canBeArchived"));
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "inactive" }
          },
          partnerContext
        );
        await srv.getUserRoles();
        const { checks } = srv.can({ action: "canBeArchived" });
        expect(srv.check()).to.equal(
          false,
          printError(checks, "canBeArchived")
        );
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "for-approval" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        const { checks, allowed } = srv.can({ action: "canBeArchived" });
        expect(allowed).to.equal(false, printError(checks, "canBeArchived"));
      });
    });
    describe("canBeDeleted", function() {
      it("allows when status draft, owner", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList
          },
          ownerContext
        );
        await srv.getUserRoles();

        const { checks } = srv.can({ action: "canBeDeleted" });
        expect(srv.check()).to.equal(true, printError(checks));
      });
      it("denies when not owner ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "active" }
          },
          partnerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeDeleted" });

        expect(srv.check()).to.equal(false);
      });
      it("denies when incorrect status ", async function() {
        const srv = new CheckPriceListSecurity(
          {
            priceList: { ...priceList, status: "for-approval" }
          },
          ownerContext
        );
        await srv.getUserRoles();
        srv.can({ action: "canBeDeleted" });

        expect(srv.check()).to.equal(false);
      });
    });
  });
});
