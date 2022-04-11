/* global Migrations */

import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";

Migrations.add({
  version: 46,
  name: "make numidia script an account setting",
  up: async () => {
    // check if set
    const check = await AllAccountsSettings.first({
      _id: "S46614",
      "actions.action": "script.numdia.price.confirmation"
    });
    if (!check)
      await AllAccountsSettings._collection.update(
        { _id: "S46614" },
        {
          $addToSet: {
            actions: {
              on: "shipment-stage.released",
              action: "script.numdia.price.confirmation",
              active: true,
              data: {},
              options: {
                priority: "high",
                retry: {
                  retries: 2,
                  wait: 20000 // 20 sec
                },
                delay: 0
              }
            }
          }
        }
      );
  }
});
