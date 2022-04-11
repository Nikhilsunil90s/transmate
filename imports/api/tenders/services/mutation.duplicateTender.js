import moment from "moment";
import pick from "lodash.pick";
import omit from "lodash.omit";

import { Tender } from "/imports/api/tenders/Tender";
import { TenderDetail } from "/imports/api/tenders/TenderDetail";
import { Random } from "/imports/utils/functions/random.js";
import SecurityChecks from "/imports/utils/security/_security";

const debug = require("debug")("tenders:mutation");

const MAX_NUMBER_CHECKS = 100;
const ensureUniqueId = async (generatedIds = []) => {
  let number;
  let match;
  let i = 0;
  do {
    number = Random.id();

    // eslint-disable-next-line no-await-in-loop
    match = await TenderDetail.first(
      { number: `${number}` },
      { fields: { number: 1 } }
    );
    match = match || generatedIds.includes(number);

    debug("check if %s, exists ? : %o, in loop %o", number, !!match, i);
    i += 1;
  } while (match && i < MAX_NUMBER_CHECKS);
  if (match)
    throw Error(
      `not able to find unique shipment number, last try was ${number}`
    );

  return number;
};

export const duplicateTender = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ tenderId }) {
    this.orgTenderId = tenderId;
    this.orgTender = await Tender.first(tenderId);
    SecurityChecks.checkIfExists(this.orgTender);
    this.orgTender = omit(this.orgTender, ["id", "_id", "__is_new"]);
    return this;
  },

  /** @private */
  overrideFields(keepData) {
    const { bidders = [] } = this.orgTender;
    this.orgTender.bidders = bidders.map(bidder =>
      pick(bidder, ["accountId", "contact", "userIds"])
    );
    this.orgTender.updated = [];
    this.orgTender.status = "draft";
    this.orgTender.title = `New tender - ${moment().format("YYYY-MM-DD")}`;
    this.orgTender.created = {
      by: this.userId,
      at: new Date()
    };
    if (!keepData) {
      delete this.orgTender.packages;
    }
    delete this.orgTender.calculation;
    return this;
  },

  /** @private */
  async createDocument() {
    this.newTender = await Tender.create_async(this.orgTender);
    this.newTenderId = this.newTender._id;
    return this;
  },

  /** @private */
  async copyDetails(keepData) {
    if (!keepData) return this;
    const generatedIds = [];

    const cursos = await TenderDetail._collection.find({
      tenderId: this.orgTenderId
    });
    const oldDocs = await cursos.fetch();

    const newDocs = await Promise.all(
      oldDocs.map(async doc => {
        const newId = await ensureUniqueId(generatedIds);
        generatedIds.push(newId);

        return { ...doc, _id: newId, tenderId: this.newTenderId };
      })
    );

    await TenderDetail._collection.rawCollection().insertMany(newDocs);
    return this;
  },

  /** entry point: */
  async copy({ keepData }) {
    this.overrideFields(keepData);
    await this.createDocument();
    await this.copyDetails(keepData);
  },
  getUIResponse() {
    return this.newTender;
  }
});
