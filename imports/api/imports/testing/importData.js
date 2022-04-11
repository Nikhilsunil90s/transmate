export const importDoc = {
  _id: "NEY5X4iRHASAJyHEh",
  accountId: "S56205",
  type: "test",
  created: {
    by: "Gi9g3pMAsMkzXEaRk",
    at: new Date("2019-10-16T15:14:58.964+02:00")
  },
  progress: {
    data: 100,
    lookup: 100,
    mapping: 100,
    jobs: 100,
    process: 0
  },
  headers: [
    "shipment",
    "from_country",
    "from_postal_code",
    "to_country",
    "to_postal_code",
    "qty_kg",
    "qty_lm",
    "qty_cm",
    "qty_m3",
    "qty_l",
    "qty_pal",
    "base",
    "cost",
    "currency",
    "departure_date",
    "arrival_date",
    "category",
    "transport_mode",
    "ftl",
    "milkrun"
  ],
  mapping: {
    values: {
      ftl: {
        FTL: "FTL",
        LTL: "LTL",
        Parcel: "parcel"
      }
    },
    headers: {
      arrival_date: "stage.dates.delivery.arrival.planned",
      base: "ignore",
      departure_date: "stage.dates.pickup.arrival.planned",
      from_country: "stage.from.address.country",
      from_postal_code: "stage.from.address.zip",
      ftl: "shipment.serviceLevel",
      qty_cm: "ignore",
      qty_kg: "item.volume.kg",
      qty_lm: "item.volume.lm",
      qty_m3: "ignore",
      qty_pal: "item.volume.pal",
      shipment: "shipment.references.number",
      to_country: "stage.to.address.country",
      to_postal_code: "stage.to.address.zip",
      transport_mode: "stage.mode"
    }
  },
  total: {
    shipments: 2,
    jobs: 2
  },
  settings: {
    numberFormat: "",
    dateFormat: "YYYY-MM-DD"
  }
};
