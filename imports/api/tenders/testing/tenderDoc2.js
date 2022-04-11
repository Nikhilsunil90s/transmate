export const tenderDoc2 = {
  _id: "zHkKhS92cXQFNTzT3",
  title: "New tender - 2019-10-23",
  contacts: [
    {
      userId: "jsBor6o3uRBTFoRQY",
      role: "owner"
    }
  ],
  status: "draft",
  created: {
    by: "jsBor6o3uRBTFoRQY",
    at: new Date("2019-10-21T13:31:12.910+02:00")
  },
  accountId: "S65957",
  number: "VMOK89",
  updated: {
    by: "jsBor6o3uRBTFoRQY",
    at: new Date("2019-10-23T17:31:06.690+02:00")
  },
  steps: ["general", "requirements", "scope", "data"],
  notes: {
    introduction: "Please add your notes here"
  },
  scope: {
    lanes: [
      {
        name: "test Lane with location",
        id: "CG5THg",
        from: {
          locationIds: ["DKFRA"]
        },
        to: {
          zones: [
            {
              CC: "FR",
              from: "4",
              to: "5"
            }
          ]
        },
        incoterm: "FCA"
      },
      {
        name: "test Lane with address",
        id: "CG5THg",
        from: {
          addressIds: ["ww66js5qWqa8q3ZLz"]
        },
        to: {
          zones: [
            {
              CC: "FR",
              from: "4",
              to: "5"
            }
          ]
        },
        incoterm: "FCA"
      }
    ],
    volumes: [
      {
        uom: "pal",
        serviceLevel: "LTL",
        ranges: [
          {
            from: 1,
            to: 5,
            id: "k7REAw",
            name: "1-5 pal"
          },
          {
            from: 5,
            to: 10,
            id: "wDr2mw",
            name: "5-10 pal"
          },
          {
            from: 11,
            to: 15,
            id: "Ant3aM",
            name: "11-15 pal"
          },
          {
            from: 16,
            to: 20,
            id: "a4AL5w",
            name: "16-20 pal"
          },
          {
            from: 20,
            to: 25,
            id: "EBeXEH",
            name: "20-25 pal"
          },
          {
            from: 25,
            to: 99,
            id: "4oRMGL",
            name: "25-99 pal"
          }
        ],
        id: "aTmCfn"
      }
    ],
    goodsDG: [true, false],
    definition: ["DG", "volumes"],
    source: {
      type: "priceList"
    }
  },
  requirements: [
    {
      title: "test",
      details: "test",
      type: "hard",
      responseType: "YN",
      id: "oHpYfZ"
    }
  ],
  bidders: [
    {
      accountId: "C75701",
      userIds: ["Zozq9coHkedoZ2gap"]
    }
  ],
  deleted: false
};
