import React from "react";
import { Router } from "react-router-dom";
import historyModule from "history";
import get from "lodash.get";
import MyRoute from "./MyRoute";
import MySwitch from "./MySwitch";
import client from "/imports/client/services/apollo/client"; // root -> required
import MinimalLayoutContainer from "../layouts/minimal/Minimal.jsx";
import MinimalLayoutWithContextContainer from "../layouts/minimal/MinimalWithContext.jsx";
import TrackLayoutContainer from "../layouts/track/Track.jsx";
import RegisterLayoutContainer from "../layouts/register/Register.jsx";
import AppContainer from "../layouts/app/App.jsx";
import { mustBeAdmin, mustBeLoggedIn } from "./routes-helpers";

import {
  ShipmentOverview,
  ShipmentProjectsOverview,
  AddressOverview,
  AnalysisOverview,
  InvoiceOverview,
  PartnerOverview,
  PriceListOverview,
  PriceRequestOverview,
  TenderOverview,

  // pages:
  Address,
  AddressAside,
  AddressImport,
  Analysis,
  Conversation,
  ConversationOverview,
  Dashboard,
  DataExport,
  DataImport,
  Partner,
  PartnerImport,
  Directory,
  ExactIntegration,
  FuelDetail,
  IntegrationSuccess,
  Invoice,
  Import,
  ImportDetails,
  PriceListDetails,
  PriceListImport,
  PriceList,
  PriceRequest,
  PriceLookup,
  Reporting,
  Settings,
  ShipmentNew,
  ShipmentsView,
  Shipment,
  ShipmentDetails,
  ShipmentCarriersSidebar,
  ShipmentProject,
  TaskOverview,
  Tender,
  Track,
  ToolsRouteInsight,
  ToolsRouteInsightAside,
  ToolsOceanDistance,
  ToolsOceanDistanceAside,
  PriceLookupAside,
  AccountPortal,
  AccountPortalUnsubscribe,
  JobsAdmin,
  ShipmentPickingContainer,
  ShipmentPickingOverview,
  ShipmentManifest,
  TenderBidOverview,
  TenderBid,
  TenderBidSidebar,

  // components:
  AddressHeader,
  AnalysisHeader,
  BasicHeader,
  PartnerHeader,
  PriceListHeader,
  PriceRequestHeader,
  ShipmentHeader,
  TableSearchHeader,
  TenderHeader,
  TenderBidHeader,
  NotFoundPage,
  Register,
  SignIn,
  ForgotPassword,
  TokenLogin,
  ShipmentRequest
} from "./files";
import { ToastContainer } from "../components/utilities/Toast";

const debug = require("debug")("routes");

const history = historyModule.createBrowserHistory();

export const AppRoutes = () => (
  <>
    <ToastContainer />
    <Router history={history}>
      <MySwitch>
        <MyRoute
          name="signUp"
          exact
          path="/register/:accountId?"
          onEnter={(request, redirect) => {
            const isUserAndVerified = Meteor.user() && get(Meteor.user(), "emails[0].verified");
            if (isUserAndVerified) {
              return redirect("dashboard");
            }
            debug("user is not logged in and verified!", Meteor.user());

            return true;
          }}
        >
          <RegisterLayoutContainer
            {...{
              main: <Register />,
              name: "Register"
            }}
          />
        </MyRoute>
        <MyRoute name="signIn" path="/sign-in">
          <RegisterLayoutContainer
            {...{
              main: <SignIn />,
              name: "SignIn"
            }}
          />
        </MyRoute>
        <MyRoute name="loginToken" exact path="/login-token/:token">
          <RegisterLayoutContainer
            {...{
              main: <TokenLogin />,
              name: "TokenLogin"
            }}
          />
        </MyRoute>
        <MyRoute name="forgotPassword" exact path="/forgot-password">
          <RegisterLayoutContainer
            {...{
              main: <ForgotPassword />,
              name: "ForgotPassword"
            }}
          />
        </MyRoute>
        <MyRoute
          name="logout"
          exact
          path="/logout"
          onEnter={(request, redirect) => {
            debug("logging out");
            Meteor.logout(async err => {
              if (err) {
                console.error("logout error", err);
              }

              debug("clear graphql");

              // @see https://www.apollographql.com/docs/react/v2/networking/authentication/#reset-store-on-logout
              // clearStore() is safer than resetStore() in case there are pending apollo queries
              client
                .clearStore()
                .then(() => debug("clear graphql done"))
                .catch(e => console.error(e))
                .finally(() => redirect("signIn")); // make all active queries re-run when the log-out process completed
            });
          }}
        />
        <MyRoute
          exact
          name="dashboard"
          title="Transmate - Dashboard"
          path="/"
          onEnter={(request, redirect) => {
            // eslint-disable-next-line no-underscore-dangle
            if (Accounts._verifyEmailToken || Accounts._enrollAccountToken) {
              return redirect("signUp");
            }

            const result = mustBeLoggedIn(request, redirect);

            return result;
          }}
        >
          <AppContainer
            {...{
              main: <Dashboard />,
              name: "Dashboard"
            }}
          />
        </MyRoute>

        <MyRoute exact name="reporting" path="/reporting/:section?" onEnter={mustBeLoggedIn}>
          <AppContainer
            {...{
              main: <Reporting />,
              name: "Reporting"
            }}
          />
        </MyRoute>

        <MyRoute exact name="import" path="/import/:_id?" onEnter={mustBeLoggedIn}>
          <AppContainer
            {...{
              main: <Import />,
              name: "Import",
              aside: <ImportDetails />
            }}
          />
        </MyRoute>

        <MyRoute exact name="dataImport" path="/data-import/:_id?" onEnter={mustBeLoggedIn}>
          <AppContainer
            {...{
              main: <DataImport />,
              name: "DataImport"
            }}
          />
        </MyRoute>

        <MyRoute exact name="newShipment" path="/shipments/new" onEnter={mustBeLoggedIn}>
          <AppContainer
            {...{
              main: <ShipmentNew />,
              name: "ShipmentNew",
              header: <BasicHeader />,
              headerData: {
                title: "shipment.form.title_new",
                back: "shipments"
              }
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          name="newShipmentFromProject"
          path="/shipments/new/:type/:projectId"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <ShipmentNew />,
              name: "ShipmentNew",
              header: <BasicHeader />,
              headerData: {
                title: "shipment.form.title_new",
                back: "shipments"
              }
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Shipments"
          name="shipments"
          path="/shipments"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <ShipmentOverview />,
              name: "ShipmentOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Shipments"
          name="shipmentsView"
          path="/shipments/view/:_id?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <ShipmentsView />,
              name: "ShipmentsView"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Shipments"
          name="shipment"
          path="/shipment/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <Shipment />,
              name: "Shipment",
              header: <ShipmentHeader />,
              aside: <ShipmentDetails />,
              sidebar: <ShipmentCarriersSidebar />
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Shipment projects"
          name="projects"
          path="/shipment-projects"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <ShipmentProjectsOverview />,
              name: "ShipmentProjectsOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Shipment Request"
          name="shipmentRequest"
          path="/shipment-request"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <ShipmentRequest />,
              name: "ShipmentRequest"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={({ params }) => {
            return `Transmate - Shipment project - ${params._id}`;
          }}
          name="project"
          path="/shipment-project/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <ShipmentProject />,
              name: "ShipmentProject"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Partners"
          name="partners"
          path="/partners"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <PartnerOverview />,
              name: "PartnerOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Partners"
          name="partnerImport"
          path="/partner/import"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <PartnerImport />,
              name: "PartnerImport",
              header: <BasicHeader />,
              headerData: {
                title: "partner.form.title_import",
                back: "partners"
              }
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - portal"
          name="partnerPortal"
          path="/portal/:id"
          onEnter={mustBeLoggedIn}
        >
          <MinimalLayoutContainer
            {...{
              main: <AccountPortal />,
              name: "Portal"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - portal"
          name="portal"
          path="/portal-unsubscribe/:id"
          onEnter={mustBeLoggedIn}
        >
          <MinimalLayoutContainer
            {...{
              main: <AccountPortalUnsubscribe />,
              name: "PortalUnsubscribe"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Conversations"
          name="conversations"
          path="/conversations"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <ConversationOverview />,
              name: "ConversationsOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={({ params }) => {
            return `Transmate - Conversation - ${params._id}`;
          }}
          name="conversation"
          path="/conversations/:_id"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <Conversation />,
              name: "Conversation"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Directory"
          name="directory"
          path="/directory"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <Directory />,
              name: "Directory"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Invoice overview"
          name="invoice-overview"
          path="/invoice-overview/"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <InvoiceOverview />,
              name: "InvoiceOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={({ params }) => `Transmate - Invoice - ${params._id}`}
          name="invoice"
          path="/invoice/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <Invoice />,
              name: "PartnerInvoice",
              header: <PartnerHeader />
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={({ params }) => `Transmate - Partner - ${params._id}`}
          name="partner"
          path="/partner/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <Partner />,
              header: <PartnerHeader />,
              name: "Partner"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Locations"
          name="addresses"
          path="/locations"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <AddressOverview />,
              name: "AddressOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Locations"
          name="address"
          path="/location/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <Address />,
              aside: <AddressAside />,
              header: <AddressHeader />,
              name: "Address"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Locations"
          name="addressImport"
          path="/locations/import"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <AddressImport />,
              name: "AddressImport",
              header: <BasicHeader />,
              headerData: {
                title: "address.form.title_import",
                back: "addresses"
              }
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Create new price list"
          name="newPriceListImport"
          path="/price-lists/import"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <PriceListImport />,
              name: "PriceListImport",
              header: <BasicHeader />,
              headerData: {
                title: "price.list.form.title_new",
                back: "priceLists"
              }
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={({ params }) => `Transmate - Price request - ${params._id}`}
          name="priceRequestEdit"
          path="/price-request/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <PriceRequest />,
              name: "PriceRequest",
              header: <PriceRequestHeader />
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - New price request"
          name="priceRequestNew"
          path="/price-request/new/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <PriceRequest />,
              name: "PriceRequest",
              header: <BasicHeader />,
              headerData: {
                title: "price.list.form.new_title_request",
                back: "priceLists"
              }
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={({ params }) => `Transmate - Price list - ${params._id}`}
          name="priceList"
          path="/price-list/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <PriceList />,
              name: "PriceList",
              header: <PriceListHeader />,
              aside: <PriceListDetails />,
              asideCollapsed: true
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Price lookup"
          name="priceLookup"
          path="/price-lookup"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <PriceLookup />,
              aside: <PriceLookupAside />,
              name: "PriceLookup"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Price list overview"
          name="priceLists"
          path="/price-lists"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <PriceListOverview />,
              name: "PriceListOverview",
              header: <TableSearchHeader />,
              noGeneralSearch: true
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Price request overview"
          name="priceRequests"
          path="/price-requests"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <PriceRequestOverview />,
              name: "PriceRequestOverview",
              header: <TableSearchHeader />,
              noGeneralSearch: true
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Price request download"
          name="priceRequestsDownload"
          path="/price-requests/download"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <DataExport />,
              name: "DataExport"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={({ params }) => `Transmate - Analysis - ${params._id}`}
          name="analysis"
          path="/analysis/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <Analysis />,
              name: "Analysis",
              header: <AnalysisHeader />
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Analysis"
          name="analyses"
          path="/analysis"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <AnalysisOverview />,
              name: "Analyses"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Tender overview"
          name="tenders"
          path="/tenders"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <TenderOverview />,
              name: "TenderOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={({ params }) => `Transmate - Tender - ${params._id}`}
          name="tender"
          path="/tender/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <Tender />,
              name: "Tender",
              header: <TenderHeader />
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={() => `Transmate - Tender bids`}
          name="bid-overview"
          path="/bid-overview/"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <TenderBidOverview />,
              name: "TenderBidOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title={({ params }) => `Transmate - Tender bid - ${params._id}`}
          name="bid"
          path="/bid/:_id/:section?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <TenderBid />,
              name: "Tenderify",
              header: <TenderBidHeader />,
              sidebar: <TenderBidSidebar />
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Tasks"
          name="tasks-overview"
          path="/tasks-overview"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <TaskOverview />,
              name: "TaskOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Settings"
          name="settings"
          path="/settings/:section?/:subSection?"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <Settings />,
              name: "Settings"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Fuel"
          name="fuelDetail"
          path="/fuel/:fuelIndexId"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <FuelDetail />,
              name: "FuelIndex"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Route insight"
          name="routeInsight"
          path="/tools/route-insights"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <ToolsRouteInsight />,
              aside: <ToolsRouteInsightAside />,
              name: "ToolsRouteInsight"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - Ocean distance"
          name="oceanDistance"
          path="/tools/ocean-distance"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <ToolsOceanDistance />,
              aside: <ToolsOceanDistanceAside />,
              name: "ToolsOceanDistance"
            }}
          />
        </MyRoute>

        <MyRoute exact title="Transmate - Track shipments" name="track" path="/track/:shipmentId?">
          <TrackLayoutContainer
            {...{
              main: <Track />,
              name: "Track"
            }}
          />
        </MyRoute>

        <MyRoute exact title="Transmate - integrate" name="connectExact" path="/connect/exact">
          <MinimalLayoutWithContextContainer
            {...{
              main: <ExactIntegration />,
              name: "ExactIntegration"
            }}
          />
        </MyRoute>

        <MyRoute exact title="Transmate - integrate" name="connectSuccess" path="/connect/success">
          <MinimalLayoutContainer
            {...{
              main: <IntegrationSuccess />,
              name: "IntegrationSuccess"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - picking"
          name="packShipment"
          path="/pack/:_id"
          onEnter={mustBeLoggedIn}
        >
          <MinimalLayoutWithContextContainer
            {...{
              main: <ShipmentPickingContainer />,
              name: "packShipment"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - picking overview"
          name="pickingOverview"
          path="/picking-overview"
          onEnter={mustBeLoggedIn}
        >
          <MinimalLayoutWithContextContainer
            {...{
              main: <ShipmentPickingOverview />,
              name: "packShipmentOverview"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - picking manifest"
          name="pickingManifest"
          path="/manifest"
          onEnter={mustBeLoggedIn}
        >
          <MinimalLayoutWithContextContainer
            {...{
              main: <ShipmentManifest />,
              name: "packShipmentManifest"
            }}
          />
        </MyRoute>

        <MyRoute
          path="*"
          exact
          title="Transmate - Page not found"
          name="404"
          onEnter={mustBeLoggedIn}
        >
          <AppContainer
            {...{
              main: <NotFoundPage />,
              name: "404"
            }}
          />
        </MyRoute>

        <MyRoute
          exact
          title="Transmate - admin"
          name="jobsAdmin"
          path="/admin/jobs"
          onEnter={mustBeAdmin}
        >
          <AppContainer
            {...{
              main: <JobsAdmin />,
              name: "JobsAdmin"
            }}
          />
        </MyRoute>
      </MySwitch>
    </Router>
  </>
);

export const onAuthChange = authenticated => {
  debug("isAuthenticated: %o", authenticated);
};
export default AppRoutes;
