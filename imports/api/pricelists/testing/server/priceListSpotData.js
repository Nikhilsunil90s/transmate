export const priceListDoc = {
  _id: "THLc69jEGwEknNuJz",
  title: "PR_0610-PM7_V2 by C11051 2020-06-16",
  template: {
    type: "spot"
  },
  currency: "EUR",
  category: "standard",
  type: "spot",
  mode: "road",
  uoms: {
    allowed: ["kg"]
  },
  defaultLeadTime: {
    leadTimeHours: 24,
    days: [true, true, true, true, true, true, false],
    frequency: "weekly"
  },
  terms: {
    days: 30,
    condition: "days"
  },
  status: "for-approval",
  shipments: [
    {
      shipmentId: "xztZTpnGLNtBdJrQz",
      params: {
        shipmentId: "xztZTpnGLNtBdJrQz",
        from: {
          addressId: "j958tYA872PAogTDq",
          zipCode: "1930",
          countryCode: "BE"
        },
        to: {
          addressId: "WJNLceXYjFBdYL4YQ",
          zipCode: "28500",
          countryCode: "ES"
        },
        date: "2020-06-10",
        goods: {
          quantity: {
            pal: 10,
            kg: 100,
            m3: 0,
            lm: 0,
            l: 0
          }
        }
      },
      number: "WENOANWI",
      validated: true
    }
  ],
  charges: [
    {
      id: "kvrTMnuzXcpMvACTg",
      name: "Base rate",
      costId: "o6fLThAWhaWW3uDaj",
      type: "calculated",
      currency: "EUR",
      multiplier: "shipment"
    }
  ],
  settings: {
    canEditCurrency: true,
    canEditMultiplier: false,
    canEditCharges: true,
    canEditLanes: false,
    canEditLeadTimes: true,
    canCommentRates: false,
    canEditAdditionalCosts: false
  },
  creatorId: "S65957",
  customerId: "S65957",
  validFrom: new Date("2020-06-16T16:40:34.876+02:00"),
  validTo: new Date("2021-06-16T16:40:34.876+02:00"),
  priceRequestId: "fvxwvxmZbZFSnYpm7",
  carrierId: "C11051",
  created: {
    by: "BzWZ7puNeiB6Nf2Lk",
    at: new Date("2020-06-16T16:40:34.876+02:00")
  },
  carrierName: "Carrier Beta",
  updates: [
    {
      action: "created",
      userId: "BzWZ7puNeiB6Nf2Lk",
      accountId: "C11051",
      ts: new Date("2020-06-16T16:40:35.008+02:00")
    },
    {
      action: "releaseForApproval",
      userId: "BzWZ7puNeiB6Nf2Lk",
      accountId: "C11051",
      ts: new Date("2020-06-16T16:40:36.536+02:00")
    }
  ],
  updated: {
    by: "BzWZ7puNeiB6Nf2Lk",
    at: new Date("2020-06-16T16:40:36.924+02:00"),
    price_lists: "synced"
  },
  deleted: false,
  summary: {
    laneCount: 0,
    rateCount: 1
  }
};
