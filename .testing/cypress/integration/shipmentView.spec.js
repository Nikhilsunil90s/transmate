/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };
const VIEW_ID = "2jG2mZFcaFzqaThYY";
import filterTests from '../filterTests';

filterTests(['all','ci'], () => {
  describe("shipment view", function () {
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
        collections: ["shipments"]
      }).then((err, res) => console.log(err, res));
    });
    it("[view] should show view edit page", function () {
      cy.visit(`/shipments/view/${VIEW_ID}`);
      cy.get("main.ShipmentsView").should("exist");
      cy.visualSnapshot(this.test, "initial");
    });
  });
});