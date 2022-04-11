/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import faker from "faker";
import filterTests from '../filterTests';
const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };
const DB_PARTNER_ID = "C75701";

filterTests(['all'], () => {
  describe("Partners module", function () {
    before(() => {
      cy.login(MAIN_USER);
      cy.window().then(win => {
        // this allows accessing the window object within the browser
        const mUser = win.Meteor.user();
        expect(mUser).to.exist;
        expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
      });

      // will load files into storage:
      cy.visit("/partners");
      cy.get("main.PartnerOverview").should("exist");
      cy.saveLocalStorage(); // keeps user logged in
    });
    after(() => {
      cy.logout();
      cy.saveLocalStorage();
    });
    beforeEach(() => {
      cy.restoreLocalStorage(); // keeps logged in..
      cy.login(MAIN_USER);
      cy.callMethod("testing.resetCollections", {
        collections: ["accounts"]
      }).then((err, res) => console.log({ err, res }));
    });
    it("renders my partners in the overview", function () {
      cy.visit("/partners");
      cy.get("main.PartnerOverview").should("exist");
      cy.visualSnapshot(this.test, "initial");

      cy.log("check if a table is rendere with my partners:");

      cy.get("table tbody tr").should("have.length", 2);
    });
    it("allows me to add a new partner (non-existing)", function () {
      cy.visit("/partners");
      cy.get("main.PartnerOverview").should("exist");
      cy.get("form[role='search']").should("exist");
      cy.get("header.basic").should("exist");
      cy.get("table tbody tr").should("have.length", 2);

      cy.get("footer").should("exist");
      cy.getBySel("addPartnerBtn").click({ force: true });
      cy.get(".modal.transition.visible.active").should("exist");
      cy.get(".modal input.search").type("Partner");
      cy.get(".modal .item.addition").click();

      cy.get(".row.add-partner").should("be.visible");

      cy.get("#uniforms-0000-0001").click();
      cy.get("#uniforms-0000-0001 .menu.transition.visible > .item")
        .contains("carrier")
        .click();

      cy.get("input[name='firstName']")
        .type("Jan")
        .should("have.value", "Jan");
      cy.get("input[name='lastName']")
        .type("Pirewit")
        .should("have.value", "Pirewit");

      const email = faker.internet.email();
      cy.get("input[name='email']")
        .type(email)
        .should("have.value", email);

      cy.getBySel("modalConfirm").click();
      cy.get(".ui.small.modal.transition.visible.active").should("not.exist");
      cy.get(".modal .item")
        .first()
        .click();

      cy.url().should("include", "/partner");
    });
    it("allows me to link with an existing partner", function () {
      cy.get("main.PartnerOverview").should("exist");
      cy.get("form[role='search']").should("exist");
      cy.get("header.basic").should("exist");
      cy.get("table tbody tr").should("have.length", 2);

      cy.get("footer").should("exist");
      cy.getBySel("addPartnerBtn").click({ force: true });
      cy.get(".modal.transition.visible.active").should("exist");

      cy.get(".modal input.search").type("Unlinked");
      cy.get(".modal .dropdown .menu.transition.visible > :nth-child(2)").click({
        force: true
      });

      cy.get(".row.existing-partner").should("be.visible");
      cy.getBySel("modalConfirm").click();

      cy.get(".ui.small.modal.transition.visible.active").should("not.exist");

      cy.url().should("include", "/partner");
    });
    it("allows me to navigate the directory", function () {
      cy.visit("/partners");
      cy.get("main.PartnerOverview").should("exist");

      cy.log("go to directory");
      cy.getBySel("gotoDirectory").click();
      cy.get("main.Directory").should("exist");
      cy.get(".searchPanel").should("exist");
      cy.get(".resultsPanel").should("exist");
      const totalItems = 2;
      cy.get(".resultsPanel .directory-card").should("have.length", totalItems);

      cy.visualSnapshot(this.test, "directory");

      cy.log("search by name");
      cy.get(".searchPanel input[name='name']")
        .type("Carrier Beta")
        .should("have.value", "Carrier Beta");
      cy.get(".resultsPanel .directory-card").should("have.length", 1);

      cy.log("search by partners only");
      cy.get(".searchPanel .button.reset").click();
      cy.get(".resultsPanel .directory-card").should("have.length", totalItems);
      cy.get("input[type='checkbox'][name='partners']")
        .parent()
        .invoke("checkbox", "check");
      cy.get(".resultsPanel .directory-card").should("have.length", 1);

      cy.log("search by favorites");
      cy.get(".searchPanel .button.reset").click();
      cy.get(".resultsPanel .directory-card")
        .first()
        .find(".ui.star.rating")
        .click(); // method should be invoked
      cy.get("input[type='checkbox'][name='favorites']")
        .parent()
        .invoke("checkbox", "check");
      cy.get(".resultsPanel .directory-card").should("have.length", 1);
    });
    it("allows me to add master data to a partner", function () {
      cy.visit(`/partner/${DB_PARTNER_ID}`);
      cy.get("main.Partner").should("exist");

      cy.get(".segment.portal h3.name").should("have.text", "Carrier PlayCo");

      //#region website
      cy.log("anotate websites");
      cy.get(".segment.website").scrollIntoView();
      cy.get(".segment.website .list.viewItems  .item").should("have.length", 2);
      cy.get(".segment.website button.edit").click();
      cy.get(".ui.small.modal.transition.visible.active").should(
        "exist",
        "Modal should open"
      );

      cy.get(".ui.small.modal.transition.visible.active input[name='name']")
        .type("testName")
        .should("have.value", "testName");
      cy.get(".ui.small.modal.transition.visible.active input[name='url']")
        .type("www.testUrl.com")
        .should("have.value", "www.testUrl.com");
      cy.get(".ui.small.modal.transition.visible.active .button.approve").click();
      cy.get(".segment.website .list.viewItems .item").should("have.length", 2);
      //#endregion

      //#region contacts

      cy.get(".segment.contacts .ui.cards .card").should("have.length", 1);
      cy.get(".segment.contacts button.addContact").click();
      cy.get(".ui.small.modal.transition.visible.active").should(
        "exist",
        "Modal should open"
      );

      cy.get(".modal input[name='contactType']")
        .parent()
        .invoke("dropdown", "show");
      cy.get(".modal input[name='contactType']")
        .parent(".ui.dropdown")
        .find(".menu.transition.visible > .item")
        .contains("Sales")
        .click();

      cy.get(".modal input[name='mail']")
        .type("test@testUrl.com")
        .should("have.value", "test@testUrl.com");
      cy.get(".modal input[name='phone']")
        .type("1235468")
        .should("have.value", "1235468");
      cy.get(".ui.small.modal.transition.visible.active .button.approve").click();
      cy.get(".segment.contacts .ui.cards .card").should("have.length", 2);
      //#endregion
      //#region services
      cy.log("anotate services");
      cy.get(".segment.services button.edit").click();
      cy.allSubscriptionsReady();
      // cy.get("input[name='profile.services']")
      //   .parents(".selection.dropdown")
      //   .should("be.visible");
      cy.get("input[name='profile.services']")
        .parents(".selection.dropdown")
        .type("testService");
      // adding to selection:
      cy.get("input[name='profile.services']")
        .parent(".selection.dropdown")
        .find(".addition.selected")
        .click();
      cy.get(".segment.services button.save").click();
      cy.get(".segment.services .row .label").should("have.length", 1);
      //#endregion

      //#region certificates
      cy.log("anotate certificates");
      cy.get(".segment.certificates").scrollIntoView();
      cy.get(".segment.certificates button.edit").click();
      cy.allSubscriptionsReady();
      // cy.get("input[name='profile.certificates']")
      //   .parent()
      //   .should("be.visible");
      cy.get("input[name='profile.certificates']")
        .parents(".selection.dropdown")
        .type("testCertificate");
      // adding to selection:
      cy.get("input[name='profile.certificates']")
        .parent(".selection.dropdown")
        .find(".addition.selected")
        .click();
      cy.get(".segment.certificates button.save").click();
      cy.get(".segment.certificates .row .label").should("have.length", 1);
      //#endregion

      //#region Locations
      cy.log("anotate locations");
      cy.get(".segment.locations").scrollIntoView();
      cy.get(".segment.locations .cards .card").should("have.length", 2);
      cy.get(".segment.locations button").click();
      cy.get(".ui.small.modal.transition.visible.active").should(
        "exist",
        "Modal should open"
      );
      cy.get(".modal input[name='name']").type("testLocation");
      cy.get(".modal textarea[name='description']").type("test descriptions");
      cy.get(".modal input[name='address']").type("test Address");
      cy.get(".modal input[name='PC']").type("2600");
      cy.get(".modal input[name='place']").type("Berchem");
      cy.get(".modal input[name='country']")
        .parent()
        .find("input.search")
        .type("Belgium{rightarrow}");

      cy.get(".modal input[name='locationType']")
        .parent(".dropdown")
        .invoke("dropdown", "show");
      cy.get(".modal input[name='locationType']")
        .parent(".dropdown")
        .find(".menu.visible :nth-child(2)")
        .click();

      cy.get(".modal input[name='shippingModes']")
        .parent(".dropdown")
        .invoke("dropdown", "show");
      cy.get(".modal input[name='shippingModes']")
        .parent(".dropdown")
        .find(".menu.visible :nth-child(2)")
        .click();

      cy.get(".modal .button.approve").click();
      cy.allSubscriptionsReady();
      cy.get(".segment.locations .cards .card").should("have.length", 2);
      //#endregion

      //#region footprint
      cy.log("anotate footprint");
      cy.get(".segment.footprint").scrollIntoView();
      cy.get(".segment.footprint button.edit").click();
      cy.allSubscriptionsReady();
      // cy.get("input[name='profile.certificates']")
      //   .parent()
      //   .should("be.visible");
      cy.get("input[name='profile.footprint']")
        .parents(".selection.dropdown")
        .type("belgium")
        .find(".menu.visible .item.selected:first")
        .click();
      cy.get("input[name='profile.footprint']")
        .parents(".selection.dropdown")
        .type("france")
        .find(".menu.visible .item.selected:first")
        .click();
      cy.get(".segment.footprint .button.save").click();
      cy.get(".segment.footprint .row .item").should("have.length", 2);
      //#endregion
    });
    it("allows me to remove a partner", function () {
      cy.visit("/partner/C75701");
      cy.allSubscriptionsReady();
      cy.get("footer.segment");
    });
  });
});