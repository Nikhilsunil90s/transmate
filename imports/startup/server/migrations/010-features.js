/* eslint-disable no-undef */
import { Carrier } from "/imports/api/carriers/Carrier.js";

import { Shipper } from "/imports/api/shippers/Shipper.js";

import { Provider } from "/imports/api/providers/Provider.js";

Migrations.add({
  version: 10,
  name: "Activate new features for all existing accounts.",
  up() {
    const features = ["shipment", "partner", "location", "reporting"];
    Carrier._collection.update(
      {},
      {
        $push: {
          features: {
            $each: features
          }
        }
      },
      {
        multi: true
      }
    );
    Shipper._collection.update(
      {},
      {
        $push: {
          features: {
            $each: features
          }
        }
      },
      {
        multi: true
      }
    );
    return Provider._collection.update(
      {},
      {
        $push: {
          features: {
            $each: features
          }
        }
      },
      {
        multi: true
      }
    );
  }
});
