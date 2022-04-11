export const scopeData = {
  lanes: [
    {
      name: "1",
      from: {
        addressIds: ["TeMASsT9nfMWgx34X"],
        locationIds: ["BEANR"]
      },
      to: {
        zones: [
          {
            CC: "FR",
            from: "01000",
            to: "01999"
          }
        ]
      },
      stops: [
        { type: "portOfLoading", addressId: "j958tYA872PAogTDq" },
        { type: "portOfDischarge", locationId: "USNYK" }
      ],
      id: "ZYfo2B"
    },
    {
      name: "2",
      from: {
        addressIds: ["TeMASsT9nfMWgx34X"]
      },
      to: {
        zones: [
          {
            CC: "FR",
            from: "02000",
            to: "02999"
          }
        ]
      },
      id: "QKju9X"
    },
    {
      name: "3",
      from: {
        addressIds: ["TeMASsT9nfMWgx34X"]
      },
      to: {
        zones: [
          {
            CC: "FR",
            from: "03000",
            to: "03999"
          }
        ]
      },
      id: "ffAMMg"
    }
  ],
  equipments: [
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
  definition: ["volumes", "equipments", "seasonality", "DG"],
  type: "input"
};
