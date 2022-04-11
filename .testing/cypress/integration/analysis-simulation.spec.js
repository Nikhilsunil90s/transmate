/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import filterTests from '../filterTests';
const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };
const ANALYSIS_FULL = "HA9jM7Eqo4KWLDBne";
const ANALYSIS_BARE = "cJn9oYi5YWx8t9fwQ";

filterTests(['all'], () => {
  describe("analysis simulation", function () {
    before(() => {
      cy.login(MAIN_USER);
      cy.window().then(win => {
        // this allows accessing the window object within the browser
        const mUser = win.Meteor.user();
        expect(mUser).to.exist;
        expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
      });

      // will load files into storage:
      cy.visit("/analysis");
      cy.get("main.Analyses").should("exist");
      cy.saveLocalStorage(); // keeps user logged in
    });
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.login(MAIN_USER);
      cy.callMethod("testing.resetCollections", {
        collections: ["analysis", "analysisSimulation"]
      }).then((err, res) => console.log(err, res));
    });
    it("should show my analysis in overview", function () {
      cy.visit("/analysis");
      cy.get("main.Analyses").should("exist");
      cy.get("main.Analyses table").should("exist");
      cy.get("table.dataTable tbody tr").should("have.length", 2);
    });
    it("should show my analysis", function () {
      cy.visit(`/analysis/${ANALYSIS_FULL}`);
      cy.get("main.Analysis").should("exist");

      // shows the steps:
      cy.get(".steps").should("exist");
      cy.get(".steps > .step").should("have.length", 5);

      cy.get(".segment.options").should("exist");

      // tab data
      cy.getBySel("dataTab").click();
      cy.get(".dataSegment").should("exist");

      // tab start
      cy.getBySel("startTab").click();
      cy.get(".startSegment").should("exist");

      // tab results
      cy.getBySel("resultsTab").click();
      cy.get(".segment.padded").should("have.length", 3);
    });
    it("should create an analysis", function () {
      cy.visit("/analysis");
      cy.get("main.Analyses").should("exist");
      cy.get("main.Analyses table").should("exist");
      cy.get("table.dataTable tbody tr").should("have.length", 2);

      // button gets detached as the data gets called in and it makes the footer rerender, therefore -> force
      cy.get("footer button").click({ force: true });
      cy.get(".ui.modal.visible.active").should("exist");
      cy.get(".ui.modal.visible.active a.item")
        .contains("Cost simulation")
        .click();

      cy.location("pathname").should("contain", "/analysis/");
      cy.get("main.Analysis").should("exist");
      cy.get(".steps").should("exist");
      cy.get("input[name='name']").should($el => {
        const value = $el.val();
        expect(value).to.not.equal("");
      });
      // // scope from priceList:
      // cy.get(".six > .ui > :nth-child(1)").click();
      // cy.get(".ui.modal.visible.active").should("exist");
      // cy.allSubscriptionsReady();
      // cy.get(".ui.modal.visible.active .dropdown").invoke("dropdown", "show");
      // cy.get(
      //   ".ui.modal.visible.active .dropdown .menu.visible .item:nth-child(1)"
      // ).click();
      // cy.get(".ui.modal.visible.active button.approve").click();
      // cy.get(".ui.modal.visible.active").should("not.exist");

      // // should fill in all scope items

      // // testing if I can modify a lane definition
      // cy.get("div#scope-lanes.title").click();
      // cy.get("div#scope-lanes.content table > tbody tr:nth-child(1)").click();

      // // edit lane modal:
      // cy.get(".ui.modal.visible.active").should("exist");
      // cy.get(":nth-child(1) > .styled > :nth-child(3)").click();
      // cy.get(".ui.modal.visible.active input[name='from-from-0']")
      //   .clear()
      //   .type("9000");

      // cy.get(".ui.modal.visible.active button.approve").click();
    });
    it("should update options tab", function () {
      cy.visit(`/analysis/${ANALYSIS_BARE}`);
      cy.get("main.Analysis").should("exist");

      cy.get(".steps > .step").should("have.length", 5);
      cy.get(".steps > .step.completed").should("have.length", 1);

      cy.get("input[name='name']")
        .clear()
        .type("new title");
      cy.getBySel("saveOptions").click();

      cy.get("input[name='name']").should("have.value", "new title");

      cy.getBySel("scopeSegment").scrollIntoView();
      cy.get(".accordion > :nth-child(5)").click({ force: true });
      // cy.get(".accordion .title")
      //   .contains("Lanes")
      //   .click();
      cy.getBySel("scopeLaneBtn").scrollIntoView();
      cy.getBySel("scopeLaneBtn").click({ force: true });
      cy.getBySel("modal").should("be.visible");

      cy.get(".modal #uniforms-0002-0000").type("test lane");
      cy.get(".modal #uniforms-0002-0006").click(); // add range
      cy.get(".modal #uniforms-0002-0009").type("belgium");
      cy.get(".modal #uniforms-0002-0009 .visible.menu > .item")
        .first()
        .click();
      cy.get(".modal #uniforms-0002-000a").type("*");

      cy.get(".modal .pointing > :nth-child(2)").click(); // select to tab
      cy.get(".modal #uniforms-0002-0006").click(); // add range
      cy.get(".modal #uniforms-0002-000f").type("france");
      cy.get(".modal #uniforms-0002-000f .visible.menu > .item")
        .first()
        .click();
      cy.get(".modal #uniforms-0002-000g").type("*");
      cy.get("[data-test=modalConfirm]").click();

      // a scope lane should exist
      cy.getBySel("scopeSegment").scrollIntoView();

      // detached ....
      cy.get(".accordion > :nth-child(5)").click({ fore: true });

      cy.get(".table.lanes tbody tr").should("have.length", 1);

      // click next button in the bottom:
    });
  });
});