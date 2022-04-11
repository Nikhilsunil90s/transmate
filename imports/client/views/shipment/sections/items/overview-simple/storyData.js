/** nested data that can be grouped */
export const nestedItemsData = [
  {
    _id: "Fe9FSDyJjFC2NnfRS",
    level: 0,
    quantity: {
      amount: 10,
      code: "20GE"
    },
    type: "TU",
    commodity: "04069078",
    description: "20 ft container",
    references: {
      containerNo: "102",
      truckId: "102"
    },
    DG: true,
    weight_net: 1000,
    weight_gross: 1200,
    weight_unit: "kg",
    taxable: [
      {
        type: "pal",
        quantity: 10
      },
      {
        type: "kg",
        quantity: 15000
      }
    ]
  },
  {
    _id: "dbALKAkJMKbu9enah",
    parentItemId: "Fe9FSDyJjFC2NnfRS",
    level: 1,
    quantity: {
      amount: 10,
      code: "PAL"
    },
    temperature: {
      condition: ""
    },
    type: "HU",
    description: "testing pallet",
    taxable: [
      {
        type: "pal",
        quantity: 10
      }
    ],
    weight_gross: 100,
    weight_net: 80,
    weight_unit: "kg"
  },
  {
    _id: "dbALKAkJMKbu9enXX",
    parentItemId: "Fe9FSDyJjFC2NnfRS",
    level: 1,
    quantity: {
      amount: 200,
      code: "PAL"
    },
    type: "HU",
    description: "testing pallet numidia",
    material: {
      description: "Lactose, edible grade",
      id: "Lactoseediblegrade"
    },
    temperature: {
      condition: "2-4c"
    },
    taxable: [
      {
        type: "pal",
        quantity: 10
      }
    ],
    weight_gross: 100,
    weight_net: 80,
    weight_unit: "kg"
  },
  {
    _id: "zLs4W6phsvsDQhSTJ",
    level: 0,
    quantity: {
      amount: 1,
      code: "20GE"
    },
    type: "TU",
    description: "test",
    weight_net: 80,
    weight_gross: 1000,
    weight_unit: "lb",
    taxable: [
      {
        type: "pal",
        quantity: 20
      },
      {
        type: "kg",
        quantity: 20000
      }
    ]
  },
  {
    _id: "zLs4W6phsvsDQhSTJ",
    level: 0,
    quantity: {
      amount: 1,
      code: "20GE"
    },
    type: "TU",
    description: "test only weight no unit",
    weight_gross: 3000,

    taxable: [
      {
        type: "pal",
        quantity: 20
      },
      {
        type: "kg",
        quantity: 20000
      }
    ]
  },
  {
    _id: "zLs4W6phsvsDQhSTJ",
    level: 0,
    quantity: {
      amount: 1,
      code: "20GE"
    },
    type: "TU",
    description: "test only unit",
    weight_unit: "lbs",

    taxable: [
      {
        type: "pal",
        quantity: 20
      },
      {
        type: "kg",
        quantity: 20000
      }
    ]
  },
  {
    _id: "zLs4W6phsvsDQhSTJ",
    level: 0,
    quantity: {
      amount: 1,
      code: "20GE"
    },
    type: "TU",
    description: "test wrong unit",
    weight_unit: "na",
    weight_gross: 3000,
    taxable: [
      {
        type: "pal",
        quantity: 20
      },
      {
        type: "kg",
        quantity: 20000
      }
    ]
  }
];
