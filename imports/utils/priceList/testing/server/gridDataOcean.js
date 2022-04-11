import moment from "moment";

export const priceListdocOcean = {
  _id: "46QvPxktg4WBXgHjx",
  customerId: "S56205",
  carrierId: "C19443",
  base: "kg",
  title: "SBD - COSCO",
  currency: "EUR",
  category: "standard",
  type: "contract",
  mode: "ocean",
  validFrom: moment()
    .startOf("day")
    .subtract(1, "year")
    .toDate(),
  validTo: moment()
    .startOf("day")
    .add(1, "year")
    .toDate(),
  uoms: {
    allowed: ["kg"]
  },
  created: {
    by: "Gi9g3pMAsMkzXEaRk",
    at: "2019-03-27T16:17:26.967Z"
  },
  lanes: [
    {
      id: "k6CyGL",
      laneGroup: "",
      name: "Qingdao-London gateway port",
      from: { locationIds: ["CNTAO"] },
      to: { locationIds: ["GBLGP"] },
      leadtime: 240
    },
    {
      id: "exegBM",
      laneGroup: "",
      name: "Qingdao-Antwerp",
      from: { locationIds: ["CNTAO"] },
      to: { locationIds: ["BEANR"] },
      leadtime: 240
    },
    {
      id: "ia7HTr",
      laneGroup: "",
      name: "Qingdao-Le Havre",
      from: { locationIds: ["CNTAO"] },
      to: { locationIds: ["FRLEH"] },
      leadtime: 240
    },
    {
      id: "GNc3oJ",
      laneGroup: "",
      name: "Qingdao-Felixstowe",
      from: { locationIds: ["CNTAO"] },
      to: { locationIds: ["GBFXT"] },
      leadtime: 240
    },
    {
      id: "JnniF5",
      laneGroup: "",
      name: "Qingdao-Felixstowe/Southampton",
      from: { locationIds: ["CNTAO"] },
      to: { locationIds: ["GBSOU"] },
      leadtime: 240
    },
    {
      id: "rGrbmP",
      laneGroup: "",
      name: "Qingdao-Southampton",
      from: { locationIds: ["CNTAO"] },
      to: { locationIds: ["GBSOU"] },
      leadtime: 240
    },
    {
      id: "KybdDJ",
      laneGroup: "",
      name: "Shanghai-London gateway port",
      from: { locationIds: ["CNSHA"] },
      to: { locationIds: ["GBLGP"] },
      leadtime: 240
    },
    {
      id: "Mc2Zjy",
      laneGroup: "",
      name: "Shanghai-Antwerp",
      from: { locationIds: ["CNSHA"] },
      to: { locationIds: ["BEANR"] },
      leadtime: 240
    },
    {
      id: "B7y5Ly",
      laneGroup: "",
      name: "Shanghai-Le Havre",
      from: { locationIds: ["CNSHA"] },
      to: { locationIds: ["FRLEH"] },
      leadtime: 240
    },
    {
      id: "fYXhTB",
      laneGroup: "",
      name: "Shanghai-Felixstowe",
      from: { locationIds: ["CNSHA"] },
      to: { locationIds: ["GBFXT"] },
      leadtime: 240
    },
    {
      id: "wYKgpH",
      laneGroup: "",
      name: "Shanghai-Felixstowe/Southampton",
      from: { locationIds: ["CNSHA"] },
      to: { locationIds: ["GBSOU"] },
      leadtime: 240
    },
    {
      id: "s5wrLS",
      laneGroup: "",
      name: "Shanghai-Gdansk/Gdynia",
      from: { locationIds: ["CNSHA"] },
      to: { locationIds: ["PLGDN"] },
      leadtime: 240
    },
    {
      id: "ZSNQ7P",
      laneGroup: "",
      name: "Shanghai-Rotterdam",
      from: { locationIds: ["CNSHA"] },
      to: { locationIds: ["NLRTM"] },
      leadtime: 240
    },
    {
      id: "a3CrqW",
      laneGroup: "",
      name: "Shanghai-Southampton",
      from: { locationIds: ["CNSHA"] },
      to: { locationIds: ["GBSOU"] },
      leadtime: 240
    },
    {
      id: "yNS9cg",
      laneGroup: "",
      name: "Shekou-Antwerp",
      from: { locationIds: ["CNSHK"] },
      to: { locationIds: ["BEANR"] },
      leadtime: 240
    },
    {
      id: "K3wdgi",
      laneGroup: "",
      name: "Yantian-London gateway port",
      from: { locationIds: ["CNYTN"] },
      to: { locationIds: ["GBLGP"] },
      leadtime: 240
    },
    {
      id: "Gw6Jws",
      laneGroup: "",
      name: "Yantian-Antwerp",
      from: { locationIds: ["CNYTN"] },
      to: { locationIds: ["BEANR"] },
      leadtime: 240
    },
    {
      id: "nEdGh5",
      laneGroup: "",
      name: "Yantian-Le Havre",
      from: { locationIds: ["CNYTN"] },
      to: { locationIds: ["FRLEH"] },
      leadtime: 240
    },
    {
      id: "vNJsQ5",
      laneGroup: "",
      name: "Yantian-Felixstowe",
      from: { locationIds: ["CNYTN"] },
      to: { locationIds: ["GBFXT"] },
      leadtime: 240
    },
    {
      id: "XPNSQ4",
      laneGroup: "",
      name: "Yantian-Felixstowe/Southampton",
      from: { locationIds: ["CNYTN"] },
      to: { locationIds: ["GBSOU"] },
      leadtime: 240
    },
    {
      id: "gFMTeg",
      laneGroup: "",
      name: "Yantian-Southampton",
      from: { locationIds: ["CNYTN"] },
      to: { locationIds: ["GBSOU"] },
      leadtime: 240
    },
    {
      id: "B65tzw",
      laneGroup: "",
      name: "Port Klang-Hamburg",
      from: { locationIds: ["MYPKG"] },
      to: { locationIds: ["DEHAM"] },
      leadtime: 240
    },
    {
      id: "dqzMcG",
      laneGroup: "",
      name: "Tanjung Pelepas-Antwerp",
      from: { locationIds: ["MYTPP"] },
      to: { locationIds: ["BEANR"] },
      leadtime: 240
    },
    {
      id: "KRKjSt",
      laneGroup: "",
      name: "Kaohsiung-Felixstowe",
      from: { locationIds: ["TWKHH"] },
      to: { locationIds: ["GBFXT"] },
      leadtime: 240
    },
    {
      id: "naq4Hb",
      laneGroup: "",
      name: "Kaohsiung-Southampton",
      from: { locationIds: ["TWKHH"] },
      to: { locationIds: ["GBSOU"] },
      leadtime: 240
    },
    {
      id: "DCoseL",
      laneGroup: "",
      name: "Kaohsiung-London gateway port",
      from: { locationIds: ["TWKHH"] },
      to: { locationIds: ["GBLGP"] },
      leadtime: 240
    },
    {
      id: "bPC8cH",
      laneGroup: "",
      name: "Taichung-London gateway port",
      from: { locationIds: ["TWTXG"] },
      to: { locationIds: ["GBLGP"] },
      leadtime: 240
    },
    {
      id: "3tHpTi",
      laneGroup: "",
      name: "Taichung-Felixstowe",
      from: { locationIds: ["TWTXG"] },
      to: { locationIds: ["GBFXT"] },
      leadtime: 240
    },
    {
      id: "MPYPZ6",
      laneGroup: "",
      name: "Taichung-Southampton",
      from: { locationIds: ["TWTXG"] },
      to: { locationIds: ["GBSOU"] },
      leadtime: 240
    },
    {
      id: "WJDMb8",
      laneGroup: "",
      name: "Taipei-London gateway port",
      from: { locationIds: ["TWTPE"] },
      to: { locationIds: ["GBLGP"] },
      leadtime: 240
    },
    {
      id: "MQYz9Q",
      laneGroup: "",
      name: "Taipei-Felixstowe",
      from: { locationIds: ["TWTPE"] },
      to: { locationIds: ["GBFXT"] },
      leadtime: 240
    },
    {
      id: "ms8ceJ",
      laneGroup: "",
      name: "Taipei-Southampton",
      from: { locationIds: ["TWTPE"] },
      to: { locationIds: ["GBSOU"] },
      leadtime: 240
    }
  ],
  defaultLeadTime: {
    leadTimeHours: 168,
    days: [true, true, true, true, true, false, false],
    frequency: "weekly"
  },
  status: "active",
  terms: {
    days: 30,
    condition: "days"
  },
  template: {
    type: "ocean"
  },
  specialRequirements: [],
  creatorId: "S56205",
  carrierName: "Cosco",
  summary: {
    laneCount: 32,
    rateCount: 1374
  },
  equipments: [
    {
      name: "40GE",
      types: ["40GE"],
      id: "4ZbRKs"
    },
    {
      name: "40HC",
      types: ["40HC", "40HQ"],
      id: "5jWjnb"
    },
    {
      name: "20GE",
      types: ["20GE"],
      id: "AaHr9z"
    }
  ],
  charges: [
    {
      id: "z3G9DwtDfKmhSiNWy",
      name: "Origin Door to Origin Port",
      type: "calculated",
      costId: "2oCaqqYeje5kps2Si",
      currency: "TWD",
      multiplier: "equipment",
      meta: {
        leg: "preliminary",
        type: "origin",
        color: "yellow"
      }
    },
    {
      id: "4qTbNpRsHx6QZh9fE",
      name: "Origin Terminal Handling Fee",
      type: "calculated",
      costId: "5hTGAkq8rzJRPSnHx",
      currency: "TWD",
      multiplier: "equipment",
      meta: {
        leg: "preliminary",
        type: "origin",
        color: "yellow"
      }
    },
    {
      id: "yQRMijAzqNJxpstDD",
      name: "Origin Export Customs",
      type: "calculated",
      costId: "6j29iWhqLXxpbgbj6",
      currency: "TWD",
      multiplier: "equipment",
      meta: {
        leg: "preliminary",
        type: "origin",
        color: "yellow"
      }
    },
    {
      id: "Eij6qHHfXEgrgTqZK",
      name: "Origin BL Fee",
      type: "calculated",
      costId: "B63vDM5j3TCn63gsX",
      currency: "TWD",
      multiplier: "bl",
      meta: {
        leg: "preliminary",
        type: "origin",
        color: "yellow"
      }
    },
    {
      id: "7mvgPoFvYFdhRQ2tw",
      name: "Origin Handling Fee",
      type: "calculated",
      costId: "6bxQSaQCsZX8ZegSx",
      currency: "TWD",
      multiplier: "equipment",
      meta: {
        leg: "preliminary",
        type: "origin",
        color: "yellow"
      }
    },
    {
      id: "dazZ3c3oAKA97TJKW",
      name: "Other Origin Fee 1",
      type: "calculated",
      costId: "tKriCZxRiHQBCZ8dd",
      currency: "TWD",
      multiplier: "equipment",
      meta: {
        leg: "preliminary",
        type: "origin",
        color: "yellow"
      }
    },
    {
      id: "PWqFRRpy92XizumyK",
      name: "Other origin fee 2",
      type: "calculated",
      costId: "4its7RuGpC33NE9jn",
      currency: "TWD",
      multiplier: "equipment",
      meta: {
        leg: "preliminary",
        type: "origin",
        color: "yellow"
      }
    },
    {
      id: "bfciSmAXv6EMyy93q",
      name: "Other Origin fee 3",
      type: "calculated",
      costId: "4its7RuGpC33NE9jn",
      currency: "TWD",
      multiplier: "equipment",
      meta: {
        leg: "preliminary",
        type: "origin",
        color: "yellow"
      }
    },
    {
      id: "Nzhn5q6f4EH5y7yQ2",
      name: "AMS / ENS / ACI",
      type: "calculated",
      costId: "B63vDM5j3TCn63gsX",
      currency: "USD",
      multiplier: "equipment",
      meta: {
        leg: "main",
        type: "ocean",
        color: "blue"
      }
    },
    {
      id: "kvrTMnuzXcpMvACTg",
      name: "Ocean Freight",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "EUR",
      multiplier: "equipment",
      meta: {
        leg: "main",
        type: "ocean",
        color: "blue"
      }
    },
    {
      id: "aoY7oMmHRiYMruTBj",
      name: "Ocean BUC",
      type: "calculated",
      costId: "ivFeGad3zFM3XwRZT",
      currency: "EUR",
      multiplier: "equipment",
      comment: "bunker charges",
      meta: {
        leg: "main",
        type: "ocean",
        color: "blue"
      }
    },
    {
      id: "3vww2WBhcL7xRPWjx",
      name: "LSS / Marpol / Green Fuel",
      type: "calculated",
      costId: "tKriCZxRiHQBCZ8ZB",
      currency: "USD",
      multiplier: "equipment",
      meta: {
        leg: "main",
        type: "ocean",
        color: "blue"
      }
    },
    {
      id: "NNfmdcaToh7FowGzY",
      name: "Security",
      type: "calculated",
      costId: "p6ruTJAFe5RSWuYiH",
      currency: "USD",
      multiplier: "equipment",
      meta: {
        leg: "main",
        type: "ocean",
        color: "blue"
      }
    },
    {
      id: "sBFq9uAMB6FCztBYD",
      name: "Canal Fees",
      type: "calculated",
      costId: "u6saXRFyfLxh6sBdz",
      currency: "USD",
      multiplier: "equipment",
      meta: {
        leg: "main",
        type: "ocean",
        color: "blue"
      }
    },
    {
      id: "CL6tkaZBEadiQ8zBa",
      name: "Other Ocean Fee 1",
      type: "calculated",
      costId: "4its7RuGpC33NE9jn",
      currency: "USD",
      multiplier: "equipment",
      meta: {
        leg: "main",
        type: "ocean",
        color: "blue"
      }
    },
    {
      id: "jDocG7dq5WjpCrW3S",
      name: "Other Ocean Fee 2",
      type: "calculated",
      costId: "4its7RuGpC33NE9jn",
      currency: "USD",
      multiplier: "equipment",
      meta: {
        leg: "main",
        type: "ocean",
        color: "blue"
      }
    },
    {
      id: "8kLSr4KjoLpok8NMM",
      name: "Other Ocean Fee 3",
      type: "calculated",
      costId: "4its7RuGpC33NE9jn",
      currency: "USD",
      multiplier: "equipment",
      meta: {
        leg: "main",
        type: "ocean",
        color: "blue"
      }
    },
    {
      id: "5bSquiHXYo5o5AyPZ",
      name: "Destination THC",
      type: "calculated",
      costId: "tkcC2kyP56y8XMs49",
      currency: "GBP",
      multiplier: "equipment",
      meta: {
        leg: "subsequent",
        type: "destination",
        color: "green"
      }
    },
    {
      id: "CQNvjb895tXitoD9w",
      name: "Destination Port to Door",
      type: "calculated",
      costId: "o3yWN5TFgBGyFEFyT",
      currency: "GBP",
      multiplier: "equipment",
      meta: {
        leg: "subsequent",
        type: "destination",
        color: "green"
      }
    },
    {
      id: "SY3G5mY8FgFdLPXN7",
      name: "Drop off fee at final destination",
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
      id: "dFEPHAoECD7zhBszR",
      name: "Destination Fuel %",
      type: "calculated",
      costId: "rFRy3NwqyhaWwqJuJ",
      currency: "GBP",
      multiplier: "equipment",
      meta: {
        leg: "subsequent",
        type: "destination",
        color: "green"
      }
    },
    {
      id: "dXGvztBdg8vovHDZe",
      name: "Destination Fuel",
      type: "calculated",
      costId: "rFRy3NwqyhaWwqJuJ",
      currency: "GBP",
      multiplier: "equipment",
      meta: {
        leg: "subsequent",
        type: "destination",
        color: "green"
      }
    },
    {
      id: "p2phvZBNTZzNitDmm",
      name: "Destination Handling charges",
      type: "calculated",
      costId: "qKnixHtnu5nsk2vzg",
      currency: "GBP",
      multiplier: "equipment",
      meta: {
        leg: "subsequent",
        type: "destination",
        color: "green"
      }
    },
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
  ]
};
