import { Random } from "/imports/utils/functions/random.js";
export const sheetData = {
  id: Random.id(),
  data: [
    {
      _id: 'ObjectId("5e56949fd7d19d756f88e1fc")',
      lanesFromCountry: {
        r: 28,
        c: 1,
        data: "NL",
        parent: "lanes",
        mapping: "NL"
      },
      lanesFromCity: {
        r: 28,
        c: 2,
        data: "Oudebildtzijl",
        parent: "lanes",
        mapping: "Oudebildtzijl"
      },
      lanesFromLocode: {
        r: 28,
        c: 4,
        data: null,
        parent: "lanes",
        mapping: null
      },
      lanesOriginService: {
        r: 28,
        c: 5,
        data: "DOOR",
        parent: "lanes",
        mapping: "door"
      },
      lanesToCountry: {
        r: 28,
        c: 6,
        data: "GB",
        parent: "lanes",
        mapping: "GB"
      },
      lanesToCity: {
        r: 28,
        c: 7,
        data: "Whitley Bay Ward",
        parent: "lanes",
        mapping: "Whitley Bay Ward"
      },
      lanesToLocode: {
        r: 28,
        c: 9,
        data: null,
        parent: "lanes",
        mapping: null
      },
      lanesDestinationService: {
        r: 28,
        c: 10,
        data: "DOOR",
        parent: "lanes",
        mapping: "door"
      },
      equipmentQuantity: {
        r: 28,
        c: 11,
        data: 911,
        parent: "equipments",
        mapping: 911
      },
      equipmentType: {
        r: 28,
        c: 12,
        data: "40FT high cube",
        parent: "equipments",
        mapping: "44G0"
      },
      "Transit Time": {
        r: 28,
        c: 17,
        data: null,
        parent: null,
        mapping: null
      },
      "PTP Transit Time   ": {
        r: 28,
        c: 21,
        data: null,
        parent: null,
        mapping: null
      },
      "Destination Transit Time": {
        r: 28,
        c: 26,
        data: null,
        parent: null,
        mapping: null
      },
      rowIndex: 26,
      lanesKey: "4c14f05317e3fa2790230131f38f3f74c6cadde2",
      equipmentsKey: "bc164e731f6f70c5f31510493b182c5b0b6d5c4a",
      volumesKey: "323217f643c3e3f1fe7532e72ac01bb0748c97be",
      goodsKey: "323217f643c3e3f1fe7532e72ac01bb0748c97be",
      laneKey: "323217f643c3e3f1fe7532e72ac01bb0748c97be",
      chargesKey: "558b84235ac24a2d9f82e3fca159df36a9336f75",
      lineId: "b649957248699c67b7550da29b6d2717eb530646",
      "origin/currency": {
        chargeCurrency: {
          mapping: "EUR"
        }
      },
      "origin/pickup_charges_per_cn": {
        chargeDescription: {
          r: 1,
          c: 14,
          data: "origin pickup",
          mapping: "origin/pickup_charges_per_cn"
        },
        chargeCurrency: {
          r: 28,
          c: 13,
          data: "GBP",
          mapping: "GBP"
        },
        chargeValue: {
          r: 28,
          c: 14,
          data: null,
          mapping: "1878"
        },
        chargeMultiplier: {
          r: 0,
          c: 14,
          data: "shipment",
          mapping: "container"
        }
      },
      "origin/bl_charges_per_shipment": {
        chargeDescription: {
          r: 1,
          c: 15,
          data: "Origin - B/L charge",
          mapping: "origin/bl_charges_per_shipment"
        },
        chargeCurrency: {
          r: 28,
          c: 13,
          data: "GBP",
          mapping: "GBP"
        },
        chargeValue: {
          r: 28,
          c: 15,
          data: null,
          mapping: "1266"
        },
        chargeMultiplier: {
          r: 0,
          c: 15,
          data: "shipment",
          mapping: "shipment"
        }
      },
      null: {
        chargeDescription: {
          r: 1,
          c: 25,
          data: "Destination - Other Charges",
          mapping: null
        },
        chargeCurrency: {
          r: 28,
          c: 22,
          data: "EUR",
          mapping: "EUR"
        },
        chargeValue: {
          r: 28,
          c: 25,
          data: null,
          mapping: null
        },
        chargeMultiplier: {
          r: 0,
          c: 25,
          data: "shipment",
          mapping: "shipment"
        }
      },
      "main/currency": {
        chargeCurrency: {
          mapping: "EUR"
        }
      },
      "main/freight_per_cn": {
        chargeDescription: {
          r: 1,
          c: 19,
          data: "Freight",
          mapping: "main/freight_per_cn"
        },
        chargeCurrency: {
          r: 28,
          c: 18,
          data: "USD",
          mapping: "USD"
        },
        chargeValue: {
          r: 28,
          c: 19,
          data: null,
          mapping: "1382"
        },
        chargeMultiplier: {
          r: 0,
          c: 19,
          data: "container",
          mapping: "container"
        }
      },
      "destination/currency": {
        chargeCurrency: {
          mapping: "EUR"
        }
      },
      "destination/detention_fee_per_cn_per_day": {
        chargeDescription: {
          r: 1,
          c: 24,
          data: "Destination Detention Fee",
          mapping: "destination/detention_fee_per_cn_per_day"
        },
        chargeCurrency: {
          r: 28,
          c: 22,
          data: "EUR",
          mapping: "EUR"
        },
        chargeValue: {
          r: 28,
          c: 24,
          data: null,
          mapping: "1149"
        },
        chargeMultiplier: {
          r: 0,
          c: 24,
          data: "container",
          mapping: "container_per_day"
        }
      },
      tenderBidId: "LHyrsYYP6FxWHAzZ7"
    },
    {
      _id: 'ObjectId("5e56949fd7d19d756f88e1fb")',
      lanesFromCountry: {
        r: 27,
        c: 1,
        data: "ZA",
        parent: "lanes",
        mapping: "ZA"
      },
      lanesFromCity: {
        r: 27,
        c: 2,
        data: "Port Elizabeth",
        parent: "lanes",
        mapping: "Port Elizabeth"
      },
      lanesFromLocode: {
        r: 27,
        c: 4,
        data: null,
        parent: "lanes",
        mapping: null
      },
      lanesOriginService: {
        r: 27,
        c: 5,
        data: "DOOR",
        parent: "lanes",
        mapping: "door"
      },
      lanesToCountry: {
        r: 27,
        c: 6,
        data: "GB",
        parent: "lanes",
        mapping: "GB"
      },
      lanesToCity: {
        r: 27,
        c: 7,
        data: "Deganwy ED",
        parent: "lanes",
        mapping: "Deganwy ED"
      },
      lanesToLocode: {
        r: 27,
        c: 9,
        data: null,
        parent: "lanes",
        mapping: null
      },
      lanesDestinationService: {
        r: 27,
        c: 10,
        data: "DOOR",
        parent: "lanes",
        mapping: "door"
      },
      equipmentQuantity: {
        r: 27,
        c: 11,
        data: 360,
        parent: "equipments",
        mapping: 360
      },
      equipmentType: {
        r: 27,
        c: 12,
        data: "40FT high cube",
        parent: "equipments",
        mapping: "44G0"
      },
      "Transit Time": {
        r: 27,
        c: 17,
        data: null,
        parent: null,
        mapping: null
      },
      "PTP Transit Time   ": {
        r: 27,
        c: 21,
        data: null,
        parent: null,
        mapping: null
      },
      "Destination Transit Time": {
        r: 27,
        c: 26,
        data: null,
        parent: null,
        mapping: null
      },
      rowIndex: 25,
      lanesKey: "6aa05232be1bf6d46528b7e37975024dac2ca572",
      equipmentsKey: "bc164e731f6f70c5f31510493b182c5b0b6d5c4a",
      volumesKey: "323217f643c3e3f1fe7532e72ac01bb0748c97be",
      goodsKey: "323217f643c3e3f1fe7532e72ac01bb0748c97be",
      laneKey: "323217f643c3e3f1fe7532e72ac01bb0748c97be",
      chargesKey: "558b84235ac24a2d9f82e3fca159df36a9336f75",
      lineId: "2cae0a97b123727dcd5ab60fa14100ea0b762a59",
      "origin/currency": {
        chargeCurrency: {
          mapping: "EUR"
        }
      },
      "origin/pickup_charges_per_cn": {
        chargeDescription: {
          r: 1,
          c: 14,
          data: "origin pickup",
          mapping: "origin/pickup_charges_per_cn"
        },
        chargeCurrency: {
          r: 27,
          c: 13,
          data: "GBP",
          mapping: "GBP"
        },
        chargeValue: {
          r: 27,
          c: 14,
          data: null,
          mapping: "361"
        },
        chargeMultiplier: {
          r: 0,
          c: 14,
          data: "shipment",
          mapping: "container"
        }
      },
      "origin/bl_charges_per_shipment": {
        chargeDescription: {
          r: 1,
          c: 15,
          data: "Origin - B/L charge",
          mapping: "origin/bl_charges_per_shipment"
        },
        chargeCurrency: {
          r: 27,
          c: 13,
          data: "GBP",
          mapping: "GBP"
        },
        chargeValue: {
          r: 27,
          c: 15,
          data: null,
          mapping: "733"
        },
        chargeMultiplier: {
          r: 0,
          c: 15,
          data: "shipment",
          mapping: "shipment"
        }
      },
      null: {
        chargeDescription: {
          r: 1,
          c: 25,
          data: "Destination - Other Charges",
          mapping: null
        },
        chargeCurrency: {
          r: 27,
          c: 22,
          data: "EUR",
          mapping: "EUR"
        },
        chargeValue: {
          r: 27,
          c: 25,
          data: null,
          mapping: null
        },
        chargeMultiplier: {
          r: 0,
          c: 25,
          data: "shipment",
          mapping: "shipment"
        }
      },
      "main/currency": {
        chargeCurrency: {
          mapping: "EUR"
        }
      },
      "main/freight_per_cn": {
        chargeDescription: {
          r: 1,
          c: 19,
          data: "Freight",
          mapping: "main/freight_per_cn"
        },
        chargeCurrency: {
          r: 27,
          c: 18,
          data: "USD",
          mapping: "USD"
        },
        chargeValue: {
          r: 27,
          c: 19,
          data: null,
          mapping: "1391"
        },
        chargeMultiplier: {
          r: 0,
          c: 19,
          data: "container",
          mapping: "container"
        }
      },
      "destination/currency": {
        chargeCurrency: {
          mapping: "EUR"
        }
      },
      "destination/detention_fee_per_cn_per_day": {
        chargeDescription: {
          r: 1,
          c: 24,
          data: "Destination Detention Fee",
          mapping: "destination/detention_fee_per_cn_per_day"
        },
        chargeCurrency: {
          r: 27,
          c: 22,
          data: "EUR",
          mapping: "EUR"
        },
        chargeValue: {
          r: 27,
          c: 24,
          data: null,
          mapping: "232"
        },
        chargeMultiplier: {
          r: 0,
          c: 24,
          data: "container",
          mapping: "container_per_day"
        }
      },
      tenderBidId: "LHyrsYYP6FxWHAzZ7"
    },
    {
      _id: 'ObjectId("5e56949fd7d19d756f88e1fa")',
      lanesFromCountry: {
        r: 26,
        c: 1,
        data: "GB",
        parent: "lanes",
        mapping: "GB"
      },
      lanesFromCity: {
        r: 26,
        c: 2,
        data: "Spalding",
        parent: "lanes",
        mapping: "Spalding"
      },
      lanesFromLocode: {
        r: 26,
        c: 4,
        data: null,
        parent: "lanes",
        mapping: null
      },
      lanesOriginService: {
        r: 26,
        c: 5,
        data: "DOOR",
        parent: "lanes",
        mapping: "door"
      },
      lanesToCountry: {
        r: 26,
        c: 6,
        data: "PL",
        parent: "lanes",
        mapping: "PL"
      },
      lanesToCity: {
        r: 26,
        c: 7,
        data: "Pobierowo",
        parent: "lanes",
        mapping: "Pobierowo"
      },
      lanesToLocode: {
        r: 26,
        c: 9,
        data: null,
        parent: "lanes",
        mapping: null
      },
      lanesDestinationService: {
        r: 26,
        c: 10,
        data: "DOOR",
        parent: "lanes",
        mapping: "door"
      },
      equipmentQuantity: {
        r: 26,
        c: 11,
        data: 375,
        parent: "equipments",
        mapping: 375
      },
      equipmentType: {
        r: 26,
        c: 12,
        data: "40FT high cube",
        parent: "equipments",
        mapping: "44G0"
      },
      "Transit Time": {
        r: 26,
        c: 17,
        data: null,
        parent: null,
        mapping: null
      },
      "PTP Transit Time   ": {
        r: 26,
        c: 21,
        data: null,
        parent: null,
        mapping: null
      },
      "Destination Transit Time": {
        r: 26,
        c: 26,
        data: null,
        parent: null,
        mapping: null
      },
      rowIndex: 24,
      lanesKey: "de8c4a0f771a0f4ecd8bec2527bf2c48ce715d9f",
      equipmentsKey: "bc164e731f6f70c5f31510493b182c5b0b6d5c4a",
      volumesKey: "323217f643c3e3f1fe7532e72ac01bb0748c97be",
      goodsKey: "323217f643c3e3f1fe7532e72ac01bb0748c97be",
      laneKey: "323217f643c3e3f1fe7532e72ac01bb0748c97be",
      chargesKey: "558b84235ac24a2d9f82e3fca159df36a9336f75",
      lineId: "565f562bdeb23a6f422215eb8d723ebdcfbeec14",
      "origin/currency": {
        chargeCurrency: {
          mapping: "EUR"
        }
      },
      "origin/pickup_charges_per_cn": {
        chargeDescription: {
          r: 1,
          c: 14,
          data: "origin pickup",
          mapping: "origin/pickup_charges_per_cn"
        },
        chargeCurrency: {
          r: 26,
          c: 13,
          data: "GBP",
          mapping: "GBP"
        },
        chargeValue: {
          r: 26,
          c: 14,
          data: null,
          mapping: "531"
        },
        chargeMultiplier: {
          r: 0,
          c: 14,
          data: "shipment",
          mapping: "container"
        }
      },
      "origin/bl_charges_per_shipment": {
        chargeDescription: {
          r: 1,
          c: 15,
          data: "Origin - B/L charge",
          mapping: "origin/bl_charges_per_shipment"
        },
        chargeCurrency: {
          r: 26,
          c: 13,
          data: "GBP",
          mapping: "GBP"
        },
        chargeValue: {
          r: 26,
          c: 15,
          data: null,
          mapping: "524"
        },
        chargeMultiplier: {
          r: 0,
          c: 15,
          data: "shipment",
          mapping: "shipment"
        }
      },
      null: {
        chargeDescription: {
          r: 1,
          c: 25,
          data: "Destination - Other Charges",
          mapping: null
        },
        chargeCurrency: {
          r: 26,
          c: 22,
          data: "EUR",
          mapping: "EUR"
        },
        chargeValue: {
          r: 26,
          c: 25,
          data: null,
          mapping: null
        },
        chargeMultiplier: {
          r: 0,
          c: 25,
          data: "shipment",
          mapping: "shipment"
        }
      },
      "main/currency": {
        chargeCurrency: {
          mapping: "EUR"
        }
      },
      "main/freight_per_cn": {
        chargeDescription: {
          r: 1,
          c: 19,
          data: "Freight",
          mapping: "main/freight_per_cn"
        },
        chargeCurrency: {
          r: 26,
          c: 18,
          data: "USD",
          mapping: "USD"
        },
        chargeValue: {
          r: 26,
          c: 19,
          data: null,
          mapping: "1017"
        },
        chargeMultiplier: {
          r: 0,
          c: 19,
          data: "container",
          mapping: "container"
        }
      },
      "destination/currency": {
        chargeCurrency: {
          mapping: "EUR"
        }
      },
      "destination/detention_fee_per_cn_per_day": {
        chargeDescription: {
          r: 1,
          c: 24,
          data: "Destination Detention Fee",
          mapping: "destination/detention_fee_per_cn_per_day"
        },
        chargeCurrency: {
          r: 26,
          c: 22,
          data: "EUR",
          mapping: "EUR"
        },
        chargeValue: {
          r: 26,
          c: 24,
          data: null,
          mapping: "1390"
        },
        chargeMultiplier: {
          r: 0,
          c: 24,
          data: "container",
          mapping: "container_per_day"
        }
      },
      tenderBidId: "LHyrsYYP6FxWHAzZ7"
    }
  ],
  stats: {
    totalCount: 3, // all items independent of filter
    queryCount: 3, // ignore the limit
    curCount: 3
  },
  meta: {
    chargeDescriptionsSorted: [
      {
        leg: "origin",
        label: "Currency",
        key: "origin/currency",
        currency: "EUR",
        parent: true,
        dataKey: "chargeCurrency.mapping",
        k: "chargeCurrency",
        edit: true
      },
      {
        leg: "origin",
        label: "Pickup Charges per CN",
        multiplier: "container",
        key: "origin/pickup_charges_per_cn",
        k: "chargeDescription",
        edit: true
      },
      {
        leg: "origin",
        label: "BL Charges per shipment",
        multiplier: "shipment",
        key: "origin/bl_charges_per_shipment",
        k: "chargeDescription",
        edit: true
      },
      {
        leg: "main",
        label: "Currency",
        key: "main/currency",
        currency: "EUR",
        parent: true,
        dataKey: "chargeCurrency.mapping",
        k: "chargeCurrency",
        edit: true
      },
      {
        leg: "main",
        label: "Freight per CN",
        multiplier: "container",
        key: "main/freight_per_cn",
        k: "chargeDescription",
        edit: true
      },
      {
        leg: "destination",
        label: "Currency",
        parent: true,
        key: "destination/currency",
        dataKey: "chargeCurrency.mapping",
        k: "chargeCurrency",
        currency: "EUR",
        edit: true
      },
      {
        leg: "destination",
        label: "Detention Fee per CN Per Day",
        multiplier: "container_per_day",
        key: "destination/detention_fee_per_cn_per_day",
        k: "chargeDescription",
        edit: true
      }
    ],
    colHeaders: [
      {
        group: "origin",
        label: "Country",
        k: "lanesFromCountry",
        header: "lanesFromCountry",
        edit: false
      },
      {
        group: "origin",
        label: "City",
        k: "lanesFromCity",
        header: "lanesFromCity",
        edit: false
      },
      {
        group: "origin",
        label: "Port of Loading",
        k: "lanesFromLocode",
        header: "lanesFromLocode",
        edit: false
      },
      {
        group: "origin",
        label: "Service",
        k: "lanesOriginService",
        header: "lanesOriginService",
        edit: false
      },
      {
        group: "destination",
        label: "Country",
        k: "lanesToCountry",
        header: "lanesToCountry",
        edit: false
      },
      {
        group: "destination",
        label: "City",
        k: "lanesToCity",
        header: "lanesToCity",
        edit: false
      },
      {
        group: "destination",
        label: "Port of Discharge",
        k: "lanesToLocode",
        header: "lanesToLocode",
        edit: false
      },
      {
        group: "destination",
        label: "Service",
        k: "lanesDestinationService",
        header: "lanesDestinationService",
        edit: false
      },
      {
        group: "shipment information",
        label: "Frequency per year",
        k: "equipmentQuantity",
        header: "equipmentQuantity",
        edit: false
      },
      {
        group: "shipment information",
        label: "Equipment Type",
        k: "equipmentType",
        header: "equipmentType",
        edit: false
      },
      {
        header: "Transit Time",
        group: "extra",
        label: "Transit Time",
        edit: false
      },
      {
        header: "PTP Transit Time   ",
        group: "extra",
        label: "PTP Transit Time   ",
        edit: false
      },
      {
        header: "Destination Transit Time",
        group: "extra",
        label: "Destination Transit Time",
        edit: false
      }
    ]
  }
};
