/* global Migrations */
import { Roles } from "/imports/api/roles/Roles";

Migrations.add({
  version: 57,
  name: "add mass picking role",
  // eslint-disable-next-line consistent-return
  up: async () => {
    const newRole = "core-shipment-picking";

    await Roles.createRole(newRole, { unlessExists: true });
    await Roles.createRole("warehouse", { unlessExists: true });

    // add the core roles to the default userRoles:
    await Promise.all(
      ["admin", "warehouse"].map(baseRole =>
        Roles.addRolesToParent(newRole, baseRole)
      )
    );
    return true;
  }
});
