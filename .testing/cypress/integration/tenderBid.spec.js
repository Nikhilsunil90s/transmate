/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import filterTests from '../filterTests';

filterTests(['all'], () => {
  describe("tender module - bidder", function () {
    beforeEach(() => {
      cy.resetCollections(["tenders"]);
      const user = {
        login: "carrier@transmate.eu",
        pass: "TransmateDemo",
        firstName: "Carrier"
      };
      cy.login(user);

      cy.window().then(win => {
        // this allows accessing the window object within the browser
        const mUser = win.Meteor.user();
        expect(mUser).to.exist;
        expect(mUser.profile.first).to.equal(user.firstName);
        expect(mUser.emails[0].address).to.equal(user.login);
      });
    });
    it("should be able to access an (open) tender", function () {
      cy.visit("/tender/pYFLYFDMJEnKADY3h");
      cy.visualSnapshot(this.test, "initial");
      cy.location("pathname").should("contain", "/tender/");

      cy.get("input").uploadFile("test.pdf");
    });
  });
});