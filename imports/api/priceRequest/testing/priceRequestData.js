import businessDays from "/imports/api/_jsonSchemas/simple-schemas/_utilities/businessDays";

export const oceanParamsData = {
  equipments: [
    {
      quantity: 1,
      type: "20GE"
    },
    {
      quantity: 1,
      type: "40GE"
    }
  ],
  from: {
    countryCode: "CN",
    locationId: "CNNBO"
  },
  goods: {
    quantity: {}
  },
  serviceLevel: "LTL",
  to: {
    countryCode: "AE",
    locationId: "AEJEA"
  }
};

export const roadParamsData = {
  from: { zipCode: "3980", countryCode: "BE" },
  to: { zipCode: "3077AW", countryCode: "NL" },
  goods: { quantity: { kg: 3.7 } },
  equipments: []
};

export const roadRequestDoc = {
  _id: "Cbb5kTdr8nRsWeF46",
  customerId: "S56205",
  requestedBy: "Dsqp3CRYjFpF8rQbh",
  type: "spot",
  status: "draft",
  currency: "EUR",
  dueDate: businessDays(),
  created: {
    by: "Dsqp3CRYjFpF8rQbh",
    at: new Date()
  },
  creatorId: "S56205",
  items: [
    {
      shipmentId: "AxYYGxFQxGbZQtEBp",
      params: {
        from: {
          countryCode: "GB",
          zipCode: "ST19 5RZ"
        },
        to: {
          addressId: "HnpCfb426yry3G3TG",
          countryCode: "GB",
          zipCode: "NN4 7BN"
        },
        goods: {
          quantity: {
            kg: 100,
            pal: 1
          }
        },
        equipments: [],
        serviceLevel: "LTL"
      }
    },
    {
      shipmentId: "AxYYGxFQxGbZQtXXX",
      params: {
        from: {
          countryCode: "GB",
          zipCode: "ST19 5RZ"
        },
        to: {
          addressId: "HnpCfb426yry3G3TG",
          countryCode: "GB",
          zipCode: "NN4 7BN"
        },
        goods: {
          quantity: {
            kg: 200,
            pal: 2
          }
        },
        equipments: [],
        serviceLevel: "LTL"
      }
    }
  ]
};
