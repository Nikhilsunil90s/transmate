/* global Migrations, Roles */

Migrations.add({
  version: 39,
  name: "add core shipment-view-cost",
  // eslint-disable-next-line consistent-return
  up: () => {
    const newRole = "core-shipment-viewCosts";

    Roles.createRole(newRole, { unlessExists: true });

    // add the core roles to the default userRoles:
    ["admin", "planner"].forEach(baseRole => {
      Roles.addRolesToParent(newRole, baseRole);
    });
  }
});
