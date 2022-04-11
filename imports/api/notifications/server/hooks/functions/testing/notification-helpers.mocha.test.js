/* eslint-disable func-names */
import { expect } from "chai";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

import { getPartnerContacts } from "../get-partner-contacts";
import { getPriceRequestAccountsData } from "../get-price-request-accounts-data";
import { getShipmentPlanners } from "../get-shipment-planners";
import { getShipmentStakeholders } from "../get-shipment-stakeholders";
import { setStatusPriceRequestBidder } from "../updateBidderStatus";
import { getShipmentUsers } from "../get-shipment-users";

import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { Shipment } from "/imports/api/shipments/Shipment";

const debug = require("debug")("getPartnerContacts");

const ACCOUNT_ID = "S65957";
const PARTNER_ID = "C75701"; // playco
const PARTNER_USER_ID = "pYFLYFDMJEnKADY3h"; // playco
const PRICE_REQUEST_ID = "FYyFaceLqAeh5nnmo";
const SHIPMENT_ID = "2jG2mZFcaFzqaThcr";

let defaultMongo;

async function addExtraPartnerContact() {
  const { profile } = await AllAccounts.getProfileData({
    accountId: PARTNER_ID,
    myAccountId: ACCOUNT_ID
  });

  await AllAccounts._collection.update(
    {
      _id: PARTNER_ID
    },
    {
      $set: {
        "accounts.0.profile.contacts": [
          ...profile.contacts,
          {
            contactType: "general",
            firstName: "Paul",
            lastName: "Fowler",
            mail: "test@playCo.com"
          }
        ]
      }
    }
  );
}

describe("[notifications][hooks][helpers]", function() {
  before(async () => {
    debug("create mongo connections");
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }

    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  describe("[notifications]", function() {
    beforeEach(function() {
      return resetDb({ resetUsers: true });
    });
    it("[getPartnerContacts]", async function() {
      // add a new contact that has no userId
      await addExtraPartnerContact();

      const { users: userDocs, usersWithoutIds } = await getPartnerContacts({
        accountId: ACCOUNT_ID,
        partnerId: PARTNER_ID
      });

      expect(userDocs).to.have.lengthOf(2);
      const existingUserDoc = userDocs.find(
        ({ id }) => id === "pYFLYFDMJEnKADY3h"
      );
      expect(existingUserDoc.profile).to.eql({
        first: "Carrier",
        last: "Account",
        avatar: ""
      });

      expect(usersWithoutIds).to.have.lengthOf(1);
      expect(usersWithoutIds[0]).to.eql({
        contactType: "general",
        firstName: "Paul",
        lastName: "Fowler",
        mail: "test@playCo.com"
      });
    });
    it("[getPriceRequestAccountsData]", async function() {
      // await addExtraPartnerContact();
      const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID);

      // mock priceRequest contact:

      priceRequest.bidders[0] = {
        ...priceRequest.bidders[0],
        contacts: [
          {
            contactType: "Sales",
            phone: "phone",
            mail: "test@test.com",
            firstName: "Paul",
            lastName: "Foller"
          }
        ],
        userIds: ["pYFLYFDMJEnKADY3h"]
      };

      const {
        customer,
        bidders,
        bidderUsers
      } = await getPriceRequestAccountsData(priceRequest);

      expect(customer).to.not.equal(undefined);
      expect(customer.id).to.equal(priceRequest.customerId);
      expect(customer.name).to.equal("Globex");
      expect(bidders).to.have.lengthOf(1);
      expect(bidderUsers).to.have.lengthOf(1);
    });
    it("[getShipmentPlanners]", async function() {
      const shipment = await Shipment.first(SHIPMENT_ID);
      const res = await getShipmentPlanners(shipment);
      expect(res).to.have.lengthOf(1);
    });
    it("[getShipmentStakeholders]", async function() {
      const shipment = await Shipment.first(SHIPMENT_ID);
      const res = await getShipmentStakeholders(shipment);

      expect(res).to.have.lengthOf(2);
      expect(res).to.include(ACCOUNT_ID);
      expect(res).to.include("C75701");
    });
    it("[setStatusPriceRequestBidder]", async function() {
      const FIELDS = {
        fields: { bidders: { $elemMatch: { accountId: PARTNER_ID } } }
      };

      // onRequested >> flag bidder <notified> in database & set userids
      await setStatusPriceRequestBidder({
        bidderId: PARTNER_ID,
        priceRequestId: PRICE_REQUEST_ID,
        set: ["notified"],
        unset: ["won", "lost", "bidOpened", "viewed", "bid"],
        userIds: [PARTNER_USER_ID]
      });
      const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID, FIELDS);

      expect(priceRequest.bidders[0].userIds).to.include(PARTNER_USER_ID);
      expect(priceRequest.bidders[0].notified).to.be.an.instanceOf(Date);

      // onDraft: unflag bidder <notified> in database
      await setStatusPriceRequestBidder({
        bidderId: PARTNER_ID,
        priceRequestId: PRICE_REQUEST_ID,
        unset: ["notified"]
      });

      await priceRequest.reload(FIELDS);
      expect(priceRequest.bidders[0].notified).equal(undefined);

      await setStatusPriceRequestBidder({
        bidderId: PARTNER_ID,
        priceRequestId: PRICE_REQUEST_ID,
        set: ["notified", "won", "lost", "bidOpened", "viewed", "bid"],
        userIds: [PARTNER_USER_ID]
      });

      // onCancel >> unset all:
      await setStatusPriceRequestBidder({
        bidderId: PARTNER_ID,
        priceRequestId: PRICE_REQUEST_ID,
        unset: ["notified", "won", "bid", "lost", "bidOpened", "viewed"]
      });

      await priceRequest.reload(FIELDS);

      expect(priceRequest.bidders[0].notified).equal(undefined);
    });
    it("[getShipmentUsers]", async function() {
      const shipment = await Shipment.first(SHIPMENT_ID);
      const userIds = await getShipmentUsers(shipment);

      expect(userIds).to.have.lengthOf(3);
      expect(userIds).to.include.members([
        "jsBor6o3uRBTFoQQQ",
        "jsBor6o3uRBTFoRQY",
        "pYFLYFDMJEnKADY3h"
      ]);
    });
  });
});
