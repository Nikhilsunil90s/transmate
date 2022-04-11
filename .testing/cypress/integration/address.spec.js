/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import filterTests from "../filterTests";
const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };
const DB_ADDRESS_ID = "j958tYA872PAogTDq";
const ADDRESS_COUNT = 5;

describe("Address module", function() {
  before(() => {
    cy.login(MAIN_USER);
    cy.window().then(win => {
      // this allows accessing the window object within the browser
      const mUser = win.Meteor.user();
      expect(mUser).to.exist;
      expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
    });

    // will load files into storage:
    cy.visit("/locations");
    cy.get("main.AddressOverview").should("exist");
    cy.saveLocalStorage(); // keeps user logged in
  });
  beforeEach(() => {
    cy.restoreLocalStorage(); // keeps logged in..
    cy.login(MAIN_USER);
    cy.callMethod("testing.resetCollections", {
      collections: ["addresses"]
    }).then((err, res) => console.log(err, res));
  });
  filterTests(["all", "address", "ci"], () => {
    it("allows me to see my addresses", function() {
      cy.visit("/locations");
      cy.get("main.AddressOverview").should("exist");
      cy.get("table").should("be.visible");
      cy.visualSnapshot(this.test, "initial");
      cy.log("check if a table is rendere with my addresses:");
      cy.get("table tbody tr").should("have.length", ADDRESS_COUNT);
      cy.visualSnapshot(this.test, "initial");
    });
    it("allows me to edit an address in my addressbook", function() {
      cy.visit(`/location/${DB_ADDRESS_ID}/info`);
      cy.get("main.Address").should("exist");
      cy.visualSnapshot(this.test, "address-location");

      cy.get(".tabs.menu .item")
        .contains("Address")
        .click();
      cy.get(".segment.info").should("be.visible");
      cy.get(".segment.info h3.section-header").should($el => {
        expect($el).to.contain("Globex");
      });

      //#region notes
      cy.get(".tabs.menu .item")
        .contains("Notes")
        .click();

      //#region notes
      cy.log("adding notes to the location");
      cy.get(".segment.notes").should("exist");

      // add some testing for saving the notes here...
      //#endregion

      //#region safety
      cy.get(".tabs.menu .item")
        .contains("Profile")
        .click();
      cy.log("adding safety instructions to the location");
      cy.get(".segment.safety footer .button").click();
      cy.get(".ui.small.modal.transition.visible.active").should(
        "exist",
        "Modal should open"
      );

      cy.get(".modal input[type='checkbox']")
        .first()
        .check({ force: true });
      cy.getBySel("modalConfirm").click();
      cy.get(".ui.small.modal.transition.visible.active").should("not.exist");
      //#endregion

      //#region contacts
      cy.get(".segment.contacts").scrollIntoView();
      cy.get(".segment.contacts footer .button").click();
      cy.get(".ui.small.modal.transition.visible.active").should(
        "exist",
        "Modal should open"
      );

      cy.get("#uniforms-0002-0000")
        .click()
        .find(".menu.transition.visible > .item")
        .contains("General")
        .click();

      cy.get("input[name='firstName']").type("firstTest");
      cy.get("input[name='lastName']").type("lastTest");
      cy.get("input[name='mail']").type("testMail@test.com");

      cy.getBySel("modalConfirm").click();
      cy.get(".ui.small.modal.transition.visible.active").should("not.exist");

      cy.get(".divided.items").should("exist");
      cy.get(".divided.items > .item").should("have.length", 1);
      //#endregion
    });
    it("allows me to remove an address from my address book", function() {
      cy.visit(`/location/${DB_ADDRESS_ID}`);
      cy.get("main.Address").should("exist");
      cy.get("footer button").should("exist");

      cy.get("footer button.delete").click();
      cy.get(".ui.small.modal.transition.visible.active").should(
        "exist",
        "Modal should open"
      );
      cy.getBySel("confirmButton").click();
      cy.get(".ui.small.modal.transition.visible.active").should("not.exist");
      cy.get("table").should("be.visible");
      cy.get("table tbody tr").should("have.length", ADDRESS_COUNT - 1);
    });
    it.skip("allows me to search an address and add it to my addressBook", function() {
      cy.visit("/locations");
      cy.get("table").should("be.visible");
      cy.get("footer .primary.button").click();

      cy.get(".ui.small.modal.transition.visible.active").should(
        "exist",
        "Modal should open"
      );
      cy.get(".modal input[name='name']").type("testName");
      cy.get(".modal input[name='input']").type("Grote Markt1, 2000 Antwerpen");
    });
  });
});
