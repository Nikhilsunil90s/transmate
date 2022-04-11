/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts.js";
import { Shipper } from "/imports/api/shippers/Shipper";
import { Carrier } from "/imports/api/carriers/Carrier";
import { Provider } from "/imports/api/providers/Provider";

Migrations.add({
  version: 15,
  name: "move to a single accounts collection",
  up: () => {
    // this migrates the accounts structure
    // [shippers, carrier, provider] -> []

    // bulk write to allAccounts:
    const bulkAccountsOp = AllAccounts._collection
      .rawCollection()
      .initializeUnorderedBulkOp();
    bulkAccountsOp.executeAsync = Meteor.wrapAsync(bulkAccountsOp.execute);

    // all shippers:
    Shipper.find().forEach(doc => {
      const newDoc = { ...doc, type: "shipper" };
      delete newDoc.__is_new;
      delete newDoc.id;
      bulkAccountsOp.insert(newDoc);
    });

    // all carriers:
    Carrier.find().forEach(doc => {
      const newDoc = { ...doc, type: "carrier" };
      delete newDoc.__is_new;
      delete newDoc.id;
      bulkAccountsOp.insert(newDoc);
    });

    // all providers:
    Provider.find().forEach(doc => {
      const newDoc = { ...doc, type: "provider" };
      delete newDoc.__is_new;
      delete newDoc.id;
      bulkAccountsOp.insert(newDoc);
    });
    let res;
    try {
      res = bulkAccountsOp.executeAsync();
    } catch (err) {
      console.error(err);
      return "Error updating price list rates";
    }
    return `copied over ${res.nInserted} accounts`;
  }
});
