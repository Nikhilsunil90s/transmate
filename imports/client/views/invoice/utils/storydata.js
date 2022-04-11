export const dummyProps = {
  _id: "BbmA9bLadM6vuCWdz",
  carrierId: "C75701",
  carrierName: "Carrier PlayCo",
  partnerId: "C75701",
  number: "Demo invoice",
  status: "open",
  invoiceCurrency: "EUR",
  date: "2018-11-22T00:00:00.000Z",
  shipments: [
    {
      shipmentId: "kRAzEZB8LGhZGKMvk",
      invoiceItemId: "3G5eTrGEq7ExKk385",
      number: "9IQGMJCG",
      invoice: {
        base: 2000,
        fuel: 0,
        total: 2150,
        hasUnmappedCosts: false,
        fuelPct: 0
      },
      calculated: {
        base: 2000,
        fuel: 0,
        additional: 150,
        total: 2150,
        orgCurrency: "EUR",
        fuelPct: 0,
        exchangeDate: "2017-10-30T00:00:00.000Z"
      },
      hasCosts: true,
      hasInvoiceCosts: true,
      dateMatch: {
        match: true
      },
      delta: 0,
      deltaFuelPct: null
    },
    {
      shipmentId: "reYJrdSxbR5CDzjWq",
      invoiceItemId: "JbjZi8f4Q32hmYcPH",
      number: "HEYWPYHM",
      invoice: {
        base: 780,
        fuel: 0,
        total: 795,
        hasUnmappedCosts: false,
        fuelPct: 0
      },
      calculated: {
        base: 784,
        fuel: 0,
        additional: 15,
        total: 799,
        orgCurrency: "EUR",
        fuelPct: 0,
        exchangeDate: new Date("2018-11-21T00:00:00.000Z")
      },
      hasCosts: true,
      hasInvoiceCosts: true,
      dateMatch: {
        match: true
      },
      delta: -4,
      deltaFuelPct: null
    }
  ],
  totals: {
    dateMismatch: 0,
    invHasCostCount: 2,
    shipHasCostCount: 2,
    largeDeltaCount: 0,
    shipCount: 2,
    shipment: {
      base: 2784,
      fuel: 0,
      total: 2949
    },
    invoice: {
      base: 2780,
      fuel: 0,
      total: 2945
    },
    delta: -4
  }
};

export const dummyMapping = [
  {
    code: "ZTL",
    description: "Ztl – Limited Traffic Zone",
    costId: "JpKrR3PggDfp8dnNP"
  },
  {
    code: "FUEL",
    description: "Fuel Surcharge",
    costId: "tKriCZxRiHQBCZ8ZB"
  },
  {
    description: "To Floors",
    costId: "JpKrR3PggDfp8dnNP"
  },
  {
    description: "Priority",
    costId: "JpKrR3PggDfp8dnNP"
  },
  {
    description: "Pod Image",
    costId: "JpKrR3PggDfp8dnNP"
  },
  {
    description: "Pick Up Cancelled",
    costId: "JpKrR3PggDfp8dnNP"
  }
];

export const costOptions = [
  { id: "JpKrR3PggDfp8dnNP", group: "dummy", cost: "please map" },
  { id: "tKriCZxRiHQBCZ8ZB", group: "fuel", cost: "Fuel adjustment" }
];

// data as received from GQL:
export const availebleShipments = [
  {
    id: "4TvxoLP9b7EZ9rQBK",
    number: "BDQFJFCM",
    costs: [
      {
        id: null,
        costId: "o6fLThAWhaWW3uDaj",
        description: null,
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 600,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      },
      {
        id: null,
        costId: "o7sz5GxWpMLQTojHu",
        description: "Order Cost",
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 25,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      }
    ],
    references: {
      number: "BDQFJFCM",
      carrier: null,
      __typename: "ReferencesType"
    },
    pickup: {
      location: {
        name: "Globex Belgium",
        countryCode: "BE",
        zipCode: "1930",
        addressId: "j958tYA872PAogTDq",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1506470400000,
      __typename: "PickupType"
    },
    delivery: {
      location: {
        name: "Globex Spain",
        countryCode: "ES",
        zipCode: "28500",
        addressId: "WJNLceXYjFBdYL4YQ",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1506556800000,
      __typename: "DeliveryType"
    },
    __typename: "Shipment"
  },
  {
    id: "6d364NTq9RMWv6J5b",
    number: "KCLQVF2V",
    costs: [
      {
        id: null,
        costId: "o6fLThAWhaWW3uDaj",
        description: null,
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 1100,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      },
      {
        id: null,
        costId: "o7sz5GxWpMLQTojHu",
        description: "Order Cost",
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 25,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      }
    ],
    references: null,
    pickup: {
      location: {
        name: "Globex Belgium",
        countryCode: "BE",
        zipCode: "1930",
        addressId: "j958tYA872PAogTDq",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1508284800000,
      __typename: "PickupType"
    },
    delivery: {
      location: {
        name: "Globex Spain",
        countryCode: "ES",
        zipCode: "28500",
        addressId: "WJNLceXYjFBdYL4YQ",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1508371200000,
      __typename: "DeliveryType"
    },
    __typename: "Shipment"
  },
  {
    id: "HGeaXFQxBKtQ27EXH",
    number: "WGQY4JWB",
    costs: [
      {
        id: null,
        costId: "o6fLThAWhaWW3uDaj",
        description: null,
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 1500,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      },
      {
        id: null,
        costId: "6bxQSaQCsZX8ZegSx",
        description: "Handling fee",
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 30,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      }
    ],
    references: null,
    pickup: {
      location: {
        name: "Globex Belgium",
        countryCode: "BE",
        zipCode: "1930",
        addressId: "j958tYA872PAogTDq",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1516266000000,
      __typename: "PickupType"
    },
    delivery: {
      location: {
        name: "Globex Spain",
        countryCode: "ES",
        zipCode: "28500",
        addressId: "WJNLceXYjFBdYL4YQ",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1516352400000,
      __typename: "DeliveryType"
    },
    __typename: "Shipment"
  },
  {
    id: "KgBbRn6h5b43dJrzn",
    number: "AC5NOZR4",
    costs: [
      {
        id: null,
        costId: "o6fLThAWhaWW3uDaj",
        description: null,
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: true,
        invoiceId: null,
        amount: {
          value: 2000,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      },
      {
        id: null,
        costId: "o7sz5GxWpMLQTojHu",
        description: "Order Cost",
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: true,
        invoiceId: null,
        amount: {
          value: 25,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      },
      {
        id: null,
        costId: "j5LzvJv82ud8zfjCN",
        description: "Quality check",
        tooltip: null,
        source: "input",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 50,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      },
      {
        id: null,
        costId: "NWRTR2hrFjBqBYJbC",
        description: "Waiting hours",
        tooltip: null,
        source: "input",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 30,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      }
    ],
    references: {
      number: "AC5NOZR4",
      carrier: null,
      __typename: "ReferencesType"
    },
    pickup: {
      location: {
        name: "Globex Belgium",
        countryCode: "BE",
        zipCode: "1930",
        addressId: "j958tYA872PAogTDq",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1497916800000,
      __typename: "PickupType"
    },
    delivery: {
      location: {
        name: "Globex Spain",
        countryCode: "ES",
        zipCode: "28500",
        addressId: "WJNLceXYjFBdYL4YQ",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1498176000000,
      __typename: "DeliveryType"
    },
    __typename: "Shipment"
  },
  {
    id: "hsF4uNEv9bCq5qReq",
    number: "SKDSRARB",
    costs: [
      {
        id: null,
        costId: "o6fLThAWhaWW3uDaj",
        description: null,
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 1100,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      },
      {
        id: null,
        costId: "o7sz5GxWpMLQTojHu",
        description: "Order Cost",
        tooltip: null,
        source: "priceList",
        priceListId: null,
        invoiced: null,
        invoiceId: null,
        amount: {
          value: 25,
          currency: "EUR",
          rate: 1,
          currencyDate: null,
          __typename: "AmountType"
        },
        added: {},
        accountId: "S65957",
        sellerId: null,
        date: null,
        forApproval: null,
        __typename: "CostsType"
      }
    ],
    references: {
      number: "AAEER",
      carrier: null,
      __typename: "ReferencesType"
    },
    pickup: {
      location: {
        name: "Globex Belgium",
        countryCode: "BE",
        zipCode: "1930",
        addressId: "j958tYA872PAogTDq",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1508198400000,
      __typename: "PickupType"
    },
    delivery: {
      location: {
        name: "Globex Spain",
        countryCode: "ES",
        zipCode: "28500",
        addressId: "WJNLceXYjFBdYL4YQ",
        locode: null,
        address: {},
        __typename: "FromToType"
      },
      date: 1508284800000,
      __typename: "DeliveryType"
    },
    __typename: "Shipment"
  }
];
