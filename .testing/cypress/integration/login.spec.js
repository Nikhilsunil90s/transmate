/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import faker from "faker";
import { gql } from "@apollo/client";
import filterTests from "../filterTests";

const MAIN_USER = { login: "globex@transmate.eu", pass: "TransmateDemo" };
const CARRIER_USER_ID = "pYFLYFDMJEnKADYXX";
const PRICE_REQUEST_ID = "zgSR5RRWJoHMDSEDy";

filterTests(["all", "ci"], () => {
  describe("authentication of user", function() {
    it("should sign/sign out a user", function() {
      const user = {
        ...MAIN_USER,
        firstName: "Test"
      };
      cy.visit("/");

      cy.location("pathname").should("eq", "/sign-in"); // or sign-in
      cy.visualSnapshot(this.test, "sign in");

      //   cy.get('button[type="submit"]').should('be.disabled'); // not the case
      cy.get("input[name='email']")
        .type(user.login)
        .should("have.value", user.login);
      cy.get("input[name='password']").type(user.pass);
      cy.get(".primary.button")
        .should("not.be.disabled")
        .click(); // clicks a login button

      cy.location("pathname").should("eq", "/");

      cy.get("main.Dashboard").should("exist");
      cy.visualSnapshot(this.test, "signed in");
      cy.window().then(win => {
        // this allows accessing the window object within the browser
        const mUser = win.Meteor.user();
        expect(user).to.exist;
        expect(mUser.profile.first).to.equal(user.firstName);
        expect(mUser.emails[0].address).to.equal(user.login);
      });

      // invoke hover menu (call semantic function dropdown('show')):
      cy.getBySel("userMenu").trigger("mouseover");
      cy.getBySel("logout").click({ force: true });

      // has the correct username:
      // cy.get('.active > .menu > .header').should('contain', 'TEST ACCOUNT');
      // cy.get(".logout").should('contain', 'logout');

      // logging out:
      cy.allSubscriptionsReady();

      cy.location("pathname").should("eq", "/sign-in");
    });
    it("should be able to register a user", function() {
      cy.visit("/");
      cy.getBySel("register").click();
      cy.location("pathname").should("eq", "/register");
      cy.get('input[name="company"]').should("exist");

      const test = {
        company: "Test company",
        type: "carrier",
        first: "firstName",
        last: "lastName",
        email: faker.internet.email()
      };

      cy.get('input[name="company"]')
        .type(test.company)
        .should("have.value", test.company);

      cy.get("input[type='radio']:eq(1)").check();
      ["first", "last", "email"].forEach(d => {
        cy.get(`input[name="${d}"]`)
          .type(test[d])
          .should("have.value", test[d]);
      });

      cy.get("input[type='submit']")
        .should("not.be.disabled")
        .click();

      cy.getBySel("verify").should("exist");
    });
  });

  // need a solution to set the token PRIOR to testing, there is a GQL method, but we should run it before
  describe("token login", function() {
    let tokenLink;
    before(function() {
      cy.login(MAIN_USER);
      cy.window().then(win => {
        // this allows accessing the window object within the browser
        const mUser = win.Meteor.user();
        expect(mUser).to.exist;
        expect(mUser.emails[0].address).to.equal(MAIN_USER.login);
      });
      cy.window()
        .then(window =>
          window.__APOLLO_CLIENT__.mutate({
            mutation: gql`
              mutation manuallySetTokenForUser($input: manuallySetTokenInput!) {
                manuallySetTokenForUser(input: $input) {
                  link
                  tokenLink
                }
              }
            `,
            variables: {
              input: {
                route: {
                  page: "priceRequestEdit",
                  _id: PRICE_REQUEST_ID,
                  section: "data"
                },
                userId: CARRIER_USER_ID
              }
            }
          })
        )
        .then(({ data = {} }) => {
          ({ tokenLink } = data.manuallySetTokenForUser || {});
          cy.log(`tokenLink constructed: ${tokenLink}`);
        });
      cy.logout();
    });
    it("should be able to login with a token, redirect to price request", function() {
      expect(tokenLink).to.not.equal(undefined);
      cy.visit(tokenLink);
      cy.contains("Please wait while we're logging you in....");
      cy.visualSnapshot(this.test, "token login");
      cy.get("main.PriceRequest").should("exist");
      cy.get("[data-test='sectionContent']").should("exist");
    });
  });
});
