/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import filterTests from "../filterTests";
const DB_TENDER_ID = "snDYcbKWBaPCyWRbj";
const DB_TENDER_OPEN_ID = "zx43GEoqXk66umzNS";
const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };
const CARRIER_USER = {
  login: "user@carrierBeta.test",
  pass: "TransmateDemo"
};

filterTests(["all"], () => {
  describe("tender module", function() {
    describe("initiation", function() {
      // before(() => {
      //   cy.login(MAIN_USER);
      //   cy.window().then(win => {
      //     // this allows accessing the window object within the browser
      //     const mUser = win.Meteor.user();
      //     expect(mUser).to.exist;
      //     expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
      //   });
      //   cy.saveLocalStorage();
      // });
      // after(() => {
      //   cy.logout();
      //   cy.saveLocalStorage();
      // });
      beforeEach(() => {
        cy.restoreLocalStorage(); // keeps logged in..
        cy.login(MAIN_USER);
        cy.callMethod("testing.resetCollections", {
          collections: ["tenders"]
        }).then((err, res) => console.log(err, res));
      });
      it("should show my tenders", function() {
        cy.visit("/tenders");
        cy.waitForGraph("getTendersForOverview");

        cy.get("main.TenderOverview").should("exist");

        cy.get("main.TenderOverview table").should("exist");
        cy.get("table.dataTable tbody tr").should("have.length", 2);
      });
      it("should create a tender", function() {
        cy.visit("/tenders");

        cy.get("main.TenderOverview").should("exist");
        cy.getBySel("createTender").click();

        cy.visualSnapshot(this.test, "initial");
        cy.location("pathname").should("contain", "/tender/");
        cy.get(".segment.general").should("exist");

        // test if there is something in the title field
        // test # menu items
        cy.getBySel("tenderTitle").should($el => {
          expect($el).to.contain("New tender");
        });
      });

      it("should modify: general", function() {
        cy.visit(`tender/${DB_TENDER_ID}`);
        cy.waitForGraph("getTenderForPage");
        cy.getBySel("introductionTab").click();

        cy.visualSnapshot(this.test, "introduction-page");

        cy.get(".segment.general").should("exist");
        cy.get(
          ".segment.general > footer button[data-test='toggleEdit']"
        ).click();

        cy.log("general section should be editable now...");

        cy.get(".segment.general input[name='title']")
          .clear()
          .type("Test tender title")
          .should("have.value", "Test tender title");
        cy.get(".segment.general [data-slate-editor='true']")
          .first()
          .click()
          .type("some notes here...");

        // save the changes
        cy.get(".segment.general > footer button[data-test='saveBtn']").click();

        cy.get(".segment.general > footer button[data-test='saveBtn']").should(
          "not.exist"
        );
      });
      it("should modify: timeline", function() {
        cy.visit(`tender/${DB_TENDER_ID}`);
        cy.get("main.Tender");
        // cy.waitForGraph("getTenderForPage");

        cy.getBySel("introductionTab").click();

        cy.get(".segment.milestones").should("exist");
        cy.get(".segment.milestones").scrollIntoView();
        cy.get(".segment.milestones .milestone").should("have.lengthOf", 6);
        cy.getBySel("addMilestone").click();

        cy.getBySel("modal").should("be.visible");
        cy.get(".modal.visible input[name='title']")
          .type("new milestone")
          .should("have.value", "new milestone");
        cy.get(".modal.visible textarea[name='details']")
          .type("some milestone text")
          .should("have.value", "some milestone text");

        cy.getBySel("modalConfirm").click();
        // cy.waitForGraph("updateTenderInPage");

        cy.getBySel("modal").should("not.exist");
        cy.get(".segment.milestones .milestone").should("have.lengthOf", 7);
      });

      it("should modify: FAQ", function() {
        cy.visit(`tender/${DB_TENDER_ID}/introduction`);
        cy.get("main.Tender");

        cy.get(".segment.FAQ").should("exist");
        cy.get(".segment.FAQ").scrollIntoView();
        cy.get(".segment.FAQ .content .list > .item").should(
          "have.lengthOf",
          1
        );
        cy.getBySel("addFAQ").click();

        cy.getBySel("modal").should("be.visible");
        cy.get(".modal.visible input[name='title']")
          .type("new FAQ")
          .should("have.value", "new FAQ");
        cy.get(".modal.visible textarea[name='details']")
          .type("some FAQ text")
          .should("have.value", "some FAQ text");

        cy.getBySel("modalConfirm").click();
        cy.getBySel("modal").should("not.exist");
        cy.get(".segment.FAQ .content .list > .item").should(
          "have.lengthOf",
          2
        );

        // delete one:
        cy.get(
          ".segment.FAQ .list > :nth-child(1) > .icons > .trash.icon"
        ).click();
        cy.getBySel("confirmModal").should("be.visible");
        cy.getBySel("confirmButton").click();
        cy.getBySel("confirmModal").should("not.exist");
        cy.get(".segment.FAQ .content .list > .item").should(
          "have.lengthOf",
          1
        );
      });

      it("should modify: contacts", function() {
        cy.visit(`tender/${DB_TENDER_ID}/introduction`);
        cy.get("main.Tender");

        cy.get(".segment.contacts").should("exist");
        cy.get(".segment.contacts").scrollIntoView();
        cy.get(".segment.contacts .card").should("have.lengthOf", 1);
        cy.get(".segment.contacts footer .button").click();

        cy.getBySel("modal").should("be.visible");

        // adding second user:
        cy.get("#uniforms-0000-0000").click();
        cy.get("#uniforms-0000-0000")
          .find(".menu.visible > .item")
          .contains("Test Account 2")
          .click();

        cy.get("#uniforms-0000-0001").click();
        cy.get("#uniforms-0000-0001")
          .find(".menu.visible > .item")
          .contains("analyst")
          .click();

        cy.getBySel("modalConfirm").click();
        cy.getBySel("modal").should("not.exist");
        cy.get(".segment.contacts .card").should("have.lengthOf", 2);
      });
      it.skip("should modify: requirements", function() {
        cy.visit(`tender/${DB_TENDER_ID}/requirements`);
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
        cy.visit("/tenders");
        cy.get("main.TenderOverview").should("exist");
        cy.saveLocalStorage(); // keeps user logged in
      });
      beforeEach(() => {
        cy.restoreLocalStorage(); // keeps logged in..
        cy.login(CARRIER_USER);
        cy.callMethod("testing.resetCollections", {
          collections: ["tenders", "shipments"]
        }).then((err, res) => console.log(err, res));
      });
      it("should show my tenders", function() {
        cy.visit("/tenders");
        cy.get("main.TenderOverview").should("exist");

        cy.get("main.TenderOverview table").should("exist");
        cy.get("table.dataTable tbody tr").should("have.length", 1);
      });
      it("should show open tender", function() {
        cy.visit(`/tender/${DB_TENDER_OPEN_ID}`);
        cy.get("main.Tender");
        cy.get(".segment.general").should("exist");

        cy.getBySel("tenderTitle").should($el => {
          expect($el).to.contain("Test tender title");
        });
      });
      it("should be able to fill out requirements", function() {
        cy.visit(`/tender/${DB_TENDER_OPEN_ID}/requirements`);
        cy.get("main.Tender");
        cy.get(".segment.requirements").should("exist");

        cy.get(".segment.requirements .content .list > .item").should(
          "have.lengthOf",
          2
        );
        cy.getBySel("requirement0").click();
        cy.getBySel("requirement1").click();
        cy.getBySel("requirement1")
          .find(".menu.visible > .item")
          .contains("option 2")
          .click();

        cy.getBySel("saveRequirements").click();
        cy.reload(); // reload page

        cy.getBySel("requirement0")
          .find("input")
          .should("be.checked");
        cy.getBySel("requirement1")
          .find(".selected.item .text")
          .should($el => {
            expect($el).to.contain.text("option 2");
          });
      });

      it("should be able to select packages", function() {
        cy.visit(`/tender/${DB_TENDER_OPEN_ID}/profile`);
        cy.get("main.Tender");
        cy.getBySel("bidControlSegment").should("exist");
        cy.getBySel("packageSection").should("exist");

        cy.getBySel("packageSection").scrollIntoView();
        cy.getBySel("package-0-0").scrollIntoView();

        cy.getBySel("package-0-0")
          .find("input")
          .check({ force: true });
        cy.getBySel("package-0-1")
          .find("input")
          .check({ force: true });
        cy.getBySel("package-0-1")
          .find("input")
          .should("be.checked");
        cy.getBySel("confirmBids").click({ force: true });
        cy.getBySel("confirmBids").should("not.exist");

        cy.reload(); // reload page
        // cy.getBySel("package-0-0")
        //   .find("input")
        //   .should("be.checked"); ???
        cy.getBySel("package-0-1")
          .find("input")
          .should("be.checked");
      });
      it("should be able to place bid", function() {
        cy.visit(`/tender/${DB_TENDER_OPEN_ID}/profile`);
        cy.get("main.Tender");
        cy.getBySel("bidControlSegment").should("exist");

        cy.getBySel("placeBid-priceList").click();

        // should be redirecting to the pricelist page with the new template...
        cy.location("pathname").should("contain", "/price-list/");
        cy.getBySel("PriceListReleaseBtn").should("exist");
      });
    });
  });
});
