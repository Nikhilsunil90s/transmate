/* global Migrations */
import { Roles } from "/imports/api/roles/Roles";

import {
  coreRoles,
  userRoles,
  roleStructure
} from "../../../api/_jsonSchemas/simple-schemas/_utilities/_users";

Migrations.add({
  version: 31,
  name: "split roles into core role groups",
  // eslint-disable-next-line consistent-return
  up: () => {
    // core roles & userRoles
    [...userRoles, ...coreRoles].forEach(role => {
      Roles.createRole(role, { unlessExists: true });
    });

    // add the core roles to the default userRoles:
    Object.entries(roleStructure).forEach(([baseRole, roles]) => {
      roles.forEach(coreRole => {
        Roles.addRolesToParent(coreRole, baseRole);
      });
    });
  }
});
