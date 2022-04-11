// import { Meteor } from "meteor/meteor";
// import { ValidatedMethod } from "meteor/mdg:validated-method";
// import SimpleSchema from "simpl-schema";

// // collections
// import { ShipmentSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/shipment.js";
// import { User } from "/imports/api/users/User.js";
// import { Item } from "/imports/api/items/Item.js";
// import { Stage } from "/imports/api/stages/Stage.js";
// import { Shipment } from "/imports/api/shipments/Shipment.js";
// import { ItemSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/item.js";
// import { StageSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/stage.js";
// import { InvoiceItemSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/invoice-item.js";
// import { InvoiceItem } from "/imports/api/invoices/Invoice-item.js";
// import { PriceList } from "/imports/api/pricelists/PriceList.js";
// import SecurityChecks from "/imports/utils/security/_security.js";

// // methods & services
// import { PartnerShipService } from "/imports/api/partnerships/services/service";
// import { duplicatePriceList } from "/imports/api/pricelists/services/mutation.duplicatePriceList";

// const debug = require("debug")("demo:method");

// debug("demo method loaded!");

// export const getDemoStatus = new ValidatedMethod({
//   name: "getDemoStatus",
//   validate: null,
//   async run() {
//     const currentUserId = this.userId;
//     SecurityChecks.checkLoggedIn(currentUserId);

//     const accountId = await User.getAccountId();
//     debug(
//       "get demo status for : %s and check db if account %s has multiple users %o",
//       currentUserId,
//       accountId,
//       `roles.account-${accountId}`
//     );

//     // demo's in order of :
//     let demoList = [];

//     // to do : make demo more variable dependin on roles, skip demo for now!

//     /* "dashboard", "shipments", "shipment" */

//     // check if account has no shipments and pricelists . only do demo when 1 user exist in the account!
//     // don't show demo if account has multiple users
//     const usersInThisAccount = User.find(
//       { [`roles.account-${accountId}`]: { $exists: true } },
//       { fields: { _id: 1 } }
//     ).count();
//     let user;
//     let demoListDone;
//     if (usersInThisAccount > 1) {
//       debug(
//         "skip demo for account %s, already multiple users:%o",
//         accountId,
//         usersInThisAccount
//       );

//       return [];
//     }
//     try {
//       user = User.first(currentUserId, { fields: { demo: 1 } });
//     } catch (error) {
//       throw new Meteor.Error(error);
//     }
//     const { demo } = user || {};
//     if (!user) {
//       debug("user not found !");
//       return [];
//     }
//     if (!demo || !Array.isArray(demo)) {
//       debug("demo object not found in user");
//       demoListDone = [];
//     } else {
//       demoListDone = demo.map(r => {
//         return r.type;
//       });
//     }

//     // check if shipments are present in BQ
//     // const shipmentsGrouped = Meteor.call("count.shipments");
//     const shipmentsGrouped = null; // temp fix
//     if (!shipmentsGrouped || !shipmentsGrouped.data) {
//       debug("no connection to bq?");
//       demoList = [];
//     } else {
//       // / we are looking for draft or planned shipments (in data key) {name: "draft", y: 338}, {name: "planned", y: 351}
//       let totalOpen = 0;
//       (shipmentsGrouped.data || []).forEach(type => {
//         if (["draft", "planned", "started"].includes(type.name)) {
//           totalOpen += type.y;
//         }
//       });
//       if (totalOpen === 0) {
//         debug(
//           "no shipments available for demo! probably test env not linked to bq?"
//         );
//         demoList = ["dashboard"]; // remove shipment(s) from option list
//       }
//     }
//     const result = demoList.filter(
//       demoItem => demoListDone.indexOf(demoItem) === -1
//     );
//     debug("demolist", result);

//     return result;
//   }
// });

// export const setDemoStatus = new ValidatedMethod({
//   name: "setDemoStatus",
//   validate: new SimpleSchema({
//     demoFinished: {
//       type: String
//     }
//   }).validator(),
//   run({ demoFinished, userId }) {
//     const currentUserId = userId;

//     debug("set demo status for :", currentUserId, " and demo : ", demoFinished);

//     const result = User._collection.update(currentUserId, {
//       $push: { demo: { type: demoFinished, at: new Date() } }
//     });
//     return result;
//   }
// });

// export const deleteDemoData = new ValidatedMethod({
//   name: "deleteDemoData",
//   validate: null,
//   async run() {
//     const accountId = await User.getAccountId();
//     if (accountId === "S79207") {
//       throw new Meteor.Error(
//         "don't modify/delete shipments from demo account! Abort!"
//       );
//     }

//     debug("delete  demo shipmnets for account : %o", accountId);

//     const result = Shipment.where(
//       { demo: true, shipperId: accountId },
//       { fields: { _id: 1 } }
//     );

//     result.forEach(shipment => {
//       Item._collection.remove({ shipmentId: shipment._id });
//       Stage._collection.remove({ shipmentId: shipment._id });
//       InvoiceItem._collection.remove({ shipmentId: shipment._id });
//       shipment.deleteFlag();
//     });
//     return `shipments deleted : ${result.length}`;
//   }
// });

// function copyDemoPricelist(accountId, userId) {
//   // copy first pricelist from Demo account

//   if (accountId === "S79207") {
//     throw new Meteor.Error(
//       "don't modify/delete shipments from demo account! Abort!"
//     );
//   }
//   const check = PriceList.find(
//     {
//       customerId: accountId,
//       title: /.*demo.*/i,
//       deleted: false
//     },
//     { fields: { _id: 1 }, limit: 1 }
//   ).count();
//   if (check === 0) {
//     const result = PriceList.where(
//       { customerId: "S79207", title: /.*demo.*/i },
//       { fields: { _id: 1 }, limit: 3 }
//     );

//     result.forEach(async priceList => {
//       debug(
//         " %o pricelist copy to current account: %o",
//         priceList._id,
//         accountId
//       );

//       const srv = duplicatePriceList({ accountId, userId });
//       await srv.init({ priceListId: priceList.id });
//       await srv.duplicate({
//         rates: true,
//         overrides: { copyToOtherAccount: true }
//       });
//     });
//     return "successfully added demo pricelist";
//   }
//   return "already demo pricelist in account";
// }

// async function setDemoPartnership({ accountId, carrierId }) {
//   // copy first pricelist from Demo account

//   if (accountId === "S79207") {
//     throw new Meteor.Error(
//       "don't modify/delete shipments from demo account! Abort!"
//     );
//   }
//   try {
//     const srv = new PartnerShipService({
//       requestorId: accountId,
//       requestedId: carrierId
//     });
//     await srv.init();
//     await srv.create();
//     await srv.setStatus({ status: "active" });
//   } catch (error) {
//     throw new Meteor.Error(error);
//   }
// }

// export const getDemoShipmentId = new ValidatedMethod({
//   name: "getDemoShipmentId",
//   validate: null,
//   async run() {
//     try {
//       // get demo shipment id if exist else normal shipment
//       const accountId = await User.getAccountId();
//       const result = await Shipment.first(
//         { accountId, status: { $ne: "canceled" }, deleted: false },
//         {
//           fields: { _id: 1 },
//           sort: { demo: -1 },
//           limit: 1
//         }
//       );
//       return result;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }
// });

// export const copyDemoShipments = new ValidatedMethod({
//   name: "copyDemoShipments",
//   validate: new SimpleSchema({
//     qty: {
//       type: Number
//     }
//   }).validator(),
//   async run({ qty }) {
//     check(qty, Number);
//     const { userId } = this;
//     const accountId = await User.getAccountId();
//     const shipmentIds = [];
//     if (accountId === "S79207") {
//       throw new Meteor.Error(
//         "don't modify/delete shipments from demo account! Abort!"
//       );
//     }

//     // copy pricelist form demo, add demo to the title"
//     copyDemoPricelist(accountId, userId);

//     // get demo pricelist and link shipments to this pricelist
//     const pricelist = PriceList.first(
//       {
//         customerId: accountId,
//         title: /.*demo.*/i,
//         deleted: false
//       },
//       { fields: { _id: 1 }, limit: 1 }
//     );

//     debug("link demo shipments to pricelist : %o", pricelist._id);

//     if (
//       Shipment.find({
//         shipperId: accountId,
//         status: { $ne: "canceled" },
//         deleted: false
//       }).count() > 0
//     ) {
//       debug("%s account has already (demo) shipments!", accountId);
//       return [];
//     }
//     const shipments = Shipment.where(
//       {
//         accountId: "S79207",
//         flags: { $elemMatch: { $eq: "has-invoice" } },
//         status: { $nin: ["canceled", "completed"] }
//       },
//       { limit: qty }
//     );

//     debug("%s asks results : %o", accountId, qty);
//     shipments.forEach(shipmentData => {
//       debug(shipmentData);

//       // create partnerships
//       debug(shipmentData.carrierIds);
//       shipmentData.priceListId = pricelist._id;
//       shipmentData.demo = true;
//       shipmentData.carrierIds.forEach(carrierId => {
//         setDemoPartnership({ accountId, carrierId });
//       });

//       const shipmentDataId = shipmentData.id;

//       // remove linked items
//       // delete account id so it will link to current user
//       delete shipmentData.accountId;
//       delete shipmentData.itemIds;
//       delete shipmentData.stageIds;

//       // clean id and other non "new" shipment data
//       ShipmentSchema.clean(shipmentData, {
//         filter: true,
//         trimString: true,
//         getAutoValues: true,
//         removeEmptyStrings: true,
//         removeNullsFromArrays: true,
//         autoConvert: true,
//         mutate: true
//       });

//       debug(shipmentData);
//       const result = Shipment.create(shipmentData);

//       debug(shipmentDataId, "copied to id : ", result.id);

//       // add goods to shipment
//       debug(`get items of :${shipmentDataId}`);
//       const items = Item.where({ shipmentId: shipmentDataId });
//       items.forEach(item => {
//         delete item.id;
//         delete item._id;
//         ItemSchema.clean(item, {
//           filter: true,
//           trimString: true,
//           getAutoValues: true,
//           removeEmptyStrings: true,
//           removeNullsFromArrays: true,
//           autoConvert: true,
//           mutate: true
//         });
//         item.shipmentId = result.id;
//         Item.create(item);
//       });

//       // add stages to shipment
//       debug(`get stages for :${shipmentDataId}`);
//       const stages = Stage.where({ shipmentId: shipmentDataId });
//       stages.forEach(stage => {
//         delete stage.id;
//         delete stage._id;
//         StageSchema.clean(stage, {
//           filter: true,
//           trimString: true,
//           getAutoValues: true,
//           removeEmptyStrings: true,
//           removeNullsFromArrays: true,
//           autoConvert: true,
//           mutate: true
//         });
//         stage.shipmentId = result.id;
//         Stage.create(stage);
//       });

//       // add invoices to shipment
//       // add stages to shipment
//       debug(`get invoice items for :${shipmentDataId}`);
//       const invoiceItems = InvoiceItem.where({
//         shipmentId: shipmentDataId
//       });
//       invoiceItems.forEach(invoiceItem => {
//         delete invoiceItem.id;
//         delete invoiceItem._id;
//         InvoiceItemSchema.clean(invoiceItem, {
//           filter: true,
//           trimString: true,
//           getAutoValues: true,
//           removeEmptyStrings: true,
//           removeNullsFromArrays: true,
//           autoConvert: true,
//           mutate: true
//         });
//         invoiceItem.shipmentId = result.id;
//         InvoiceItem.create(invoiceItem);
//       });

//       // recalculate costs
//       // Meteor.call("import.process.costs", {
//       //   shipmentId: result.id,
//       //   priceListTitle: pricelist._id
//       // });
//       shipmentIds.push(result.id);
//     });
//     return shipmentIds;
//   }
// });

// export const skipAllDemos = new ValidatedMethod({
//   name: "skipAlldemos",
//   validate: null,
//   run() {
//     const me = User.me();
//     ["dashboards", "shipments", "shipment"].forEach(demo => {
//       me.push({
//         demo: {
//           type: demo,
//           at: new Date()
//         }
//       });
//     });
//   }
// });

// export const resetDemo = new ValidatedMethod({
//   name: "resetDemo",
//   validate: null,
//   run() {
//     const me = User.me();

//     // remove all demos from user account
//     me.update({ demo: [] });

//     // delete all data linked to the account
//     return Meteor.call("deleteDemoData");
//   }
// });
