export const charges = [
  {
    id: "fdfLSabAJacnzP43M",
    name: "Destination Document Fee",
    type: "calculated",
    costId: "8afvmTB5a8wE4jET8",
    currency: "GBP",
    multiplier: "equipment",
    meta: {
      leg: "subsequent",
      type: "destination",
      color: "green"
    }
  },
  {
    id: "j3xi7D44DgmYz3GcN",
    name: "Destination Port Security",
    type: "calculated",
    costId: "p6ruTJAFe5RSWuYiH",
    currency: "GBP",
    multiplier: "equipment",
    meta: {
      leg: "subsequent",
      type: "destination",
      color: "green"
    }
  },
  {
    id: "yrjkDhs57JEFZam4N",
    name: "Other Destination Fee 1",
    type: "calculated",
    costId: "4its7RuGpC33NE9jn",
    currency: "GBP",
    multiplier: "equipment",
    meta: {
      leg: "subsequent",
      type: "destination",
      color: "green"
    }
  },
  {
    id: "YeHuGYpKWNNuetmYR",
    name: "Other Destination Fee 2",
    type: "calculated",
    costId: "4its7RuGpC33NE9jn",
    currency: "GBP",
    multiplier: "equipment",
    meta: {
      leg: "subsequent",
      type: "destination",
      color: "green"
    }
  },
  {
    id: "wf2eH8Ebu2YoRHoME",
    name: "Other Destination Fee 3",
    type: "calculated",
    costId: "4its7RuGpC33NE9jn",
    currency: "GBP",
    multiplier: "equipment",
    meta: {
      leg: "subsequent",
      type: "destination",
      color: "green"
    }
  }
];

export const lanes = [
  {
    id: "9RJZeR",
    laneGroup: "Germany",
    name: "DE-80 (example)",
    from: {
      zones: [
        {
          CC: "DE",
          from: "10000",
          to: ""
        },
        {
          CC: "DE",
          from: "10000",
          to: ""
        }
      ]
    },
    to: {
      zones: [
        {
          CC: "DE",
          from: "80000",
          to: ""
        },
        {
          CC: "DE",
          from: "85000",
          to: ""
        }
      ]
    }
  },

  {
    name: "zone 1",
    from: {
      addressIds: ["WJNLceXYjFBdYL4YQ"]
    },
    to: {
      zones: [
        {
          CC: "ES",
          from: "28000",
          to: "28999"
        }
      ]
    },
    id: "ttqfKC"
  }
];

export const volumes = [
  {
    id: "tLo5Q6",
    uom: "kg",
    serviceLevel: "LTL",
    ranges: [
      {
        id: "nJxN56",
        from: 0,
        to: 15000,
        name: "0-15000 kg LTL",
        comment: "partial load"
      }
    ]
  },
  {
    id: "tLvYu3",
    uom: "kg",
    serviceLevel: "FTL",
    ranges: [
      {
        id: "nk94ox",
        from: 15000,
        to: 25000,
        name: "15000-25000 kg FTL",
        comment: "full truck load"
      },
      {
        id: "nKdAnB",
        from: 25000,
        to: 30000,
        name: "25000-30000 kg FTL",
        comment: "oversized loads"
      }
    ]
  }
];

export const equipments = [
  {
    name: "20GE",
    types: ["20GE"],
    id: "RgZfNo"
  },
  {
    name: "40GE",
    types: ["40GE"],
    id: "isNWwi"
  },
  {
    name: "40HQ",
    types: ["40HC"],
    id: "uiALBt"
  }
];
