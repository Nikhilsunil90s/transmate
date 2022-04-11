import moment from "moment";

export const priceListdocRoad = {
  _id: "QgEDbGepecvQxXf2Y",
  customerId: "S56205",
  carrierId: "C02348",
  template: {
    type: "road"
  },
  title: "SBD - GLS parcels to DACH 01-01-2018",
  currency: "EUR",
  category: "standard",
  type: "contract",
  mode: "road",
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
  lanes: [
    {
      name: "Austria",
      id: "hXYFod",
      from: {
        zones: [
          {
            CC: "BE",
            from: "0000",
            to: "9999"
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "AT",
            from: "0000",
            to: "9999"
          }
        ]
      }
    },
    {
      name: "Germany",
      id: "avGMkf",
      from: {
        zones: [
          {
            CC: "BE",
            from: "0000",
            to: "9999"
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "DE",
            from: "00000",
            to: "99999"
          }
        ]
      }
    },
    {
      name: "Switzerland ³",
      id: "44g5sR",
      from: {
        zones: [
          {
            CC: "BE",
            from: "0000",
            to: "9999"
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "CH",
            from: "0000",
            to: "9999"
          }
        ]
      }
    }
  ],
  volumes: [
    {
      id: "QC4qok",
      uom: "kg",
      serviceLevel: "LTL",
      ranges: [
        {
          id: "tcYNFt",
          from: 0,
          to: 5
        },
        {
          id: "4M9oXn",
          from: 5,
          to: 10
        },
        {
          id: "sTzwkM",
          from: 10,
          to: 15
        },
        {
          id: "Ci9nZK",
          from: 15,
          to: 25
        },
        {
          id: "de4re4",
          from: 25,
          to: 30
        },
        {
          id: "okCZwX",
          from: 30,
          to: 40
        }
      ]
    }
  ],
  defaultLeadTime: {
    leadTimeHours: 24,
    days: [true, true, true, true, true, false, false],
    frequency: "weekly"
  },
  notes:
    '<div>Tariff validity</div><div><ul><li>Maximum dimensions per parcel:</li><ul><li>Maximum: 200 cm x 80 cm x 60 cm</li><li>Circumference (1 x length + 2 x height + 2 x width): 300 cm at most."</li></ul><li><span style="letter-spacing: 0.015em;">Transportation of dangerous goods is not permitted.&nbsp;</span>Goods covered by the LQ regulations are permitted only for destinations via road.</li><li>Unforseeable and/or extraordinary increases of costs that are based upon legal regulations or laws (eg. change of road toll) shall entitle GLS to adjust the stipulated prices accordingly.</li><li>Prices are given in Euros, exclusive of VAT.&nbsp;</li><li>The listed shipment prices are subject to surcharges.</li><li>These prices are based on reported volumes. Should actual volumes differ more than 10% from reported volumes, GLS reserves the right to adjust these prices accordingly.&nbsp;</li><li>Your discounts have already been deducted from this tariff.</li><li>The tariff conditions and general terms and conditions are an integral part of this agreement.</li></ul></div>',
  specialRequirements: [],
  terms: {
    days: 30,
    condition: "days"
  },

  created: {
    by: "Gi9g3pMAsMkzXEaRk",
    at: new Date()
  },
  creatorId: "S56205",
  status: "active",
  fuelIndexId: "KG8ipgs8zzjjEsNiy",
  summary: {
    laneCount: 3,
    rateCount: 19
  },
  carrierName: "GLS Belgium NV/SA"
};

export const priceListRateDocsRoad = [
  {
    name: "kilometer toll",
    type: "calculated",
    costId: "Qct3Ynk9widGu6mJX",
    multiplier: "shipment",
    amount: { value: 0.04, unit: "EUR" },
    priceListId: "QgEDbGepecvQxXf2Y",
    rules: [],
    laneId: null
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 9.85, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "okCZwX" },
      { laneId: "hXYFod" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "hXYFod"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 6.42, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "sTzwkM" },
      { laneId: "44g5sR" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "44g5sR"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 5.9, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "sTzwkM" },
      { laneId: "hXYFod" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "hXYFod"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 2.91, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "sTzwkM" },
      { laneId: "avGMkf" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "avGMkf"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 5.9, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "tcYNFt" },
      { laneId: "hXYFod" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "hXYFod"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 2.91, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "tcYNFt" },
      { laneId: "avGMkf" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "avGMkf"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 2.91, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "de4re4" },
      { laneId: "avGMkf" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "avGMkf"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 6.42, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "Ci9nZK" },
      { laneId: "44g5sR" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "44g5sR"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 11.33, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "okCZwX" },
      { laneId: "avGMkf" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "avGMkf"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 6.42, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "de4re4" },
      { laneId: "44g5sR" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "44g5sR"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 5.9, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "4M9oXn" },
      { laneId: "hXYFod" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "hXYFod"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 6.42, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "4M9oXn" },
      { laneId: "44g5sR" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "44g5sR"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 16.59, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "okCZwX" },
      { laneId: "44g5sR" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "44g5sR"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 6.42, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "tcYNFt" },
      { laneId: "44g5sR" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "44g5sR"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 2.91, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "Ci9nZK" },
      { laneId: "avGMkf" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "avGMkf"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 2.91, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "4M9oXn" },
      { laneId: "avGMkf" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "avGMkf"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 5.9, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "Ci9nZK" },
      { laneId: "hXYFod" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "hXYFod"
  },
  {
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 5.9, unit: "EUR" },
    meta: { source: "table" },
    rules: [
      { volumeGroupId: "QC4qok" },
      { volumeRangeId: "de4re4" },
      { laneId: "hXYFod" }
    ],
    priceListId: "QgEDbGepecvQxXf2Y",
    laneId: "hXYFod"
  }
];
