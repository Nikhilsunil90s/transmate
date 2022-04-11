import merge from "lodash.merge";

import { resolvers as allResolvers } from "./schema";
import { resolvers as addressResolvers } from "/imports/api/addresses/apollo/resolvers";
import { resolvers as shipmentProjectResolvers } from "/imports/api/shipmentProject/apollo/resolvers";
import { resolvers as shipmentResolvers } from "/imports/api/shipments/apollo/resolvers";
import { resolvers as shipmentItemResolvers } from "/imports/api/items/apollo/resolvers";
import { resolvers as priceRequestResolvers } from "/imports/api/priceRequest/apollo/resolvers";
import { resolvers as InvoiceResolvers } from "/imports/api/invoices/apollo/resolvers";
import { resolvers as PriceListResolvers } from "/imports/api/pricelists/apollo/resolvers";
import { resolvers as ViewsResolvers } from "/imports/api/views/apollo/resolvers";
import { resolvers as UserResolvers } from "/imports/api/users/apollo/resolvers";
import { resolvers as TenderResolvers } from "/imports/api/tenders/apollo/resolvers";
import { resolvers as AnalysisResolvers } from "/imports/api/analysis/apollo/resolvers";
import { resolvers as AnalysisSimulationResolvers } from "/imports/api/analysis-simulation/apollo/resolvers";
import { resolvers as AnalysisSwitchPointResolvers } from "/imports/api/analysis-switchpoint/apollo/resolvers";
import { resolvers as ScopeResolvers } from "/imports/api/scope/apollo/resolvers";
import { resolvers as DataDownloadResolvers } from "/imports/api/reporting/apollo/resolvers";
import { resolvers as AccountResolvers } from "/imports/api/allAccounts/apollo/resolvers";
import { resolvers as FuelResolvers } from "/imports/api/fuel/apollo/resolvers";
import { resolvers as NotificationResolvers } from "/imports/api/notifications/apollo/resolvers";
import { resolvers as SearchResolvers } from "/imports/api/search/apollo/resolvers";
import { resolvers as ReviewResolvers } from "/imports/api/reviews/apollo/resolvers";
import { resolvers as CostResolvers } from "/imports/api/costs/apollo/resolvers";
import { resolvers as DocumentResolvers } from "/imports/api/documents/apollo/resolvers";
import { resolvers as NCResolvers } from "/imports/api/nonConformances/apollo/resolvers";
import { resolvers as StageResolvers } from "/imports/api/stages/apollo/resolvers.js";
import { resolvers as DashboardResolvers } from "/imports/api/dashboard/apollo/resolvers";
import { resolvers as BPMNTasksResolvers } from "/imports/api/bpmn-tasks/apollo/resolvers";
import { resolvers as toolsResolvers } from "/imports/api/tools/apollo/resolvers";
import { resolvers as accountPortalResolvers } from "/imports/api/accountPortal/apollo/resolvers";
import { resolvers as ShipmentImportResolvers } from "/imports/api/imports/apollo/resolvers";
import { resolvers as DataImportResolvers } from "/imports/api/imports/apollo-dataImports/resolvers";
import { resolvers as ConversationResolvers } from "/imports/api/conversations/apollo/resolvers";
import { resolvers as PriceListTemplateResolvers } from "/imports/api/priceListTemplates/apollo/resolvers";
import { resolvers as ServerTimeResolvers } from "/imports/api/zz_utils/apollo/resolvers";
import { resolvers as ShipmentPickingResolvers } from "/imports/api/shipmentPicking/apollo/resolvers";
import { resolvers as PartnershipResolvers } from "/imports/api/partnerships/apollo/resolvers";
import { resolvers as SettingsResolvers } from "/imports/api/settings/apollo/resolver.js";
import { resolvers as TenderBidResolvers } from "/imports/api/tender-bids/apollo/resolvers.js";
import { resolvers as TenderBidDataResolvers } from "/imports/api/tender-bids-data/apollo/resolvers.js";
import { resolvers as TenderBidMappingResolvers } from "/imports/api/tender-bids-mapping/apollo/resolvers.js";
import { resolvers as WorkflowResolvers } from "/imports/api/bpmn-workflows/apollo/resolvers";
import { resolvers as UploadResolvers } from "/imports/api/uploads/apollo/resolvers";
import { resolvers as MobileAppResolvers } from "/imports/api/mobile-app/apollo/resolvers";

export default merge(
  allResolvers,
  addressResolvers,
  shipmentProjectResolvers,
  shipmentResolvers,
  shipmentItemResolvers,
  priceRequestResolvers,
  InvoiceResolvers,
  PriceListResolvers,
  ViewsResolvers,
  UserResolvers,
  TenderResolvers,
  AnalysisResolvers,
  AnalysisSimulationResolvers,
  AnalysisSwitchPointResolvers,
  ScopeResolvers,
  DataDownloadResolvers,
  AccountResolvers,
  FuelResolvers,
  NotificationResolvers,
  SearchResolvers,
  ReviewResolvers,
  CostResolvers,
  DocumentResolvers,
  NCResolvers,
  StageResolvers,
  DashboardResolvers,
  BPMNTasksResolvers,
  toolsResolvers,
  accountPortalResolvers,
  ShipmentImportResolvers,
  DataImportResolvers,
  ConversationResolvers,
  PriceListTemplateResolvers,
  ServerTimeResolvers,
  ShipmentPickingResolvers,
  PartnershipResolvers,
  SettingsResolvers,
  TenderBidResolvers,
  TenderBidDataResolvers,
  TenderBidMappingResolvers,
  WorkflowResolvers,
  UploadResolvers,
  MobileAppResolvers
);
