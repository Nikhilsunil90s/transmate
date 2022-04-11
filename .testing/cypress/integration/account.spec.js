import filterTests from '../filterTests';
const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };

describe("Account", function () {
  before(() => {
    cy.login(MAIN_USER);
    cy.window().then(win => {
      // this allows accessing the window object within the browser
      const mUser = win.Meteor.user();
      expect(mUser).to.exist;
      expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
    });

    // will load files into storage:
    cy.visit("/settings/user-profile");
    cy.get("main.Settings").should("exist");
    cy.saveLocalStorage(); // keeps user logged in
  });
  after(() => {
    cy.logout();
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.login(MAIN_USER);
    cy.callMethod("testing.resetCollections", {
      collections: ["accounts"]
    }).then((err, res) => console.log(err, res));
  });
  filterTests(['all', 'account', 'ci'], () => {
    it("[own account] allows me to edit my personal account", function () {
      cy.visit("/settings/user-profile");
      cy.get("main.Settings").should("exist");
      cy.get(".segment").should("exist");
      cy.get("[data-test='sectionContent']").should("exist");

      // todo: test form
    });
    it("[own account] allows me to edit my security", function () {
      cy.visit("/settings/security");
      cy.get("main.Settings").should("exist");
      cy.get(".segment").should("exist");

      // todo: test form
    });
    it("[account-admin] allows me to edit account page", function () {
      cy.visit("/settings/account-profile");
      cy.get("main.Settings").should("exist");
      cy.get(".segment").should("exist");
      //cy.get(".segment.portal").should("exist");

      // todo: test form
    });
    it("[account-admin] allows me to edit account entities", function () {
      cy.visit("/settings/account-entities");
      cy.get("main.Settings").should("exist");
      cy.get(".segment").should("exist");

      // todo: test form
    });
    it("[account-admin] allows me to edit account users", function () {
      cy.visit("/settings/account-users");
      cy.get("main.Settings").should("exist");
      cy.get(".segment").should("exist");

      // todo: test form
    });

    it("[data-admin] allows me to edit fuel", function () {
      cy.visit("/settings/fuel");
      cy.get("main.Settings").should("exist");
      cy.get(".segment").should("exist");

      // todo: test form
    });
    it("[data-admin] allows me to edit conversions", function () {
      cy.visit("/settings/master-data/conversions");
      cy.get("main.Settings").should("exist");
      cy.get(".segment").should("exist");

      // todo: test form
    });
    it("[data-admin] allows me to edit projects", function () {
      cy.visit("/settings/master-data/projects");
      cy.get("main.Settings").should("exist");
      cy.get(".segment").should("exist");

      // todo: test form
    });
  });
});
