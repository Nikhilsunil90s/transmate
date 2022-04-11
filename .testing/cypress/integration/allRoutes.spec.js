/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import filterTests from "../filterTests";
const DB_PRICE_REQUEST_ID = "zgSR5RRWJoHMDSEDy";
const DB_PRICELIST_ID = "n8pYLq3LEzZDHqYS4";
const DB_SHIPMENT_ID = "2jG2mZFcaFzqaThXX";
const DB_SHIPMENT_PROJECT_ID = ""; // to create
const DB_PARTNER_ID = "C75701";
const DB_INVOICE_ID = ""; // to create
const DB_ADDRESS_ID = "j958tYA872PAogTDq";
const DB_ANALYSIS_ID = "cJn9oYi5YWx8t9fwQ";
const DB_TENDER_ID = "zx43GEoqXk66umzNS";
const DB_USER_ID = "pYFLYFDMJEnKADY3h";

const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };

filterTests(["all", "routes", "ci"], () => {
  describe("Routes", function() {
    describe("all app routes", function() {
      before(() => {
        cy.login(MAIN_USER);
        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
        });
        cy.saveLocalStorage(); // keeps user logged in
      });
      after(() => {
        cy.logout();
        cy.saveLocalStorage();
      });
      beforeEach(() => {
        cy.restoreLocalStorage(); // keeps logged in..
        cy.login(MAIN_USER);
        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
        });
      });
      describe("general", function() {
        it("route - home", function() {
          cy.visit("/");
          cy.get("main.Dashboard").should("exist");
        });
        it("route - reporting", function() {
          cy.visit("/reporting");
          cy.get("main.Reporting").should("exist");
        });
        it("route - tasks overview", function() {
          cy.visit(`/tasks-overview`);
          cy.get("main.TaskOverview").should("exist");
        });
        it.skip("route - settings", function() {
          cy.visit(`/settings`);
          cy.get("main.Settings").should("exist");
          [
            "user-profile",
            "security",
            "notifications",
            "preferences",
            "account-profile",
            "account-entities",
            "account-users",
            "activity",
            "billing",
            "fuel",
            "master-data",
            "workflows",
            "data-sources",
            "conversions",
            "projects"
          ].forEach(section => {
            cy.visit(`/settings/${section}`);
            cy.get("main.Settings").should("exist");
          });
        });
      });

      describe("shipments", function() {
        it("route - import (shipments)", function() {
          cy.visit("/shipments");
          cy.get("main.ShipmentOverview").should("exist");
          cy.getBySel("importBtn").click();
          cy.get("main.Import").should("exist");
        });
        it("route - shipment new", function() {
          cy.visit("/shipments/new");
          cy.get("main.ShipmentNew").should("exist");
        });
        it("route - shipment new project", function() {
          cy.visit("/shipments/new/inbound/someId");
          cy.get("main.ShipmentNew").should("exist");
        });
        it("route - shipment overview", function() {
          cy.visit("/shipments");
          cy.get("main.ShipmentOverview").should("exist");
        });
        it("route - shipment view", function() {
          cy.visit("/shipments/view");
          cy.get("main.ShipmentsView").should("exist");
        });
        it("route - shipment", function() {
          cy.visit(`/shipment/${DB_SHIPMENT_ID}`);
          cy.get("main.Shipment").should("exist");
        });
        it("route - shipment projects", function() {
          cy.visit("/shipment-projects");
          cy.get("main.ShipmentProjectsOverview").should("exist");
        });
        it("route - shipment project overview", function() {
          cy.visit("/shipment-projects");
          cy.get("main.ShipmentProjectsOverview").should("exist");
        });
        it.skip("route - shipment projects", function() {
          cy.visit(`/shipment-project/${DB_SHIPMENT_PROJECT_ID}`);
          cy.get("main.ShipmentProject").should("exist");
        });
        it("route - track", function() {
          cy.visit(`/track/${DB_SHIPMENT_ID}`);
          cy.get("main.Track").should("exist");
        });
      });
      describe("partners", function() {
        it("route - partner overview", function() {
          cy.visit("/partners");
          cy.get("main.PartnerOverview").should("exist");
        });
        it("route - partner", function() {
          cy.visit(`/partner/${DB_PARTNER_ID}`);
          cy.get("main.Partner").should("exist");
        });
        it("route - partner import", function() {
          cy.visit("/partner/import");
          cy.get("main.PartnerImport").should("exist");
        });
        it.skip("route - conversations", function() {
          cy.visit("/conversations");
          cy.get("main.ConversationsOverview").should("exist");
        });
        it.skip("route - conversation", function() {
          cy.visit(`/conversation/${DB_CONVERSATION_ID}`);
          cy.get("main.ConversationsOverview").should("exist");
        });
        it("route - directory", function() {
          cy.visit(`/directory`);
          cy.get("main.Directory").should("exist");
        });
      });
      describe("invoice", function() {
        it("route - invoice overview", function() {
          cy.visit(`/invoice-overview`);
          cy.get("main.InvoiceOverview").should("exist");
        });
        it.skip("route - invoice", function() {
          cy.visit(`/invoice/${DB_INVOICE_ID}`);
          cy.get("main.PartnerInvoice").should("exist");
        });
      });

      describe("address", function() {
        it("route - address overview", function() {
          cy.visit(`/locations`);
          cy.get("main.AddressOverview").should("exist");
        });
        it("route - address", function() {
          cy.visit(`/location/${DB_ADDRESS_ID}`);
          cy.get("main.Address").should("exist");
        });
        it("route - address import", function() {
          cy.visit(`/locations/import`);
          cy.get("main.AddressImport").should("exist");
        });
      });
      describe("priceList", function() {
        it("route - price list overview", function() {
          cy.visit(`/price-lists`);
          cy.get("main.PriceListOverview").should("exist");
        });
        it("route - price list", function() {
          cy.visit(`/price-list/${DB_PRICELIST_ID}`);
          cy.get("main.PriceList").should("exist");
        });
        it("route - price list import", function() {
          cy.visit(`/price-lists/import`);
          cy.get("main.PriceListImport").should("exist");
        });
      });
      describe("priceRequest", function() {
        it("route - price request", function() {
          cy.visit(`/price-request/${DB_PRICE_REQUEST_ID}`);
          cy.get("main.PriceRequest").should("exist");
        });
        it("route - price request overview", function() {
          cy.visit(`/price-requests`);
          cy.get("main.PriceRequestOverview").should("exist");
        });
        it("route - price request download", function() {
          cy.visit(`/price-requests/download`);
          cy.get("main.DataExport").should("exist");
        });
      });

      describe("analysis", function() {
        it("route - analysis", function() {
          cy.visit(`/analysis/${DB_ANALYSIS_ID}`);
          cy.get("main.Analysis").should("exist");
        });
        it("route - analysis overview", function() {
          cy.visit(`/analysis`);
          cy.get("main.Analyses").should("exist");
        });
      });
      describe("tender", function() {
        it("route - tender overview", function() {
          cy.visit(`/tenders`);
          cy.get("main.TenderOverview").should("exist");
        });
        it("route - tender single", function() {
          cy.visit(`/tender/${DB_TENDER_ID}`);
          cy.get("main.Tender").should("exist");
        });
      });

      describe("tools", function() {
        it("route - price lookup", function() {
          cy.visit(`/price-lookup`);
          cy.get("main.PriceLookup").should("exist");
        });
        it("route - route insights", function() {
          cy.visit(`/tools/route-insights`);
          cy.get("body").should("exist");
          cy.get("div").should("exist");
          cy.get("main").should("exist");
          cy.get("main.ToolsRouteInsight").should("exist");
        });
        it("route - ocean distance", function() {
          cy.visit(`/tools/ocean-distance`);
          cy.get("main.ToolsOceanDistance").should("exist");
        });
      });
    });
    describe("integrations", function() {
      it("route - connect", function() {
        cy.visit(`/connect/exact?id=1245687`);
        cy.get("main.ExactIntegration").should("exist");
      });
      it("route - connect success", function() {
        cy.visit(`/connect/success`);
        cy.get("main.IntegrationSuccess").should("exist");
      });
    });
    describe("register routes", function() {
      before(() => {
        cy.logout();
      });
      it("route - sign up", function() {
        cy.visit("/register");
        cy.get("main.Register").should("exist");
      });
      it("route - sign in", function() {
        cy.visit("/sign-in");
        cy.get("main.SignIn").should("exist");
      });
      it("route - forgot", function() {
        cy.visit("/forgot-password");
        cy.get("main.ForgotPassword").should("exist");
      });
      it("route - logout", function() {
        cy.visit("/logout");

        // should redirect to:
        cy.get("main.SignIn").should("exist");
      });
    });
    describe("route specials", function() {
      it("redirects when not logged on", function() {
        // goto specific url
        // user gets prompted for login
        // after login, the user should go to that specific page

        cy.logout();
        cy.visit(`/shipment/${DB_SHIPMENT_ID}`);

        // login form:
        cy.get("main.SignIn").should("exist");
        cy.get("input[name='email']").type(MAIN_USER.login);
        cy.get("input[name='password']").type(MAIN_USER.pass);
        cy.get("button[type='submit']").click();

        // should go to the intended page:
        cy.get("main.Shipment").should("exist");
        cy.url().should("include", "/shipment/");
        cy.url().should("include", DB_SHIPMENT_ID);
      });
      it.skip("logs in using a token", async function() {
        cy.visit(`/login-token/${tokenString}`);
        cy.get("main.Shipment").should("exist");
      });
    });
  });
});
