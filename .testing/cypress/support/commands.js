/* eslint-env cypress/globals */
/* eslint-disable func-names, prefer-arrow-callback */
import "cypress-file-upload";

let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add("resetCollections", (collections = []) => {
  cy.getMeteor().then(
    Meteor =>
      new Cypress.Promise((resolve, reject) => {
        Meteor.call("testing.resetCollections", (err, result) => {
          if (err) {
            reject(err);
          }

          resolve(result);
        });
      })
  );
});

/** resets database with a method call */
Cypress.Commands.add("resetDB", () => {
  cy.getMeteor().then(
    Meteor =>
      new Cypress.Promise((resolve, reject) => {
        Meteor.call("testing.db.reset", (err, result) => {
          if (err) {
            reject(err);
          }

          resolve(result);
        });
      })
  );
});

Cypress.Commands.add("getMeteor", () =>
  cy.window().then(({ Meteor }) => {
    if (!Meteor) {
      // We visit the app so that we get the Window instance of the app
      // from which we get the `Meteor` instance used in tests
      cy.visit("/");
      return cy.window().then(({ Meteor: MeteorSecondTry }) => MeteorSecondTry);
    }
    return Meteor;
  })
);

Cypress.Commands.add("callMethod", (method, ...params) => {
  Cypress.log({
    name: "Calling method",
    consoleProps: () => ({ name: method, params })
  });

  cy.getMeteor().then(
    Meteor =>
      new Cypress.Promise((resolve, reject) => {
        Meteor.call(method, ...params, (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          console.log(result);
          resolve(result);
        });
      })
  );
});

Cypress.Commands.add("initializeMethodListener", () => {
  cy.getMeteor().then(Meteor => {
    cy.spy(Meteor, "call").as("methodCall");
  });
});

Cypress.Commands.add("login", creds => {
  let login = "globex@transmate.eu"; //"globex@transmate.eu";
  let pass = "TransmateDemo";

  if (creds) {
    ({ login, pass } = creds);
  }

  Cypress.log({
    name: `Logging in ${login} (pass: ${pass})`
  });

  cy.getMeteor().then(
    Meteor =>
      new Cypress.Promise((resolve, reject) => {
        Meteor.loginWithPassword(login, pass, (err, result) => {
          if (err) {
            reject(err);
            console.error(err);
          }
          resolve(result);
        });
      })
  );
});

Cypress.Commands.add("logout", () => {
  Cypress.log({
    name: "Logging out"
  });

  cy.getMeteor().then(
    Meteor =>
      new Cypress.Promise((resolve, reject) => {
        Meteor.logout((err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      })
  );
});

Cypress.Commands.add("allSubscriptionsReady", (options = {}) => {
  const log = {
    name: "allSubscriptionsReady"
  };

  const getValue = () => {
    const DDP = cy.state("window").DDP;

    if (DDP._allSubscriptionsReady()) {
      return true;
    } else {
      return null;
    }
  };

  const resolveValue = () => {
    return Cypress.Promise.try(getValue).then(value => {
      return cy.verifyUpcomingAssertions(value, options, {
        onRetry: resolveValue
      });
    });
  };

  return resolveValue().then(value => {
    Cypress.log(log);
    return value;
  });
});

// snapshots:
Cypress.Commands.add("visualSnapshot", (test, name) => {
  const titlePath = [];
  let t = test;
  while (t && !t.root) {
    titlePath.unshift(t.title);
    t = t.parent;
  }
  titlePath.push(name);
  try {
    cy.screenshot(titlePath.join(" - "));
  } catch (error) {
    console.error(error);
  }
});

Cypress.Commands.add("uploadFile", (fileName, fileType = " ", selector) => {
  cy.get(selector).then(subject => {
    cy.fixture(fileName, "base64")
      .then(Cypress.Blob.base64StringToBlob)
      .then(blob => {
        const el = subject[0];
        const testFile = new File([blob], fileName, { type: fileType });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testFile);
        el.files = dataTransfer.files;
        el.value = fileName;
      });
  });
});

// if you add custom attribute "data-test"
Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-test='${selector}']`, ...args);
});

Cypress.Commands.add("saveLocalStorage", () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add("restoreLocalStorage", () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});

Cypress.Commands.add("waitForAllGraphs", operationName => {
  cy.intercept({ method: "POST", url: "/graphql" }).as("graphqlRequest");
  //This will capture every request
  cy.wait("@graphqlRequest");
});

// grapql requests are now grouped!!
Cypress.Commands.add("waitForGraph", operationName => {
  cy.intercept({ method: "POST", url: "/graphql" }).as("graphqlRequest");
  //This will capture every request
  cy.wait("@graphqlRequest").then(({ request }) => {
    // If the captured request doesn't match the operation name of your query
    // it will wait again for the next one until it gets matched.
    // as it is an array of all operations grouped, we check if the operationName is in any of the calls...
    if (
      !(
        Array.isArray(request.body) &&
        request.body.some(({ operationName: name }) => name === operationName)
      )
    ) {
      return cy.waitForGraph(operationName);
    }
  });
});
