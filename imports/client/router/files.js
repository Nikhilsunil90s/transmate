import React from "react";

// overviews:
export const ShipmentOverview = React.lazy(() =>
  import("../views/shipments/ShipmentOverview")
);
export const ShipmentProjectsOverview = React.lazy(() =>
  import("../views/shipment-project-overview/ShipmentProjectsOverview.jsx")
);
export const AddressOverview = React.lazy(() =>
  import("../views/address-overview/AddressOverview.jsx")
);
export const AnalysisOverview = React.lazy(() =>
  import("../views/analysis-overview/AnalysisOverview.jsx")
);
export const InvoiceOverview = React.lazy(() =>
  import("../views/invoice-overview/InvoiceOverview.jsx")
);
export const PartnerOverview = React.lazy(() =>
  import("../views/partner-overview/PartnerOverview.jsx")
);
export const PriceListOverview = React.lazy(() =>
  import("../views/price-list-overview/PriceListOverview.jsx")
);
export const PriceList = React.lazy(() =>
  import("../views/price-list/PriceList.jsx")
);
export const PriceRequestOverview = React.lazy(() =>
  import("../views/price-request-overview/PriceRequestOverview.jsx")
);
export const TenderOverview = React.lazy(() =>
  import("../views/tender-overview/TenderOverview.jsx")
);
export const Partner = React.lazy(() => import("../views/partner/Partner.jsx"));
export const Dashboard = React.lazy(() =>
  import("../views/dashboard/Dashboard.jsx")
);
export const Directory = React.lazy(() =>
  import("../views/partner-directory/Directory.jsx")
);
export const PriceListDetails = React.lazy(() =>
  import("../views/price-list/Aside.jsx")
);
export const AccountPortal = React.lazy(() =>
  import("../views/account/portal/Portal.jsx")
);
export const AccountPortalUnsubscribe = React.lazy(() =>
  import("../views/account/portal/Unsubscribe.jsx")
);

export const AddressImport = React.lazy(() =>
  import("../views/address-overview/import/Import.jsx")
);

export const Conversation = React.lazy(() =>
  import("../components/conversation/Conversation.jsx")
);
export const ConversationOverview = React.lazy(() =>
  import("../views/conversations/Conversations.jsx")
);
export const PartnerImport = React.lazy(() =>
  import("../views/partner-overview/import/Import.jsx")
);

export const PriceLookup = React.lazy(() =>
  import("../views/tools/price-lookup/PriceLookup.jsx")
);
export const PriceLookupAside = React.lazy(() =>
  import("../views/tools/price-lookup/Aside.tsx")
);
export const Settings = React.lazy(() =>
  import("../views/settings/Settings.jsx")
);
export const Track = React.lazy(() =>
  import("../views/shipment-track/Track.jsx")
);
export const Import = React.lazy(() =>
  import("../views/shipment-import/Import.jsx")
);
export const ImportDetails = React.lazy(() =>
  import("../views/shipment-import/Aside.jsx")
);
export const ToolsOceanDistanceAside = React.lazy(() =>
  import("../views/tools/ocean-distance/Aside.jsx")
);
export const ToolsOceanDistance = React.lazy(() =>
  import("../views/tools/ocean-distance/OceanDistance.jsx")
);
export const ToolsRouteInsight = React.lazy(() =>
  import("../views/tools/route-insight/RouteInsights.jsx")
);
export const ToolsRouteInsightAside = React.lazy(() =>
  import("../views/tools/route-insight/Aside.jsx")
);
export const TaskOverview = React.lazy(() =>
  import("../views/bpmn-tasks/TaskOverview.jsx")
);

// pages
export const Analysis = React.lazy(() =>
  import("../views/analysis/Analysis.jsx")
);
export const Reporting = React.lazy(() =>
  import("../views/reporting/ReportingLoader.jsx")
);
export const Address = React.lazy(() => import("../views/address/Address.jsx"));
export const AddressAside = React.lazy(() =>
  import("../views/address/Aside.jsx")
);
export const ShipmentNew = React.lazy(() =>
  import("../views/shipment-new/ShipmentNew.jsx")
);
export const ShipmentsView = React.lazy(() =>
  import("../views/shipments/view/ViewLoader.jsx")
);
export const ShipmentProject = React.lazy(() =>
  import("../views/shipment-project/ShipmentProject.jsx")
);
export const Shipment = React.lazy(() =>
  import("../views/shipment/Shipment.jsx")
);
export const ShipmentRequest = React.lazy(() =>
  import("../views/shipment-request/ShipmentRequest.tsx")
);
export const ShipmentDetails = React.lazy(() =>
  import("../views/shipment/Aside.jsx")
);
export const ShipmentCarriersSidebar = React.lazy(() =>
  import("../views/shipment/sidebar/Sidebar")
);
export const Invoice = React.lazy(() => import("../views/invoice/Invoice.jsx"));
export const PriceRequest = React.lazy(() =>
  import("../views/price-request/PriceRequest.jsx")
);
export const PriceListImport = React.lazy(() =>
  import("../views/price-list/forms/Import.jsx")
);
export const DataExport = React.lazy(() =>
  import("../views/reporting/export/Export.jsx")
);
export const Tender = React.lazy(() => import("../views/tender/Tender.jsx"));

export const ExactIntegration = React.lazy(() =>
  import("../views/integrations/Exact.jsx")
);
export const FuelDetail = React.lazy(() =>
  import("../views/settings/sections/accountData/fuel/FuelDetail")
);
export const IntegrationSuccess = React.lazy(() =>
  import("../views/integrations/Success.jsx")
);
export const DataImport = React.lazy(() =>
  import("../views/dataImport/DataImport.jsx")
);
export const ShipmentPickingContainer = React.lazy(() =>
  import("../views/shipment-picking/detail/ShipmentPickingContainer.jsx")
);
export const ShipmentPickingOverview = React.lazy(() =>
  import("../views/shipment-picking/overview/ShipmentOverview")
);
export const ShipmentManifest = React.lazy(() =>
  import("../views/shipment-picking/manifest/ShipmentManifest")
);
export const TenderBid = React.lazy(() =>
  import("../views/tenderify/Tenderify")
);
export const TenderBidSidebar = React.lazy(() =>
  import("../views/tenderify/tabs/sheet/sideBar/SideBar")
);
export const TenderBidOverview = React.lazy(() =>
  import("../views/tenderify-overview/TenderifyOverview")
);

export const JobsAdmin = React.lazy(() => import("../views/admin/Jobs.jsx"));

// components
export { default as AddressHeader } from "../components/header/item/Address.jsx";
export { default as AnalysisHeader } from "../components/header/item/Analysis.jsx";
export { default as BasicHeader } from "../components/header/item/Basic.jsx";
export { default as PartnerHeader } from "../components/header/item/Partner.jsx";
export { default as PriceListHeader } from "../components/header/item/PriceList.jsx";
export { default as ShipmentHeader } from "../components/header/item/Shipment.jsx";
export { default as TableSearchHeader } from "../components/header/item/TableSearch.jsx";
export { default as TenderHeader } from "../components/header/item/Tender.jsx";
export { default as TenderBidHeader } from "../components/header/item/Tenderify";
export { default as PriceRequestHeader } from "../components/header/item/PriceRequest.jsx";
export { default as NotFoundPage } from "../layouts/app/404.jsx";

// no lazy load for login forms:
export { default as Register } from "../views/register/Register.jsx";
export { default as ForgotPassword } from "../views/register/Forgot.jsx";
export { default as SignIn } from "../views/register/SignIn.jsx";
export { default as TokenLogin } from "../views/register/TokenLogin.jsx";
