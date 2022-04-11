// import { ValidatedMethod } from "meteor/mdg:validated-method";
// import { Meteor } from "meteor/meteor";
// import request from "request";
// import SimpleSchema from "simpl-schema";

// // collections
// import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
// import SecurityChecks from "/imports/utils/security/_security";

// const debug = require("debug")("power-bi");

// let getAccessToken;
// let getEmbedToken;

// export const getToken = new ValidatedMethod({
//   name: "analytics.getPowerBIToken",
//   validate: new SimpleSchema({
//     report: {
//       type: String
//     },
//     filter: {
//       type: String,
//       optional: true // optionally use the id field for RLS
//     }
//   }).validator(),
//   run({ report = "shipments", filter }) {
//     SecurityChecks.checkLoggedIn(this.userId);

//     // for Row Level security:
//     const accountId = AllAccounts.id(this.userId);

//     // https://powerbi.microsoft.com/en-us/documentation/powerbi-developer-embedded-rls/
//     // get report id from app.powerbi.com - get it out of the URL
//     // get dataset from app.powerbi.com - select dataset in left menu and copy URL
//     const powerBiSettings = {
//       ...process.env.POWERBI,
//       reports: {
//         shipments: {
//           name: "report-lane",
//           id: "66a771e8-36d5-40eb-b24a-aa81d8fd17b7",
//           groupId: "ccba039a-206d-47d2-b809-e5225a7c126b",
//           identities: [
//             {
//               username: accountId,
//               roles: ["accountId"],

//               // 'carrier'
//               datasets: ["ad64a2f2-61ad-40df-9a53-f346f3d06308"]
//             }
//           ]
//         },
//         invoices: {
//           name: "report-invoice",
//           id: "4569b965-6b45-4764-96e4-3ac4aa3f89ee",
//           identities: [
//             {
//               username: accountId,
//               roles: ["shipper", "carrier"],
//               datasets: ["6f97ae40-8ba7-4669-80ca-833157223727"]
//             }
//           ]
//         },
//         accrual: {
//           name: "report-spend",
//           id: "a09a3a7f-dcea-4767-8e9f-db50920c057a",
//           identities: [
//             {
//               username: accountId,
//               roles: ["shipper", "carrier"],
//               datasets: ["6f97ae40-8ba7-4669-80ca-833157223727"]
//             }
//           ]
//         },
//         service: {
//           name: "report-lane-performance",
//           id: "ff548952-f0c6-4819-967f-530e6d27a4c4",
//           identities: [
//             {
//               username: accountId,
//               roles: ["shipper", "carrier"],
//               datasets: ["6f97ae40-8ba7-4669-80ca-833157223727"]
//             }
//           ]
//         },
//         profile: {
//           name: "report-carrier",
//           id: "b84546aa-927d-466a-9f3b-92560c75cdfe",
//           identities: [
//             {
//               username: accountId,
//               roles: ["shipper", "carrier"],
//               datasets: ["6f97ae40-8ba7-4669-80ca-833157223727"]
//             }
//           ]
//         },
//         tender: {
//           name: "report-tender",
//           id: "db10f2a2-5b04-430d-99e2-d777ad404256",
//           groupId: "ccba039a-206d-47d2-b809-e5225a7c126b",
//           identities: [
//             {
//               username: filter,
//               roles: ["tenderId"],
//               datasets: ["dd9b3385-6b0f-4833-a4a8-115dc21f9949"]
//             }
//           ]
//         },
//         analysisSimulationV2: {
//           name: "report-analysisSimulation-V2",
//           id: "08f42254-a23e-4d47-97f8-bb8320dd091c",
//           identities: [
//             {
//               username: filter,
//               roles: ["analysisId"],
//               datasets: ["8017b72c-0723-4b8c-b987-867631b02760"]
//             }
//           ]
//         },
//         invoiceControl: {
//           name: "report-invoice",
//           id: "6a0be4e4-6285-4fb3-8de7-79bf07b7c264",
//           identities: [
//             {
//               username: filter,
//               roles: ["invoiceId"],
//               datasets: ["a77bd5ae-3387-4f75-bf2f-ae0616686468"]
//             }
//           ]
//         },
//         tenderify: {
//           name: "tenderifyDashboard",
//           groupId: "66dc3f6e-9809-4e89-8981-81cfd9534c9b",
//           id: "f9f09c32-10d8-48cc-901a-5012ef5dcf2f",
//           identities: [
//             {
//               username: accountId,
//               roles: ["ALL"],
//               datasets: ["aa4f3e28-a024-44db-b3b5-ad218959936c"]
//             }
//           ]
//         }
//       }
//     };
//     const reportSetting =
//       powerBiSettings.reports[report] || powerBiSettings.reports.shipments;
//     const groupId = reportSetting.groupId || powerBiSettings.groupId;
//     const reportId = reportSetting.id;
//     const { identities } = reportSetting;
//     return getAccessToken()
//       .then(accessToken => {
//         debug("accessToken %s", accessToken);
//         return getEmbedToken(accessToken, groupId, reportId, identities);
//       })
//       .then(token => {
//         debug("powerBI embed settings %o", {
//           groupId,
//           reportId,
//           identities
//         });
//         return {
//           accessToken: token,
//           embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}`,
//           id: reportId
//         };
//       })
//       .catch(() => {
//         throw new Meteor.Error(
//           500,
//           "Could not get an authorization code, try again later"
//         );
//       });
//   }
// });

// export const getCustomToken = new ValidatedMethod({
//   name: "analytics.custom.getPowerBIToken",
//   validate: new SimpleSchema({
//     groupId: {
//       type: String
//     },
//     reportId: {
//       type: String
//     },
//     identities: {
//       type: Array,
//       optional: true
//     },
//     "identities.$": {
//       type: Object,
//       blackbox: true
//     }
//   }).validator(),
//   run({ groupId, reportId, identities }) {
//     SecurityChecks.checkLoggedIn(this.userId);

//     // for Row Level security:
//     return getAccessToken()
//       .then(accessToken => {
//         return getEmbedToken(accessToken, groupId, reportId, identities);
//       })
//       .then(token => {
//         return {
//           accessToken: token,
//           embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}`,
//           id: reportId
//         };
//       })
//       .catch(() => {
//         throw new Meteor.Error(
//           500,
//           "Could not get an authorization code, try again later"
//         );
//       });
//   }
// });

// getAccessToken = () => {
//   return new Promise((resolve, reject) => {
//     const url = "https://login.microsoftonline.com/common/oauth2/token";
//     const headers = {
//       "Content-Type": "application/x-www-form-urlencoded"
//     };
//     const form = {
//       grant_type: "password",
//       client_id: process.env.POWER_BI_CLIENTID,
//       resource: "https://analysis.windows.net/powerbi/api",
//       scope: "openid",
//       username: process.env.POWER_BI_USERNAME,
//       password:
//         process.env.POWER_BI_PASSWORD
//     };
//     return request.post(
//       {
//         url,
//         form,
//         headers
//       },
//       (err, result, body) => {
//         if (err) {
//           return reject(err);
//         }
//         const bodyObj = JSON.parse(body);
//         return resolve(bodyObj.access_token);
//       }
//     );
//   });
// };

// getEmbedToken = (accessToken, groupId, reportId, identities) => {
//   return new Promise((resolve, reject) => {
//     const url = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`;
//     const headers = {
//       "Content-Type": "application/x-www-form-urlencoded",
//       Authorization: `Bearer ${accessToken}`
//     };
//     const form = {
//       accessLevel: "View",
//       identities
//     };
//     request.post(
//       {
//         url,
//         form,
//         headers
//       },
//       (err, result, body) => {
//         if (err || !body) {
//           return reject(err);
//         }
//         const bodyObj = JSON.parse(body);
//         const { token, error } = bodyObj;
//         debug("body %o", error);
//         return resolve(token);
//       }
//     );
//   });
// };
