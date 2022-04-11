/* global Migrations, Roles */

Migrations.add({
  version: 37,
  name: "add mass price request role",
  // eslint-disable-next-line consistent-return
  up: () => {
    const newRoles = [
      "core-priceRequest-edit-settings",
      "core-priceRequest-edit-requirements"
    ];

    newRoles.forEach(newRole => {
      Roles.createRole(newRole, {
        unlessExists: true
      });

      // add the core roles to the default userRoles:
      ["admin", "planner", "purchaser"].forEach(baseRole => {
        Roles.addRolesToParent(newRole, baseRole);
      });
    });
  }
});
