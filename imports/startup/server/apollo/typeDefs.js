import allTypeDefs from "./typeDefs.graphql";
import addressTypeDefs from "/imports/api/addresses/apollo/typeDefs.gql";
import shipmentProjectTypeDefs from "/imports/api/shipmentProject/apollo/typeDefs.gql";
import shipmentItemTypeDefs from "/imports/api/items/apollo/typeDefs.gql";
import shipmentTypeDefs from "/imports/api/shipments/apollo/typeDefs.gql";
import invoiceTypeDefs from "/imports/api/invoices/apollo/typeDefs.gql";
import priceRequestTypeDefs from "/imports/api/priceRequest/apollo/typeDefs.gql";
import accountTypeDefs from "/imports/api/allAccounts/apollo/typeDefs.gql";
import documentTypeDefs from "/imports/api/documents/apollo/typeDefs.gql";
import priceListTypeDefs from "/imports/api/pricelists/apollo/typeDefs.gql";
import shipmentViewsTypeDefs from "/imports/api/views/apollo/typeDefs.gql";
import tenderTypeDefs from "/imports/api/tenders/apollo/typeDefs.gql";
import userTypeDefs from "/imports/api/users/apollo/typeDefs.gql";
import locationTypeDefs from "/imports/api/locations/apollo/typeDefs.gql";
import analysisTypeDefs from "/imports/api/analysis/apollo/typeDefs.gql";
import analysisSimulationTypeDefs from "/imports/api/analysis-simulation/apollo/typeDefs.gql";
import analysisSwitchPointTypeDefs from "/imports/api/analysis-switchpoint/apollo/typeDefs.gql";
import scopeTypeDefs from "/imports/api/scope/apollo/typeDefs.gql";
import dataDownloadTypeDefs from "/imports/api/reporting/apollo/typeDefs.gql";
import fuelTypeDefs from "/imports/api/fuel/apollo/typeDefs.gql";
import notificationTypeDefs from "/imports/api/notifications/apollo/typeDefs.gql";
import searchTypeDefs from "/imports/api/search/apollo/typeDefs.gql";
import reviewTypeDefs from "/imports/api/reviews/apollo/typeDefs.gql";
import costTypeDefs from "/imports/api/costs/apollo/typeDefs.gql";
import stageTypeDefs from "/imports/api/stages/apollo/typeDefs.gql";
import nonConformanceTypeDefs from "/imports/api/nonConformances/apollo/typeDefs.gql";
import dashboardTypeDefs from "/imports/api/dashboard/apollo/typeDefs.gql";
import BPMNTasksTypeDefs from "/imports/api/bpmn-tasks/apollo/typeDefs.gql";
import toolsTypeDefs from "/imports/api/tools/apollo/typeDefs.gql";
import accountPortalDefs from "/imports/api/accountPortal/apollo/typeDefs.gql";
import shipmentImportTypeDefs from "/imports/api/imports/apollo/typeDefs.gql";
import dataImportTypeDefs from "/imports/api/imports/apollo-dataImports/typeDefs.gql";
import conversationTypeDefs from "/imports/api/conversations/apollo/typeDefs.gql";
import priceListTemplateTypeDefs from "/imports/api/priceListTemplates/apollo/typeDefs.gql";
import serverTimeTypeDefs from "/imports/api/zz_utils/apollo/typeDefs.gql";
import shipmentPickingTypeDefs from "/imports/api/shipmentPicking/apollo/typeDefs.gql";
import partnershipTypeDefs from "/imports/api/partnerships/apollo/typeDefs.gql";
import settingsTypeDefs from "/imports/api/settings/apollo/typeDefs.gql";
import tenderBidTypeDefs from "/imports/api/tender-bids/apollo/typeDefs.gql";
import tenderBidDataTypeDefs from "/imports/api/tender-bids-data/apollo/typeDefs.gql";
import tenderBidMappingTypeDefs from "/imports/api/tender-bids-mapping/apollo/typeDefs.gql";
import workflowTypeDefs from "/imports/api/bpmn-workflows/apollo/typeDefs.gql";
import uploadsTypeDefs from "/imports/api/uploads/apollo/typeDefs.gql";
import mobileAppTypeDefs from "/imports/api/mobile-app/apollo/typeDefs.gql";

const Query = `
  type Query {
    _empty: String
  }
`;

const Mutation = `
  type Mutation {
    _empty: String
  }
`;

export default [
  Query,
  Mutation,
  allTypeDefs,
  addressTypeDefs,
  shipmentProjectTypeDefs,
  shipmentItemTypeDefs,
  shipmentTypeDefs,
  priceRequestTypeDefs,
  accountTypeDefs,
  invoiceTypeDefs,
  documentTypeDefs,
  priceListTypeDefs,
  shipmentViewsTypeDefs,
  userTypeDefs,
  tenderTypeDefs,
  locationTypeDefs,
  analysisTypeDefs,
  analysisSimulationTypeDefs,
  analysisSwitchPointTypeDefs,
  scopeTypeDefs,
  dataDownloadTypeDefs,
  notificationTypeDefs,
  searchTypeDefs,
  reviewTypeDefs,
  costTypeDefs,
  stageTypeDefs,
  nonConformanceTypeDefs,
  fuelTypeDefs,
  dashboardTypeDefs,
  BPMNTasksTypeDefs,
  toolsTypeDefs,
  accountPortalDefs,
  shipmentImportTypeDefs,
  dataImportTypeDefs,
  conversationTypeDefs,
  priceListTemplateTypeDefs,
  serverTimeTypeDefs,
  shipmentPickingTypeDefs,
  partnershipTypeDefs,
  settingsTypeDefs,
  tenderBidTypeDefs,
  tenderBidDataTypeDefs,
  tenderBidMappingTypeDefs,
  workflowTypeDefs,
  uploadsTypeDefs,
  mobileAppTypeDefs
];
