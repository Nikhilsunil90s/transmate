/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import filterTests from "../filterTests";
const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };
const BARE_SHIPMENT_ID = "2jG2mZFcaFzqaThYY"; // USER needs ENT2 entity
const RELEASEABLE_SHIPMENT_ID = "2jG2mZFcaFzqaThXX";
const SHIPMENT_WITH_COSTS = "2jG2mZFcaFzqaThcr";

function gotoCostSection(shipmentId) {
  cy.visit(`/shipment/${shipmentId}`);
  cy.waitForGraph("getShipmentMain");
  cy.waitForGraph("getPartnerForTag");
  cy.get("main.Shipment").should("exist");
  cy.get("main.Shipment section.costs").should("exist");
  cy.get("main.Shipment section.costs").scrollIntoView();
}

filterTests(["all", "ci"], () => {
  describe("Shipment", function() {
    describe("general", function() {
      before(() => {
        cy.login(MAIN_USER);
        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
        });

        // will load files into storage:
        cy.visit("/shipments");
        cy.get("main.ShipmentOverview").should("exist");
        cy.saveLocalStorage(); // keeps user logged in
      });
      beforeEach(() => {
        cy.restoreLocalStorage();
        cy.login(MAIN_USER);
        cy.callMethod("testing.resetCollections", {
          collections: ["shipments", "stages", "items"]
        });
      });
      it("[create] should be able to create a shipment", function() {
        cy.visit("/shipments/new");
        cy.get("main.ShipmentNew").should("exist");
        cy.visualSnapshot(this.test, "initial");

        cy.get("#uniforms-0000-0000 > .field > .ui > input").type("globex");
        cy.get("#uniforms-0000-0000 .options.expanded .option").should(
          "have.length",
          3
        );
        cy.get(
          "#uniforms-0000-0000 .options > :nth-child(1) > :nth-child(2)"
        ).click();
        cy.get("#uniforms-0000-0000 > .field > .ui > input").should(
          "have.value",
          "Globex  Mions"
        );

        // enter from:
        cy.get("#uniforms-0000-0002 > .field > .ui > input").type("globex");
        cy.get("#uniforms-0000-0002 .options.expanded .option").should(
          "have.length",
          3
        );
        cy.visualSnapshot(this.test, "searching to address");

        // enter to:
        cy.get(
          "#uniforms-0000-0002 .options > :nth-child(1) > :nth-child(3)"
        ).click();
        cy.get("#uniforms-0000-0002 > .field > .ui > input").should(
          "have.value",
          "Globex Spain"
        );

        // create shipment:
        cy.get("footer > button").click();
        cy.location("pathname").should("contain", "/shipment/");
        cy.waitForGraph("getShipmentMain");
        cy.get("main.Shipment").should("exist");
        cy.visualSnapshot(this.test, "shipment created");
      });
      it("[view] page should show me all segments", function() {
        cy.visit(`/shipment/${BARE_SHIPMENT_ID}`);

        cy.waitForGraph("getShipmentMain");

        cy.get("main.Shipment").should("exist");
        cy.get("main.Shipment .map").should("exist");
        cy.get("main.Shipment section.stages").should("exist");
        cy.get("main.Shipment section.item").should("exist");
        cy.get("main.Shipment section.costs").should("exist");
        cy.get("main.Shipment section.references").should("exist");
        cy.get("main.Shipment section.notes").should("exist");
        cy.get("main.Shipment section.history").should("exist");
      });
      it("[update] allow add item", function() {
        cy.visit(`/shipment/${BARE_SHIPMENT_ID}`);
        cy.waitForGraph("getShipmentMain");
        cy.get("main.Shipment").should("exist");
        // adding a new item:
        cy.get("main.Shipment section.item").scrollIntoView();
        cy.get("section.item footer .button").click();
        cy.getBySel("addItemBn").click();

        cy.get(".modal.visible.active").should("exist");
        cy.get("#uniforms-0001-0000")
          .type(10)
          .should("have.value", "10");
        cy.get(".right > .label").click();
        cy.get(".right .menu.transition.visible").should("be.visible");
        cy.get(".right .menu.transition.visible .scrolling.menu")
          .first()
          .find(".item")
          .first()
          .click();
        cy.get(".ui.modal .actions > .primary").click();
        cy.get(".ui.modal.transition.visible.active").should("not.exist");
      });
      it("[update] allow add references", function() {
        cy.visit(`/shipment/${BARE_SHIPMENT_ID}`);
        cy.waitForGraph("getShipmentMain");
        cy.get("main.Shipment").should("exist");
        // add some references:
        cy.get("main.Shipment section.references").scrollIntoView();

        cy.get("section.references .empty").should("exist");

        cy.get(
          "section.references > .ui > .item > .content > .section-header > .add"
        ).click();
        cy.get(".modal.transition.visible.active").should("be.visible");
        cy.get(".modal .selection.dropdown").click();
        cy.get(".modal .selection.dropdown")
          .find(".menu.transition.visible > .item")
          .contains("Shipper reference")
          .click();

        cy.get("input[name='ref']")
          .type("Lorem ipsum")
          .should("have.value", "Lorem ipsum");

        cy.get(".ui.small.modal .actions > .primary").click();
        cy.get(".modal.transition.visible.active").should("not.exist");
        cy.get(
          "section.references [data-test='sectionContent'] > .list > .item"
        ).should("have.lengthOf", 1);
      });
      it("[update] allow add note", function() {
        cy.visit(`/shipment/${BARE_SHIPMENT_ID}`);
        cy.waitForGraph("getShipmentMain");
        cy.get("main.Shipment").should("exist");
        // add some notes
        cy.get("main.Shipment section.notes").scrollIntoView();
        cy.get(
          "section.notes > .ui > .item > .content > .section-header > .add"
        ).click();
        cy.get(".modal.transition.visible.active").should("be.visible");
        cy.get(".modal .selection.dropdown").click();
        cy.get(".modal .selection.dropdown")
          .find(".menu.transition.visible > .item")
          .contains("Booking notes")
          .click();

        const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
        cy.get("textarea[name='text']").type(lorem);

        cy.get(".modal .actions > .primary").click();
        cy.get(".modal.transition.visible.active").should("not.exist");

        cy.get("section.notes .content > .list > .item").should(
          "have.lengthOf",
          1
        );
      });
      it("[footer]allows to cancel a shipment", function() {
        cy.visit(`/shipment/${BARE_SHIPMENT_ID}`);
        cy.waitForGraph("getShipmentMain");
        cy.get("main.Shipment").should("exist");

        cy.getBySel("ShipmentCancelBtn").click();
        cy.getBySel("confirmModal").should("exist");
        cy.getBySel("confirmButton").click();
        cy.getBySel("confirmModal").should("not.exist");

        // test if shipment has been updated (redirect to overview):
        cy.url().should("contain", "/shipments");
      });
      it("[Tracking] renders tracking page", function() {
        // check if tracking page exists:
        cy.visit(`/track/${BARE_SHIPMENT_ID}`);
        cy.get("main.track").should("exist");

        cy.visualSnapshot(this.test, "track-page");
      });
    });
    describe("stages", function() {
      before(() => {
        cy.login(MAIN_USER);
        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
        });

        // will load files into storage:
        cy.visit("/shipments");
        cy.get("main.ShipmentOverview").should("exist");
        cy.saveLocalStorage(); // keeps user logged in
      });
      beforeEach(() => {
        cy.restoreLocalStorage();
        cy.login(MAIN_USER);
        cy.callMethod("testing.resetCollections", {
          collections: ["shipments", "stages", "items"]
        }).then((err, res) => console.log(err, res));
      });
      it("[release stage] blocks release of stage - no items", function() {
        cy.visit(`/shipment/${BARE_SHIPMENT_ID}`);
        cy.get("main.Shipment").should("exist");
        cy.get("main.Shipment section.stages").should("exist");
        cy.getBySel("StageReleaseBtn").should("exist"); // button is showing but no action
      });
      it("[release stage] allows release of stage", function() {
        cy.visit(`/shipment/${RELEASEABLE_SHIPMENT_ID}`);
        cy.get("main.Shipment").should("exist");

        cy.log("testing out releasing the shipment");
        cy.get("main.Shipment section.stages").should("exist");
        cy.getBySel("StageReleaseBtn").click();

        cy.getBySel("modal").should("be.visible");
        cy.getBySel("modalConfirm").click();
        cy.getBySel("modal").should("not.exist");

        cy.get(".segment.stage .status").should("have.text", "planned");

        cy.log("test out back to draft");
        cy.getBySel("StageDraftBtn").click();
        cy.getBySel("modal").should("be.visible");
        cy.getBySel("modalConfirm").click();
        cy.getBySel("modal").should("not.exist");

        // // modal closes -> now the status should be planned:
        // cy.get(".status").should("have.text", "draft");
      });
      it("[split][merge] allows to split a stage", function() {
        cy.visit(`/shipment/${BARE_SHIPMENT_ID}`);
        cy.get("main.Shipment").should("exist");
        cy.get("main.Shipment section.stages").should("exist");

        cy.get(".stages .stage").should("have.length", 1);

        cy.getBySel("StageSplitBtn").should("exist");
        cy.getBySel("StageSplitBtn").click();
        cy.getBySel("modal").should("exist");

        // picking address stop:
        cy.get("[data-test='addressInput'] input")
          .clear()
          .type("Globex");
        cy.get(".input-address .options.expanded").should("exist");
        cy.get(
          ".input-address .options.expanded > .group:eq(0) > .option:eq(0)"
        ).click();

        cy.getBySel("modalConfirm").click();
        cy.getBySel("modal").should("not.exist");

        // test stages
        cy.get(".stages .stage").should("have.length", 2);

        // testing merging stages:
        // this is on the first stage
        cy.getBySel("StageMergeBtn").click();
        cy.getBySel("modal").should("be.visible");
        cy.getBySel("modalConfirm").click();
        cy.getBySel("modal").should("not.exist");

        cy.get(".stages .stage").should("have.length", 1);
      });
      it.skip("[confirm]", function() {
        // to redo completely:
        cy.log("test out confirm shipment");
        cy.get(".button.release").click();
        cy.get(".ui.small.modal.transition.visible.active .yes.button").click();

        // date pickers ->
        cy.log("enter pickup times");
        cy.get(".button.schedule").click();
        cy.get(".ui.small.modal.transition.visible.active").should("exist"); // modal with date confirmation
        cy.get("input[name='pickup-arrival-date']")
          .parent()
          .find(".picker__input")
          .click();
        cy.get("input[name='pickup-arrival-date']")
          .parent()
          .find(".picker__day")
          .contains("21")
          .click();
        //cy.get("input[name='pickup_arrival_date']").should("eq") "format = YYYY-MM-DD"
        cy.get("input[name='pickup-arrival-time']").type("{leftarrow}07:00");

        cy.get("input[name='pickup-departure-date']")
          .parent()
          .find(".picker__input")
          .click();
        cy.get("input[name='pickup-departure-date']")
          .parent()
          .find(".picker__day")
          .contains("21")
          .click();
        //cy.get("input[name='pickup_arrival_date']").should("eq") "format = YYYY-MM-DD"
        cy.get("input[name='pickup-departure-time']").type("{leftarrow}08:00");
        cy.get(
          ".ui.small.modal.transition.visible.active .button.approve"
        ).click();
        cy.get(".status").should("have.text", "started");

        cy.log("enter delivery times");
        cy.get(".button.schedule").click();
        cy.get(".ui.small.modal.transition.visible.active").should("exist"); // modal with date confirmation
        cy.get("input[name='delivery-arrival-date']")
          .parent()
          .find(".picker__input")
          .click();
        cy.get("input[name='delivery-arrival-date']")
          .parent()
          .find(".picker__day")
          .contains("22")
          .click();

        // testing out the timestamp button:
        cy.get(".button.timeStamp[data-key='deliveryDeparture']").click();

        cy.get(
          ".ui.small.modal.transition.visible.active .button.approve"
        ).click();
        cy.get(".status").should("have.text", "completed");

        cy.log("checking on history section");
        cy.get("section.history .ui.table tr").should($rows => {
          expect($rows).to.have.length(10);
        });
      });
      it.skip("allows a carrier to confirm if allocated & in started status", function() {});
    });

    describe("costs", function() {
      before(() => {
        cy.login(MAIN_USER);
        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
        });

        // will load files into storage:
        cy.visit("/shipments");
        cy.get("main.ShipmentOverview").should("exist");
        cy.saveLocalStorage(); // keeps user logged in
      });
      beforeEach(() => {
        cy.restoreLocalStorage();
        cy.login(MAIN_USER);
        cy.callMethod("testing.resetCollections", {
          collections: ["shipments", "stages", "items"]
        }).then(err => err && console.log(err));
      });
      it("[view] cost section with cost overview", function() {
        gotoCostSection(SHIPMENT_WITH_COSTS);

        cy.get("table.costDetail").should("exist");
        cy.get("table.costDetail tbody > tr").should("have.length", 3);
      });
      it("[view] shows vendor if different from original", function() {
        gotoCostSection(SHIPMENT_WITH_COSTS);

        cy.get("table.costDetail").should("exist");
        cy.get("table.costDetail tbody > tr").should("have.length", 3);

        // last item is of different sellerId...
        cy.get("table.costDetail tbody > tr:eq(2) > td:eq(0)").should($el => {
          expect($el).to.contain("Beta");
        });
      });
      it("[reset] costs can be reset", function() {
        gotoCostSection(SHIPMENT_WITH_COSTS);

        cy.get("table.costDetail").should("exist");
        cy.get("main.Shipment section.costs").scrollIntoView();
        cy.getBySel("resetCostsBtn").click({ force: true });
        cy.getBySel("confirmModal").should("exist");
        cy.getBySel("confirmButton").click();
        cy.getBySel("confirmModal").should("not.exist");
        cy.get("table.costDetail").should("not.exist");
      });
      it("[manual] select carrier", function() {
        gotoCostSection(BARE_SHIPMENT_ID);

        cy.getBySel("selectCarrierManual").click({ force: true });
        cy.getBySel("modal").should("exist");

        // search for the partner & select
        cy.getBySel("modal")
          .find("input")
          .type("carrier")
          .parent(".dropdown")
          .find(".menu > .item")
          .first()
          .click();

        cy.getBySel("modalConfirm").click();
        cy.getBySel("selectedCarrier").should("exist");
        cy.getBySel("changeCarrierBtn").should("exist");
      });
      it("[sidepanel] change carrier", function() {
        gotoCostSection(SHIPMENT_WITH_COSTS);

        // click the change on top of the list
        cy.getBySel("changeCarrierBtn").should("exist");
        cy.getBySel("changeCarrierBtn").click();

        cy.get(".overlay.right.visible.sidebar").should("exist");
        cy.get(".overlay.right.visible.sidebar").should("be.visible");
      });
      it("[sidepanel] shows sidepanel for insight", function() {
        gotoCostSection(SHIPMENT_WITH_COSTS);

        // click the change on top of the list
        cy.getBySel("insightsBtn").click();
        cy.get(".overlay.right.visible.sidebar").should("exist");
        cy.get(".overlay.right.visible.sidebar").should("be.visible");
      });
      it("[delete] cost can be deleted", function() {
        gotoCostSection(SHIPMENT_WITH_COSTS);

        cy.get("table.costDetail").should("exist");
        cy.get("table.costDetail tbody > tr").should("have.length", 3);
        cy.getBySel("removeCostBtn")
          .first()
          .click({ force: true }); // it is hidden (visible on hover)
        cy.getBySel("confirmModal").should("exist");
        cy.getBySel("confirmButton").click();
        cy.getBySel("confirmModal").should("not.exist");
        cy.get("table.costDetail tbody > tr").should("have.length", 2);
      });
      it("[approve] cost can be approved", function() {
        gotoCostSection(SHIPMENT_WITH_COSTS);

        cy.get("table.costDetail").should("exist");
        cy.get("table.costDetail tbody > tr").should("have.length", 3);
        cy.getBySel("approveCostBtn").should("exist");
        cy.getBySel("approveCostBtn")
          .first()
          .click({ force: true }); // it is hidden (visible on hover)

        // button is removed once approved/declined
        cy.getBySel("approveCostBtn").should("not.exist");
        cy.get("table.costDetail tbody > tr:eq(2) > td:eq(0) > span").should(
          "exist"
        );
        cy.get("table.costDetail tbody > tr:eq(2) > td:eq(0) > span").should(
          "contain",
          "Approved"
        );
      });
      it("[decline] cost can be declined", function() {
        gotoCostSection(SHIPMENT_WITH_COSTS);

        cy.get("table.costDetail").should("exist");
        cy.get("table.costDetail tbody > tr").should("have.length", 3);
        cy.getBySel("declineCostBtn")
          .first()
          .click({ force: true }); // it is hidden (visible on hover)
        cy.getBySel("modal").should("exist");
        cy.getBySel("modal")
          .find(".selection.dropdown")
          .click()
          .find(".menu .item")
          .first()
          .click();

        cy.getBySel("modal")
          .find("textarea")
          .type("Some text");

        cy.getBySel("modalConfirm").click();
        cy.getBySel("modal").should("not.exist");

        // button is removed once approved/declined
        cy.getBySel("declineCostBtn").should("not.exist");
        cy.get("table.costDetail tbody > tr:eq(2) > td:eq(0) > span").should(
          "exist"
        );
        cy.get("table.costDetail tbody > tr:eq(2) > td:eq(0) > span").should(
          "contain",
          "Declined"
        );
      });
      it("[advanced] allows to save entity", function() {
        gotoCostSection(SHIPMENT_WITH_COSTS);

        cy.get("section.costs .accordion > .title")
          .first()
          .click();

        cy.get("section.costs .accordion .content.active").should("exist");
        cy.get("section.costs .entityField")
          .find("input")
          .type("ent")
          .parent(".dropdown")
          .find(".menu .item")
          .first()
          .click();

        cy.get("section.costs .entityField").should("exist"); // page reloads?
        cy.get("section.costs .entityField .text").should($el => {
          expect($el).to.contain("ENT1");
        });
      });
    });
    // FIXME: these tests fail:
    describe.skip("cost lookup", function() {
      before(() => {
        cy.login(MAIN_USER);
        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
        });

        // will load files into storage:
        cy.visit("/shipments");
        cy.get("main.ShipmentOverview").should("exist");
        cy.saveLocalStorage(); // keeps user logged in
      });
      beforeEach(() => {
        cy.restoreLocalStorage();
        cy.login(MAIN_USER);
        cy.callMethod("testing.resetCollections", {
          collections: ["shipments", "stages", "items"]
        }).then((err, res) => console.log(err, res));
      });
      it("shows cost options", function() {
        // !! this is mocked -> set the env variable
        gotoCostSection(BARE_SHIPMENT_ID);

        // in the cost section:
        cy.get("section.costs .lookupResults").should("exist");
        cy.get("section.costs .lookupResults .list .item").should(
          "have.length",
          1
        );

        // in the side bar:
        cy.getBySel("insightsBtn").click();
        cy.get(".overlay.right.visible.sidebar").should("exist");
        cy.get(".overlay.right.visible.sidebar").should("be.visible");

        cy.get(".sidebar .segment.price-list").should("exist");
      });
      it("[select] cost options", function() {
        // !! this is mocked -> set the env variable
        gotoCostSection(BARE_SHIPMENT_ID);

        // in the cost section:
        cy.get("section.costs .lookupResults").should("exist");
        cy.get("section.costs .lookupResults .list .item")
          .first()
          .find("[data-test='selectCostOptionBtn']")
          .click();

        // page will reload
        cy.get("section.costs .lookupResults").should("not.exist");
      });
    });
  });
});
