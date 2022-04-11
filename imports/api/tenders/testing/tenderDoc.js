import faker from "faker";

// real-life document:
export const tenderDoc = {
  _id: "aC3BSt9gPjuCfY7A7",
  title: faker.lorem.sentence(),
  status: "review",
  contacts: [
    {
      userId: "W3WguXKt2cLu2h8LM",
      role: "owner"
    }
  ],
  created: {
    by: "W3WguXKt2cLu2h8LM",
    at: new Date("2019-04-29T23:02:15.904+02:00"),
    atms: 1556571735904
  },
  accountId: "S00001",
  number: "PDGUXZ",
  steps: ["general", "requirements", "scope", "data", "profile"],
  notes: {
    introduction: faker.lorem.paragraphs()
  },
  scope: {
    lanes: [
      {
        name: "Lane 1",
        id: "6cFkZC",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*"
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "GB",
              from: "*"
            }
          ]
        }
      },
      {
        name: "lane 2",
        id: "6cFkZ1",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*"
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "GB",
              from: "*"
            }
          ]
        }
      },
      {
        name: "lane 3",
        id: "6cFkZ2",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*"
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "GB",
              from: "*"
            }
          ]
        }
      },
      {
        name: "lane 4",
        id: "6cFkZ3",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*"
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "GB",
              from: "*"
            }
          ]
        }
      },
      {
        name: "lane 5",
        id: "ceZzpt",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*"
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "IE",
              from: "*"
            }
          ]
        },
        incoterm: "CPT"
      }
    ],
    equipments: [
      {
        name: "45 FT container",
        types: ["45FT"],
        id: "HZvhiC"
      }
    ],
    definition: ["equipments", "equipments"],
    source: {
      type: "priceList",
      id: "sHvBSWd92ZFNWfj3Y"
    }
  },
  packages: [
    {
      pickupCountry: "PT",
      bidGroups: [
        {
          pickupCountry: "PT",
          pickupZip: "*",
          deliveryCountry: "GB",
          deliveryZip: "*",
          shipmentIds: [],
          quantity: {
            scopeCount: 1,
            shipCount: 192,
            totalAmount: 192,
            avgAmount: 192,
            minAmount: 192,
            maxAmount: 192,
            stdevAmount: 0,
            currentAvgLeadtime: 0
          },
          id: "SZJ2aP"
        },
        {
          pickupCountry: "PT",
          pickupZip: "*",
          deliveryCountry: "IE",
          deliveryZip: "*",
          shipmentIds: [],
          quantity: {
            scopeCount: 1,
            shipCount: 2,
            totalAmount: 2,
            avgAmount: 2,
            minAmount: 2,
            maxAmount: 2,
            stdevAmount: 0,
            currentAvgLeadtime: 0
          },
          id: "MxMe8E"
        }
      ]
    }
  ],
  timeline: [
    {
      title: "send out invite",
      date: new Date("2019-05-02T00:00:00.000+02:00")
    },
    {
      title: "Round 1 :Start sending out data",
      date: new Date("2019-05-06T00:00:00.000+02:00")
    },
    {
      title: "on site visit (TBD)",
      details: "exact date TBD",
      date: new Date("2019-05-15T00:00:00.000+02:00")
    },
    {
      title: "Round 1: Deadline",
      date: new Date("2019-05-24T00:00:00.000+02:00")
    },
    {
      title: "Round 2: send out data",
      date: new Date("2019-06-07T00:00:00.000+02:00")
    },
    {
      title: "Round 2: Deadline",
      date: new Date("2019-06-14T00:00:00.000+02:00")
    },
    {
      title: "Award tender",
      date: new Date("2019-06-21T00:00:00.000+02:00")
    }
  ],
  requirements: [
    {
      title: "update lead times and pickup date(s)",
      details:
        "on each of the templates you can (per lane) define the lead times.\nMake sure to confirm those!",
      type: "hard",
      responseType: "YN",
      id: "ZuNASd"
    },
    {
      title: "confirm indexation",
      details:
        "if you apply indexation ,\r\n                you need to send the indexation file for 2019 by email.",
      type: "hard",
      responseType: "YN",
      id: "95mz44"
    }
  ],
  params: {
    bid: {
      type: "priceList",
      priceListId: "sHvBSWd92ZFNWfj3Y",
      types: ["priceList", "file"]
    },
    query: {
      carrierId: "all"
    },
    NDA: {
      required: true,
      type: "default"
    }
  },
  calculation: {
    status: "finished",
    result: "5 matching scope groups found"
  },
  closeDate: new Date("2019-06-05T00:00:00.000+02:00"),
  documentIds: [
    "5LphkkDTu6M9RvBop",
    "J5vSjWg2TCTrsk8a5",
    "zj4yWC97vHrrCXyiz",
    "ffhioaeErvjdDAKBT"
  ],
  bidders: [
    {
      accountId: "C65739",
      userIds: ["3D87HLzYADPTcCSHf"],
      priceLists: [
        {
          id: "G8M7KD2trnCYkiiy5",
          title: "Short Sea 45ft container PT->UK - C65739"
        }
      ],
      ts: {
        firstSeen: new Date("2019-06-17T11:08:39.199+02:00"),
        lastSeen: new Date("2019-06-17T11:08:39.199+02:00")
      }
    },

    // 1
    {
      accountId: "C86348",
      userIds: ["sJL8wiZAjuq69dSRB"],
      priceLists: [
        {
          id: "kJb4nxjueQJKpiknk",
          title: "Short Sea 45ft container PT->UK - C86348"
        }
      ],
      requirements: [
        {
          id: "ybQhKW",
          responseBool: true
        },
        {
          id: "299SQN",
          responseBool: true
        },
        {
          id: "LbSECt",
          responseBool: true
        },
        {
          id: "498Fu7",
          responseStr: "yes"
        },
        {
          id: "z3M828",
          responseStr: "yes"
        },
        {
          id: "ewhbWK",
          responseStr: "yes"
        }
      ]
    },

    // 3
    {
      accountId: "C86375",
      userIds: ["LwtyL62DLgTctSDQR"],
      priceLists: [
        {
          id: "JCjrv6ptQdPEq4zdA",
          title: "Short Sea 45ft container PT->UK - C86375"
        }
      ],
      bids: ["SZJ2aP", "MxMe8E"],
      requirements: [
        {
          id: "ybQhKW",
          responseBool: true
        }
      ],
      documents: [
        {
          id: "RamZwR2zAqxn4ZrGr",
          name: "2019_Rate Card Short Sea 45ft. container PT_UK_revisão_2.xlsx"
        }
      ],
      ts: {
        lastSeen: new Date("2019-06-09T09:35:26.612+02:00")
      }
    },

    // 4
    {
      accountId: "C76421",
      userIds: ["RvQeAXmDRczqQApmA"],
      bids: ["SZJ2aP"],
      priceLists: [
        {
          id: "WfH4MMqdc5zhyy4uj",
          title: "Short Sea 45ft container PT->UK - C76421"
        }
      ],
      ts: {
        firstSeen: new Date("2019-06-14T17:52:13.999+02:00"),
        lastSeen: new Date("2019-06-14T17:52:13.999+02:00")
      }
    },

    // 5
    {
      accountId: "C93222",
      userIds: ["ggW2WiJNmi8exqa8C"],
      priceLists: [
        {
          id: "ENCsEYrFNP2dp663Y",
          title: "Short Sea 45ft container PT->UK - C93222"
        }
      ],
      ts: {
        lastSeen: new Date("2019-06-12T16:53:12.398+02:00")
      },
      NDAresponse: {
        accepted: true,
        doc: {
          name: "NDA for 2019 transport tender - Rangel PT.pdf",
          id: "psvqfYiQqMdeEigme"
        }
      }
    },

    // 6:
    {
      accountId: "C08126",
      userIds: ["hRhomQ3vLm4Boj5Sz"],
      contact: {
        mail: "berta.brito@cevalogistics.com",
        name: "Berta Brito"
      },
      priceLists: [
        {
          id: "dPeEmML5FARTRZJCp",
          title: "Short Sea 45ft container PT->UK - C08126"
        }
      ],
      bids: ["SZJ2aP", "MxMe8E"],
      ts: {
        lastSeen: new Date("2019-06-11T10:48:32.066+02:00")
      }
    }
  ],
  FAQ: [
    {
      title: "What browser should we use",
      details:
        "the best user experience is with Chrome, Transmate should work with any recent browsers. Old internet explorer versions are not supported."
    },
    {
      title: "What templates should we quote in?",
      details:
        "the template you should use for the quote are linked to the tender. You can not use your own template. No additional costs are expected in this template."
    },
    {
      title: "Can we download the templates?",
      details:
        "Currently you can not download the templates. We will foresee this as an option in the future.\nCurrent templates are straight forward and should be easy to recreate in excel if needed."
    },
    {
      title: "Where do we add our quotes?",
      details:
        "The quotes need to be entered into the template. You can copy paste a full excel grid into the template. Make sure to use correct number format or the paste will fail.\nscreenshot : https://drive.google.com/file/d/10MWL43QrZCzKFtdeUR09MTYCSfkMUNCs/view"
    },
    {
      title: "The PT postalcodes seem incorrect?",
      details:
        "Some postal codes are not correct,\r\n                \r\n \r\n \r\n but better data is not available. Take a 10% margin for error on the current data (excel file)."
    },
    {
      title: "What are the weight conversions/dims of the products?",
      details:
        "In the documents you will find a file with example pallets. Take those as guideline on the dimensions and weight of the products. Note that none of the pallets can be stacked."
    },
    {
      title: "When can we see the products?",
      details:
        "The site-visit is optional but if you would like to see the operation and the products you can visit the site in the week of 14/05 (let us know your preferred date)."
    },
    {
      title: "What volume are we quoting on ?",
      details:
        "in each of the tenders there is a shipment profile,\r\n                \r\n \r\n this is a summery of the volumes you are quoting on. the data in the excel file is for all flows (it is there if you need to analyze the profile further)."
    },
    {
      title: "Why is there a seperate quote for specific pallets to FR?",
      details:
        'The "Special pallets (equipment) from Porto, PT to FR" is only for the specific pallets and only to FR.\nOnly quote on the range in the template with the details you find in the attached excel sheet.\nThere are many more pallets but those will fall under the normal groupage / LTL/FTL flow. (PT->EU)'
    },
    {
      title: "Where to we need to add any additional info?",
      details:
        "We allow the upload of documents as additional info to the price template.\nPlease add any info (presentation, docs) as an attachement to your quote (see tender document). Any suggestions or assumptions can be added into this document."
    },
    {
      title: "What are the exact zip code for the short sea?",
      details:
        'There are 2 destinations for the short sea: \n"Knock Rd, Tooraree, Ballyhaunis, Co. Mayo, F35 KW83, Ierland" & "Unit 4, Pencoed Technology Park, Bridgend CF35 5AQ".\nthe port(s) used is not important , it should be a CPT from COMPANY PT warehouse to end destination.'
    }
  ],
  released: {
    by: "W3WguXKt2cLu2h8LM",
    at: new Date("2019-06-07T22:56:45.747+02:00"),
    atms: 1559941005747
  }
};
