/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import filterTests from "../filterTests";
const DB_PRICE_REQUEST_ID = "zgSR5RRWJoHMDSEDy";
const DB_SHIPMENT_ID = "2jG2mZFcaFzqaThXX";
const DB_SHIPMENT_ID_WITH_PR = "2jG2mZFcaFzqaThcr";
const LINKED_PR = "zgSR5RRWJoHMDSEDy";
const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };
const CARRIER_USER = {
  login: "user@carrierBeta.test",
  pass: "TransmateDemo"
};
function dateTitle() {
  var today = new Date();
  return (
    ("0" + (today.getMonth() + 1)).slice(-2) +
    ("0" + today.getDate()).slice(-2) +
    "-"
  );
}

// data:
// DB_PRICE_REQUEST_ID price request in requested status - carrier beta can place bid
// DB_SHIPMENT_ID shipment without a price request attached to it

filterTests(["all", "ci"], () => {
  describe("Price request", function() {
    describe("intitation", function() {
      before(() => {
        cy.login(MAIN_USER);
        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
        });

        // will load files into storage:
        cy.visit("/price-requests");
        cy.get("main.PriceRequestOverview").should("exist");
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
        cy.callMethod("testing.resetCollections", {
          collections: ["priceRequests", "shipments"]
        }).then((err, res) => console.log(err, res));
      });
      it("go to existing pr from shipment", function() {
        cy.visit(`/shipment/${DB_SHIPMENT_ID_WITH_PR}`);

        // wait untill all data is fetched:
        cy.waitForGraph("getShipmentMain");
        cy.waitForGraph("getPartnerForTag");

        cy.get("main.Shipment").should("exist");
        cy.get("#costs").scrollIntoView();
        cy.getBySel("openLinkedPriceRequest").click();
        cy.url().should("include", "/price-request/"); // should be redirected to page
        cy.url().should("include", LINKED_PR);
        cy.get(".segment.general").should("exist");
      });
      it("allows to initiate a price request from the shipment page", function() {
        cy.visit(`/shipment/${DB_SHIPMENT_ID}`);

        // wait untill all data is fetched:
        cy.waitForGraph("getShipmentMain");
        cy.waitForGraph("getPartnerForTag");

        cy.get("main.Shipment").should("exist");
        cy.get("#costs").scrollIntoView();
        cy.getBySel("initiatePriceRequest").click();
        cy.getBySel("confirmNewPriceRequest").should(
          "exist",
          "Modal should open"
        );

        cy.get("[data-test='confirmButton']").click(); // we are creating a PR

        cy.url().log();

        cy.url().should("include", "/price-request/"); // should be redirected to page
        cy.waitForGraph("getPriceRequestForPage");

        cy.get("main.PriceRequest").should("exist");
        cy.get(".segment.general").should("exist");

        // view data tab:
        cy.get(".tabs.menu").should("exist");
        cy.getBySel("dataTab").click();
      });

      // very unstable....
      it.skip("should allow to postpone the deadline", function() {
        let testObj = {};
        const set = update => {
          testObj = {
            ...testObj,
            ...update
          };
        };
        cy.visit(`/price-request/${DB_PRICE_REQUEST_ID}`);
        cy.waitForGraph("getPriceRequestForPage");

        cy.get("main.PriceRequest").should("exist");
        cy.get(".segment.general").should("exist");

        cy.get(".segment.settings").scrollIntoView();
        cy.get(".segment.settings ");

        cy.getBySel("dueDate")
          .find("input")
          .should($el => {
            if ($el) {
              const dueDate = $el.first().val();
              cy.log(`old dueDate: ${dueDate}`);
            }
          });

        cy.getBySel("postponeDeadline").click();

        cy.getBySel("modal").should("be.visible");

        cy.get("[data-test='modal'] form .input").click();

        cy.get(".top.left.flowing.popup thead i.chevron.right").click();
        cy.get(".top.left.flowing.popup").should("exist");
        cy.get(
          ".top.left.flowing.popup tbody > :nth-child(2) > :nth-child(2) "
        ).click({ force: true });
        cy.get(".top.left.flowing.popup").should("exist");
        cy.get(
          ".top.left.flowing.popup tbody > :nth-child(1) > :nth-child(1) "
        ).click({ force: true });
        cy.get(".top.left.flowing.popup").should("exist");
        cy.get(
          ".top.left.flowing.popup tbody > :nth-child(1) > :nth-child(1) "
        ).click({ force: true });

        cy.getBySel("modalConfirm").click();
        cy.get(".segment.settings").scrollIntoView();

        cy.getBySel("dueDate")
          .find("input")
          .should($el => {
            if ($el) {
              const dueDate = $el.first().val();
              set({ newDate: dueDate });
              cy.log(`new dueDate: ${dueDate}`);
            }
          });

        // dificult to test the 2 values as everything is async
      });

      it("should be able to view data", function() {
        cy.visit(`/price-request/${DB_PRICE_REQUEST_ID}`);
        cy.waitForGraph("getPriceRequestForPage");

        cy.get("main.PriceRequest").should("exist");
        cy.get(".menu").should("exist");
        cy.getBySel("dataTab").click();
        cy.get(".segment.items").should("exist");

        cy.get("section.items").should("exist");
        cy.get("section.items table").should("exist");

        cy.get("tbody[role='rowgroup']").should("exist");
      });

      it("should be able to set to draft", function() {
        cy.visit(`/price-request/${DB_PRICE_REQUEST_ID}`);
        cy.waitForGraph("getPriceRequestForPage");

        cy.get("main.PriceRequest").should("exist");

        cy.getBySel("setToDraft").click();
        cy.getBySel("confirmButton").click();
        cy.getBySel("confirmModal").should("not.exist");

        // wait for update to finish:
        cy.waitForGraph("updatePriceRequestStatus");

        cy.get(".segment.general").scrollIntoView();
        cy.getBySel("priceRequestStatus").should($el => {
          expect($el).to.contain("draft");
        });
      });

      it("should be able to select partners", function() {
        cy.visit(`/price-request/${DB_PRICE_REQUEST_ID}/partners`);
        cy.waitForGraph("getPriceRequestForPage");

        cy.get("main.PriceRequest").should("exist");
        cy.get(".segment.partners").should("exist");

        // remove
        cy.get(
          ".segment.partners table :nth-child(2) > :nth-child(8) > .buttons > .button"
        ).click();
        cy.getBySel("confirmButton").click();
        cy.get(".segment.partners table > tbody > tr").should("have.length", 1);
        // add carrier "carrier"
        cy.getBySel("editPartners").click();
        cy.getBySel("modal").should("exist");
        cy.get(".search.selection > input").type("carrier");

        cy.get(".search.selection .menu.visible > :nth-child(1)").click();
        cy.getBySel("modalConfirm").click();
        cy.getBySel("modal").should("not.exist");

        cy.get(".segment.partners table > tbody > tr").should("have.length", 2);
      });

      it("should be able to view analytics", function() {
        cy.visit(`/price-request/${DB_PRICE_REQUEST_ID}/analytics`);
        cy.waitForGraph("getPriceRequestForPage");

        cy.get("main.PriceRequest").should("exist");
        cy.get(".segment.analytics").should("exist");
      });

      it("should be able to change the title", function() {
        cy.visit(`/price-request/${DB_PRICE_REQUEST_ID}/general`);
        cy.waitForGraph("getPriceRequestForPage");

        cy.get("main.PriceRequest").should("exist");
        cy.get(".segment.general").should("exist");
        cy.get(".segment.general .content > p").should($el => {
          // indicates the data has loaded
          expect($el).to.contain.text("TEST - price request");
        });
        cy.get(".segment.general").scrollIntoView();
        // must be in draft to change the title:
        cy.getBySel("setToDraft").click();
        cy.getBySel("confirmModal").should("be.visible");
        cy.getBySel("confirmButton").click();
        cy.getBySel("confirmModal").should("not.exist");

        cy.getBySel("changeTitle").click();
        cy.get(".modal.visible.active").should("exist");

        const NEW_TITLE = "new title";
        cy.get("input[name='title']")
          .clear()
          .type(NEW_TITLE)
          .should("have.value", NEW_TITLE);
        cy.get(".modal .primary.button").click();
        cy.get(".modals.visible.active").should("not.exist");

        cy.get(".segment.general .content > p").should($el => {
          // indicates the data has loaded
          expect($el).to.contain.text(NEW_TITLE);
        });
      });
    });

    describe("bidding", function() {
      before(() => {
        cy.login(CARRIER_USER);
        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(CARRIER_USER.login);
        });

        // will load files into storage:
        cy.visit("/price-requests");
        cy.get("main.PriceRequestOverview").should("exist");
        cy.saveLocalStorage(); // keeps user logged in
      });
      after(() => {
        cy.logout();
        cy.saveLocalStorage();
      });
      beforeEach(() => {
        cy.restoreLocalStorage(); // keeps logged in..
        cy.login(CARRIER_USER);
        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(CARRIER_USER.login);
        });
        cy.callMethod("testing.resetCollections", {
          collections: ["priceRequests", "shipments"]
        }).then((err, res) => console.log(err, res));
      });
      it("allows a bidder to see the price request in the overview", function() {
        cy.visit("/price-requests");
        cy.get("main.PriceRequestOverview").should("exist");

        cy.get("main.PriceRequestOverview table").should("exist");
        cy.get("main.PriceRequestOverview table").should("exist");
        cy.get("table.dataTable tbody tr").should("have.length", 1);

        cy.get("table.dataTable tr > :nth-child(2) > a").should($el => {
          // indicates the data has loaded
          expect($el).to.contain.text("placeYourBid");
        });
      });
      it("allows a bidder to view his price requests", function() {
        cy.visit(`/price-request/${DB_PRICE_REQUEST_ID}`);
        cy.waitForGraph("getPriceRequestForPage");

        cy.get("main.PriceRequest").should("exist");
        cy.get(".segment.general").should("exist");
        cy.get(".segment.general .content > p").should($el => {
          // indicates the data has loaded
          expect($el).to.contain.text("TEST - price request");
        });

        cy.get(".tabs.menu").should("exist");
        cy.getBySel("dataTab").click();

        cy.get("section.biddingControl").should("exist");
        cy.get("section.biddingControl").scrollIntoView();
        cy.get(
          "section.biddingControl tbody > :nth-child(2) > :nth-child(2) > a"
        ).should($el => {
          expect($el).to.contain.text("placeYourBid");
        });

        cy.get("section.items").should("exist");
        cy.get("section.items table").should("exist");

        cy.get("tbody[role='rowgroup']").should("exist");

        cy.log("bidder will make an offer:");
        //#region bidding
        cy.getBySel("simpleBid").should("exist");
        cy.getBySel("simpleBid").scrollIntoView();
        cy.getBySel("simpleBid")
          .find("tr > :nth-child(2) input[type='number']")
          .clear()
          .type(1000);

        cy.getBySel("simpleBid")
          .find("tr > :nth-child(2) .search.dropdown > input")
          .type("usd", { force: true });

        cy.getBySel("simpleBid")
          .find("tr > :nth-child(2) .dropdown.label")
          .find(".menu.transition.visible > .item")
          .contains("USD")
          .click();

        cy.getBySel("simpleBid")
          .find("tr > :nth-child(2) .search.dropdown > input")
          .blur();

        cy.getBySel("simpleBid")
          .find("tr > :nth-child(3) input[type='text']")
          .type("test comment", { force: true });

        cy.getBySel("simpleBid")
          .find("textarea")
          .click()
          .type("some more notes here...");

        cy.get(
          ".ui.warning.floating.message.s-alert-bottom.s-alert-show"
        ).should("exist");
        cy.getBySel("confirmBidWarning").should("exist");

        cy.getBySel("confirmBid").click();
        //#endregion

        // need to know the update is in:
        cy.getBySel("confirmBidWarning").should("not.exist");
        cy.waitForGraph("placeSimpleBidPriceRequest");

        // check for bid control to be modified
        // status should have changed
        cy.get("section.biddingControl").scrollIntoView();
        cy.get(
          "section.biddingControl tbody > :nth-child(2) > :nth-child(2) > a"
        ).should($el => {
          expect($el).to.contain.text("offered");
        });

        // item in the table should be flagged
        cy.get("section.items").scrollIntoView();
        cy.get('[role="rowgroup"] > [role="row"] > :nth-child(7)').should(
          "have.class",
          "positive"
        );
        cy.get('[role="rowgroup"] > [role="row"] > :nth-child(8)').should(
          $el => {
            expect($el).to.contain.text("pending");
          }
        );
        cy.log("offered successfully!!");
      });
      it("allows a bidder to view the shipment", function() {
        cy.visit(`/shipment/${DB_SHIPMENT_ID_WITH_PR}`);
        cy.waitForGraph("getShipmentMain");

        cy.get("main.Shipment").should("exist");
        cy.get("section.stages").should("exist");
        cy.get("section.costs").should("not.exist");
      });
    });
  });
});
