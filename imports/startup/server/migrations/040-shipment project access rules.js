/* global Migrations, Roles */

import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";
import { User } from "/imports/api/users/User";

Migrations.add({
  version: 40,
  name: "setup shipment project access rules",
  // eslint-disable-next-line consistent-return
  up: () => {
    // 1. create new roles - assign to admin only
    [
      "core-shipment-project-create",
      "core-shipment-project-edit",
      "core-shipment-project-view"
    ].forEach(newRole => {
      Roles.createRole(newRole, { unlessExists: true });

      // add the core roles to the default userRoles:
      ["admin"].forEach(baseRole => {
        Roles.addRolesToParent(newRole, baseRole);
      });
    });

    // 2. for existing projects, add planners based on admin role
    ShipmentProject.find({}).forEach(project => {
      const { accountId } = project;
      const adminUsers = Roles.getUsersInRole(["admin"], `account-${accountId}`)
        .fetch()
        .map(usr => {
          const user = User.init(usr);
          return {
            id: user._id,
            name: user.getName()
          };
        });
      ShipmentProject._collection.update(
        { _id: project._id },
        { $addToSet: { planners: { $each: adminUsers } } }
      );
    });
  }
});
