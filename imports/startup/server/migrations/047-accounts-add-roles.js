/* global Migrations, Roles */

Migrations.add({
  version: 47,
  name: "Add account settings core roles",
  up: async () => {
    const newRoles = [
      "core-account-editEntities",
      "core-account-editMasterData"
    ];

    newRoles.forEach(role => {
      Roles.createRole(role, { unlessExists: true });

      // add the core roles to the default userRoles:
      ["admin"].forEach(baseRole => {
        Roles.addRolesToParent(role, baseRole);
      });
    });
  }
});
