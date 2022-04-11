/* eslint-disable */
import { PriceList } from "/imports/api/pricelists/PriceList.js";

Migrations.add({
  version: 7,
  name: "Convert lead time day definitions to array",
  up() {
    return PriceList.find(
      {
        uoms: {
          $exists: true
        }
      },
      {
        fields: {
          defaultLeadTime: 1
        }
      }
    ).forEach(function(priceList) {
      if (priceList.defaultLeadTime.days.mon != null) {
        priceList.defaultLeadTime.days = [
          priceList.defaultLeadTime.days.mon,
          priceList.defaultLeadTime.days.tue,
          priceList.defaultLeadTime.days.wed,
          priceList.defaultLeadTime.days.thu,
          priceList.defaultLeadTime.days.fri,
          priceList.defaultLeadTime.days.sat,
          priceList.defaultLeadTime.days.sun
        ];
        return priceList.update({
          defaultLeadTime: priceList.defaultLeadTime
        });
      }
    });
  }
});
