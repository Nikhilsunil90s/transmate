import filterTests from '../filterTests';
const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };

filterTests(['all','ci'], () => {
  describe("test navigation", function () {
    describe("navigate main page", function () {
      beforeEach(() => {
        cy.login(MAIN_USER);

        cy.window().then(win => {
          // this allows accessing the window object within the browser
          const mUser = win.Meteor.user();
          expect(mUser).to.exist;
          expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
        });
      });
      it("shipments", function () {
        cy.visit("/");
        cy.get(".icon-compass").click(); //click on submenu
        cy.url().should("include", "/shipments"); // should be redirected to page
      });
      it("partners", function () {
        cy.visit("/");
        cy.get(".icon-notebook").click({ multiple: true });
        cy.url().should("include", "/partners");
      });
      it("price-lists", function () {
        cy.visit("/");
        cy.get(".icon-layers").click(); //click on submenu
        cy.url().should("include", "/price-lists"); // should be redirected to page
      });
      it("tenders", function () {
        cy.visit("/");
        cy.get(".icon-badge").click(); //click on submenu
        cy.url().should("include", "/tenders"); // should be redirected to page
      });

      it("locations", function () {
        cy.visit("/");
        cy.get(".icon-location-pin").click();
        cy.url().should("include", "/locations");
      });

      it("analysis", function () {
        cy.visit("/");
        cy.get(".icon-calculator").click({ multiple: true });
        cy.url().should("include", "/analysis");
      });

      it("all", function () {
        cy.visit("/");

        //shipemnts
        cy.get(".icon-compass").click(); //click on submenu
        cy.url().should("include", "/shipments"); // should be redirected to page

        //partners
        cy.get(".icon-notebook").click({ multiple: true });
        cy.url().should("include", "/partners");
        //price lists
        cy.get(".icon-layers").click(); //click on submenu
        cy.url().should("include", "/price-lists"); // should be redirected to page
        //tenders
        cy.get(".icon-badge").click(); //click on submenu
        cy.url().should("include", "/tenders"); // should be redirected to page
        //locations
        cy.get(".icon-location-pin").click();
        cy.url().should("include", "/locations");
        //analysis
        cy.get(".icon-calculator").click({ multiple: true });
        cy.url().should("include", "/analysis");
      });
    });
  });
});