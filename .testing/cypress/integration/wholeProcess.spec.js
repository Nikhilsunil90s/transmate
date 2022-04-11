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
        // cy.location("pathname").should("contain", "/shipment/");
        // cy.waitForGraph("getShipmentMain");
        // cy.get("main.Shipment").should("exist");
        // cy.visualSnapshot(this.test, "shipment created");

        // go to items 
        cy.get("main.Shipment section.item").scrollIntoView();
        cy.get("section.item footer .button").click();
        cy.get(".modal.visible.active").should("exist");
        cy.get("#uniforms-0002-0000").type(1)

        cy.get(".modal > .content > form > .fields > .field > .ui > .dropdown")
          .click()
        cy.get(".right .menu.transition.visible").should("be.visible");
        cy.get(".right .menu.transition.visible .scrolling.menu")
          .find(".item")
          .contains("span","Pallet")
          .click();
        cy.get(".actions")
          .contains("button","Save")
          .click()
      });

    //   // price request
    //   cy.getBySel("modal")
    //       .find("input")
    //       .type("carrier")
    //       .parent(".dropdown")
    //       .find(".menu > .item")
    //       .first()
    //       .click();

    //     cy.getBySel("modalConfirm").click();
    //     cy.getBySel("selectedCarrier").should("exist");
    //     cy.getBySel("changeCarrierBtn").should("exist");
    });
});
});
