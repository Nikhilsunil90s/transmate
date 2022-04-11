/* global Migrations */
import { Roles } from "/imports/api/roles/Roles";

Migrations.add({
  version: 35,
  name: "add mass price request role",
  // eslint-disable-next-line consistent-return
  up: () => {
    const newRole = "core-priceRequest-createForShipmentMass";

    Roles.createRole(newRole, {
      unlessExists: true
    });

    // add the core roles to the default userRoles:
    ["admin", "planner"].forEach(baseRole => {
      Roles.addRolesToParent(newRole, baseRole);
    });
  }
});
