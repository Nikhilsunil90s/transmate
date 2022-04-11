export const tenderDetailDocs2 = [
  {
    _id: "TYQYoEiAHMmw2RH44",
    accountId: "S03991",
    goodsDG: true,
    laneId: "CG5THg",
    tenderId: "zHkKhS92cXQFNTzT3",
    volumeGroupId: "aTmCfn",
    volumeRangeId: "a4AL5w",
    lanes: {
      name: "test Lane with location",
      id: "CG5THg",
      from: {
        locationIds: ["tvLLPN6mF3mGttCY6"],
        location: [
          {
            _id: "tvLLPN6mF3mGttCY6",
            countryCode: "DK",
            locationCode: "FRA",
            name: "Fraugde"
          }
        ]
      },
      to: { zones: [{ CC: "FR", from: "4", to: "5" }] },
      incoterm: "FCA"
    },
    name: "test Lane with location (16-20 pal) - DG",
    quantity: { count: 3 },
    updated: {
      by: "vD3jmwtBRXWmRM3TY",
      at: new Date("2019-10-28T10:59:53.612Z")
    },
    volumes: {
      uom: "pal",
      serviceLevel: "LTL",
      ranges: { from: 16, to: 20, id: "a4AL5w", name: "16-20 pal" },
      id: "aTmCfn"
    }
  }
];
