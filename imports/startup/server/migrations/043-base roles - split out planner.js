/* eslint-disable no-undef */

// /imports/api/_jsonSchemas/enums/account.js

Migrations.add({
  version: 43,
  name: "split out planner cost core roles",
  up: () => {
    // after this migration, the planner role will be without cost related core roles
    // if a planner needs that access, he should have the accounting base role as well

    const roleNames = [
      "core-shipment-viewCosts",
      "core-shipment-addBaseCost",
      "core-shipment-addManualCost",
      "core-shipment-updateManualCost",
      "core-shipment-approveDeclineCost",
      "core-shipment-addCostFromInvoice"
    ];

    ["planner"].forEach(parentName => {
      Roles.removeRolesFromParent(roleNames, parentName);
    });

    Roles.createRole("accounting", {
      unlessExists: true
    });

    ["accounting"].forEach(parentName => {
      Roles.addRolesToParent(roleNames, parentName);
    });
  }
});
