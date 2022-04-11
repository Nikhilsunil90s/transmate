/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import filterTests from '../filterTests';
const DB_PRICE_LIST_ID = "3ecjkjCcskEJph8W6";

const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };
const CARRIER_USER = {
  login: "user@carrierBeta.test",
  pass: "TransmateDemo"
};

const PRICE_LIST_COUNT = 3

function startEditing(segment) {
  cy.visit(`/price-list/${DB_PRICE_LIST_ID}/${segment}`);
  cy.get("main.PriceList").should("exist");
  cy.get(`main.PriceList .segment.${segment}`).should("exist");
  cy.getBySel("PriceListToDraftBtn").click();
  cy.getBySel("confirmModal").should("be.visible");
  cy.getBySel("confirmButton").click();
  cy.getBySel("confirmModal").should("not.exist");
}

function newLaneModalTest() {
  const TEST_LANE = {
    name: "test lane",
    fromCtry: "Belgium",
    fromZone: "*",
    toCtry: "France",
    toZone: "*"
  };
  cy.getBySel("modal").should("exist");
  cy.get('input[name="name"]')
    .clear()
    .type(TEST_LANE.name);

  // from
  cy.getBySel("scopeLanefromAddRange").click();
  cy.get(".scopeLanefromCCRange input")
    .first()
    .type(TEST_LANE.fromCtry)
    .parent()
    .find(".visible.menu > .item")
    .first()
    .click();

  cy.get(".scopeLanefromZipFromRange input").type(TEST_LANE.fromZone);

  // from
  cy.get(".modal .secondary.menu > .item:eq(1)").click();
  cy.getBySel("scopeLanetoAddRange").click();
  cy.get(".scopeLanetoCCRange input")
    .first()
    .type(TEST_LANE.toCtry)
    .parent()
    .find(".visible.menu > .item")
    .first()
    .click();

  cy.get(".scopeLanetoZipFromRange input").type(TEST_LANE.toZone);
  cy.getBySel("modalConfirm").click();
  cy.getBySel("modal").should("not.exist");
}

filterTests(['all'], () => {
  describe("Price list", function () {
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
        collections: ["priceLists"]
      }).then((err, res) => console.log(err, res));
    });
    it("[overview] allows to view price lists", function () {
      cy.visit("/price-lists");
      cy.get("main.PriceListOverview").should("exist");
      cy.get("main.PriceListOverview table").should("exist");
      cy.get("main.PriceListOverview table tbody tr").should("have.length", PRICE_LIST_COUNT);
    });
    it("[create] create a price list", function () {
      cy.visit("/price-lists");
      cy.get("main.PriceListOverview").should("exist");
      cy.get("main.PriceListOverview table").should("exist");
      cy.get("main.PriceListOverview table tbody tr").should("have.length", PRICE_LIST_COUNT);
      cy.get("main.PriceListOverview footer").should("exist");
      cy.getBySel("createPriceListBtn").click();

      // modal opens
      cy.getBySel("modal").should("be.visible");
      cy.getBySel("selectTemplateBtn-road").should("exist");
      cy.getBySel("selectTemplateBtn-road").click();
      cy.getBySel("modal").should("not.exist");
      cy.url().should("include", "/price-list/");
      cy.get("main.PriceList").should("exist");
    });
    it("[view] can view price list", function () {
      // checking all tabs:
      [
        "general",
        "rates",
        "fuel",
        "leadTimes",
        "notes",
        "ratesAdditional",
        "volumes",
        "lanes",
        "equipments" // is not used in this particular template
      ].forEach(segment => {
        cy.visit(`/price-list/${DB_PRICE_LIST_ID}/${segment}`);
        cy.get("main.PriceList").should("exist");
        cy.get("main.PriceList .tabs.menu").should("exist");
        cy.get(`main.PriceList .segment.${segment}`).should("exist");
      });
    });
    it("[edit] edit general tab", function () {
      const TEST_VALUE = "TEST";
      startEditing("general");

      cy.get("#uniforms-0000-0000").should("not.have.attr", "disabled");
      cy.get("#uniforms-0000-0000")
        .clear()
        .type(TEST_VALUE)
        .should("have.value", TEST_VALUE);

      cy.getBySel("saveGeneralBtn").should("exist");
      cy.getBySel("saveGeneralBtn").click({ force: true });
      cy.reload();
      cy.get("main.PriceList").should("exist");
      cy.get(`main.PriceList .segment.general`).should("exist");
      cy.get("#uniforms-0000-0000").should("have.value", TEST_VALUE);
      cy.getBySel("saveGeneralBtn").should("not.exist");
    });
    it("[edit] edit lanes  tab", function () {
      startEditing("lanes");
      cy.get(".segment.lanes table tbody tr").should("have.length", 2);

      // add lane modal & test
      cy.getBySel("scopeLaneBtn").should("exist");
      cy.getBySel("scopeLaneBtn").click();

      newLaneModalTest();

      cy.get(".segment.lanes table tbody tr").should("have.length", 3);
    });
    it("[edit] edit volumes  tab", function () {
      startEditing("volumes");

      cy.get(".segment.volumes table tbody tr").should("have.length", 1);
      cy.getBySel("scopeVolumeBtn").should("exist");
      cy.getBySel("scopeVolumeBtn").click();
      cy.getBySel("modal").should("exist");

      cy.get("input[name='ranges.0.from']").type(0);
      cy.get("input[name='ranges.0.to']").type(15000);

      cy.getBySel("modalConfirm").click();
      cy.getBySel("modal").should("not.exist");

      cy.get(".segment.volumes table tbody tr").should("have.length", 2);
    });
    it("[edit] edit equipments  tab", function () {
      // this is normally not part of the selected price list template...
      startEditing("equipments");

      cy.get(".segment.equipments table tbody tr td.dataTables_empty").should(
        "exist"
      );
      cy.getBySel("scopeEquipmentBtn").should("exist");
      cy.getBySel("scopeEquipmentBtn").click();
      cy.getBySel("modal").should("exist");

      cy.get("input[name='name']").type("TEST EQUIPMENT");
      cy.get(".modal .selection.dropdown")
        .click()
        .find(".menu > .item:eq(0)")
        .click();
      cy.get(".modal .selection.dropdown").blur(); // as it is multi-select

      cy.getBySel("modalConfirm").click();
      cy.getBySel("modal").should("not.exist");

      cy.get(".segment.equipments table tbody tr").should("have.length", 1);
    });
    it("[status] put to active", function () {
      startEditing("general");

      // now in draft mode
      cy.getBySel("PriceListActivateBtn").should("exist");
      cy.getBySel("PriceListDeleteBtn").should("exist");
      cy.getBySel("PriceListActivateBtn").click();
      cy.getBySel("confirmModal").should("exist");
      cy.getBySel("confirmButton").click();
      cy.getBySel("confirmModal").should("not.exist");
      cy.get(".ui.floating.message.s-alert-show").should("be.visible");
      cy.getBySel("PriceListToDraftBtn").should("exist");
    });
    it("[status] delete", function () {
      startEditing("general");

      // now in draft mode
      cy.getBySel("PriceListActivateBtn").should("exist");
      cy.getBySel("PriceListDeleteBtn").should("exist");
      cy.getBySel("PriceListDeleteBtn").click();
      cy.getBySel("confirmModal").should("exist");
      cy.getBySel("confirmButton").click();
      cy.getBySel("confirmModal").should("not.exist");

      cy.url().should("contain", "/price-lists");
    });
    it("[grid] is showing", function () {
      startEditing("general");
      cy.visit(`/price-list/${DB_PRICE_LIST_ID}/rates`);

      cy.get("#gridHolder").should("exist");
      cy.getBySel("triggerLaneModalBtn").should("exist");
      cy.getBySel("triggerVolumeGroupModalBtn").should("exist");
    });
    it("[grid] btn add lane", function () {
      startEditing("general");
      cy.visit(`/price-list/${DB_PRICE_LIST_ID}/rates`);

      cy.get("#gridHolder").should("exist");
      cy.getBySel("triggerLaneModalBtn").should("exist");
      cy.getBySel("triggerLaneModalBtn").click();
      newLaneModalTest();

      // very hard to test the grid... :(
    });
  });
});