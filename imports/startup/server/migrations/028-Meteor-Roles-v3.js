/* eslint-disable no-underscore-dangle */
/* global Migrations, Roles */

Migrations.add({
  version: 28,
  name: "Meteor Roles to v3",
  up: async () => {
    await Roles._forwardMigrate();
    await Roles._forwardMigrate2();
  }
});
