export const simpleResult = {
  costParams: {},
  costs: [
    {
      _id: "evbxzwnBY8dh43cDG",
      customerId: "S46614",
      carrierName: "24/7 design",
      title: "Spot rates 2020-05-18 ",
      category: "standard",
      mode: "road",
      validFrom: new Date("2020-05-18T10:04:22.268Z"),
      validTo: new Date("2021-05-18T10:04:22.268Z"),
      status: "declined",
      calculation: {
        quantity: { shipment: 1, stage: 1, stop: 1, BL: 1, doc: 1, kg: 20000 },
        errors: [],
        leadTime: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        }
      },
      costs: [
        {
          rate: {
            costId: "o6fLThAWhaWW3uDaj",
            name: "Base rate",
            meta: { source: "table" },
            amount: { unit: "EUR", value: 1000 },
            tooltip: "1000 EUR per shipment"
          },
          total: {
            listValue: 1100,
            listCurrency: "USD",
            exchange: 1,
            convertedValue: 1000,
            convertedCurrency: "EUR"
          }
        }
      ],
      totalCost: 1000,
      leadTime: {
        definition: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        },
        hours: 24
      },
      carrierId: "C34359",
      priceRequest: {
        id: "priceRequestId",
        notes:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      },
      bestLeadTime: true
    },
    {
      _id: "evbxzwnBY8dh43cDG",
      customerId: "S46614",
      carrierName: "24/7 design",
      title: "Spot rates 2020-05-18 ",
      category: "standard",
      mode: "road",
      validFrom: new Date("2020-05-18T10:04:22.268Z"),
      validTo: new Date("2021-05-18T10:04:22.268Z"),
      status: "declined",
      calculation: {
        quantity: { shipment: 1, stage: 1, stop: 1, BL: 1, doc: 1, kg: 20000 },
        errors: [],
        leadTime: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        }
      },
      costs: [
        {
          rate: {
            costId: "o6fLThAWhaWW3uDaj",
            name: "Base rate",
            meta: { source: "table" },
            amount: { unit: "EUR", value: 1000 },
            tooltip: "1000 EUR per shipment"
          },
          total: {
            listValue: 1100,
            listCurrency: "USD",
            exchange: 1.1,
            convertedValue: 1000,
            convertedCurrency: "EUR"
          }
        }
      ],
      totalCost: 1120,
      leadTime: {
        definition: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        },
        hours: 24
      },
      carrierId: "C34359",
      priceRequest: {
        id: "priceRequestId",
        notes: "short notes."
      },
      bestLeadTime: true
    },
    {
      _id: "evbxzwnBY8dh43cDG",
      customerId: "S46614",
      carrierName: "24/7 design",
      title: "Spot rates 2020-05-18 ",
      category: "standard",
      mode: "road",
      validFrom: new Date("2020-05-18T10:04:22.268Z"),
      validTo: new Date("2021-05-18T10:04:22.268Z"),
      status: "declined",
      calculation: {
        quantity: { shipment: 1, stage: 1, stop: 1, BL: 1, doc: 1, kg: 20000 },
        errors: [],
        leadTime: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        }
      },
      costs: [
        {
          rate: {
            costId: "o6fLThAWhaWW3uDaj",
            name: "Base rate",
            meta: { source: "table" },
            amount: { unit: "EUR", value: 1000 },
            tooltip: "1000 EUR per shipment"
          },
          total: {
            listValue: 1100,
            listCurrency: "USD",
            exchange: 1.1,
            convertedValue: 1000,
            convertedCurrency: "EUR"
          }
        }
      ],
      totalCost: 1120,
      leadTime: {
        definition: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        },
        hours: 24
      },
      carrierId: "C34359",
      priceRequest: {
        id: "priceRequestId"
      },
      bestLeadTime: true
    },
    {
      _id: "oaD8z5SsRo7qHbKQP",
      customerId: "S46614",
      carrierName: "24/7 design",
      title: "Spot rates 2020-05-18 ",
      category: "standard",
      mode: "road",
      validFrom: new Date("2020-05-18T10:07:24.138Z"),
      validTo: new Date("2021-05-18T10:07:24.139Z"),
      status: "active",
      calculation: {
        quantity: { shipment: 1, stage: 1, stop: 1, BL: 1, doc: 1, kg: 20000 },
        errors: [],
        leadTime: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        }
      },
      costs: [
        {
          rate: {
            costId: "o6fLThAWhaWW3uDaj",
            name: "Base rate",
            meta: { source: "table" },
            amount: { unit: "EUR", value: 1000 },
            tooltip: "1000 EUR per shipment"
          },
          total: {
            listValue: 1000,
            listCurrency: "EUR",
            exchange: 1,
            convertedValue: 1000,
            convertedCurrency: "EUR"
          }
        },
        {
          rate: {
            costId: "o6fLThAWhaWW3uDaj",
            name: "Fuel",
            calculation: {},
            amount: { value: 100, unit: "EUR" },
            tooltip: "100 EUR per kg"
          },
          total: {
            listValue: 2000000,
            listCurrency: "USD",
            exchange: 1,
            convertedValue: 2000000,
            convertedCurrency: "EUR"
          }
        }
      ],
      totalCost: 2001000,
      leadTime: {
        definition: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        },
        hours: 24
      },
      carrierId: "C34359",
      priceRequest: { notes: undefined }
    },
    {
      _id: "vJWQGj7S7vqK9YDsP",
      customerId: "S46614",
      carrierName: "24/7 design",
      title: "Spot rates 2020-05-19 ",
      category: "standard",
      mode: "road",
      validFrom: new Date("2020-05-19T12:32:35.025Z"),
      validTo: new Date("2021-05-19T12:32:35.025Z"),
      status: "active",
      calculation: {
        quantity: { shipment: 1, stage: 1, stop: 1, BL: 1, doc: 1, kg: 20000 },
        errors: [],
        leadTime: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        }
      },
      costs: [
        {
          rate: {
            costId: "o6fLThAWhaWW3uDaj",
            name: "Base rate",
            meta: { source: "table" },
            amount: { unit: "EUR", value: 568 },
            tooltip: "568 EUR per shipment"
          },
          total: {
            listValue: 568,
            listCurrency: "EUR",
            exchange: 1,
            convertedValue: 568,
            convertedCurrency: "EUR"
          }
        }
      ],
      totalCost: 568,
      leadTime: {
        definition: {
          leadTimeHours: 24,
          days: [true, true, true, true, true, false, false],
          frequency: "weekly"
        },
        hours: 24
      },
      carrierId: "C34359",
      priceRequest: { notes: undefined },
      bestCost: true
    }
  ]
};
