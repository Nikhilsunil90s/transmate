export const getShipmentQueryResults = {
  "2jG2mZFcaFzqaThcr": {
    _id: "2jG2mZFcaFzqaThcr",
    status: "draft",
    pickup: {
      location: {
        latLng: { lat: 50.8888189, lng: 4.458519900000056 },
        countryCode: "BE",
        zipCode: "1930",
        name: "Globex Belgium",
        addressId: "j958tYA872PAogTDq",
        address: {
          street: "Leonardo da Vincilaan",
          number: "7",
          city: "Zaventem",
          state: "Vlaanderen"
        },
        timeZone: "Europe/Paris"
      },
      date: new Date("2017-10-18T00:00:00.000Z"),
      datePlanned: new Date("2017-10-18T00:00:00.000Z")
    },
    priceRequestId: "zgSR5RRWJoHMDSEDy",
    delivery: {
      location: {
        latLng: { lat: 40.3061528, lng: -3.465709199999992 },
        countryCode: "ES",
        zipCode: "28500",
        name: "Globex Spain",
        addressId: "WJNLceXYjFBdYL4YQ",
        address: {
          street: "Avenida de Madrid",
          number: "43",
          city: "Arganda del Rey",
          state: "Comunidad de Madrid"
        },
        timeZone: "Europe/Madrid"
      },
      date: new Date("2017-10-19T00:00:00.000Z"),
      datePlanned: new Date("2017-10-19T00:00:00.000Z")
    },
    shipperId: "S65957",
    accountId: "S65957",
    created: {
      by: "jsBor6o3uRBTFoRQY",
      at: new Date("2017-10-18T08:57:51.701Z")
    },
    shipmentProjectOutboundId: "RAx8FqXSqPr4uJppf",
    number: "Q7SQYEPY",
    updates: [
      {
        action: "created",
        userId: "jsBor6o3uRBTFoRQY",
        accountId: "S65957",
        ts: new Date("2017-10-18T08:57:51.791Z")
      },
      {
        action: "planned",
        userId: "jsBor6o3uRBTFoRQY",
        accountId: "S65957",
        ts: new Date("2017-10-18T08:59:44.792Z"),
        data: { reason: "stages", action: "planned" }
      }
    ],
    type: "road",
    serviceLevel: "LTL",
    sphericalDistance: 1434671,
    stageIds: ["mTQmzoCfAiLbGFzo3"],
    drivingDistance: 0,
    drivingDuration: 0,
    carrierIds: ["C75701"],
    references: { number: "shipper reference #" },
    notes: { BookingNotes: "Some note text here, this is not slate yet." },
    tags: ["fixture shipment", "testing", "Globex"],
    errors: [
      {
        type: "numidia-edi-connection",
        data: {},
        message: "EDI connection was not establisehd",
        dt: new Date("2017-10-18T08:59:44.792Z")
      }
    ],
    access: [{ accountId: "C11051" }],
    deleted: false,
    incoterm: "DDP",
    id: "2jG2mZFcaFzqaThcr",
    account: { _id: "S65957", name: "Globex", type: "shipper", id: "S65957" },
    carrier: {
      _id: "C75701",
      name: "Carrier PlayCo",
      type: "carrier",
      id: "C75701",
      annotation: {
        accountId: "S65957",
        name: "DHL GLOBAL FORWARDING (UK) LIMITED",
        profile: {
          contacts: [
            {
              contactType: "general",
              linkedId: "NTZsWDYw2LMJF8ycT",
              firstName: "Paul",
              lastName: "Fowler",
              mail: "paul.fowler@dhl.com"
            }
          ]
        },
        coding: { ediId: "DHL" },
        notes: {
          text: '[{"children":[{"text":"some notes"}]}]',
          date: new Date("2021-02-16T20:10:24.057Z")
        }
      }
    },
    shipper: { _id: "S65957", name: "Globex", type: "shipper", id: "S65957" },
    linkInbound: [],
    linkOutbound: [
      {
        _id: "2jG2mZFcaFzqaThcr",
        id: "RAx8FqXSqPr4uJppf",
        title: "Test project",
        type: { code: "GP BHR II", group: "F1", name: "GP BHR II" }
      }
    ],
    linkPriceRequest: [
      {
        _id: "2jG2mZFcaFzqaThcr",
        id: "zgSR5RRWJoHMDSEDy",
        title: "TEST - price request",
        type: "requested"
      }
    ],
    documents: [
      {
        _id: "zwkjMazxgKBpWjHXE",
        shipmentId: "2jG2mZFcaFzqaThcr",
        stageId: "3BNqZuT3bNS5p3aik",
        type: "stageConfirmation",
        meta: {
          type: "application/pdf",
          name: "stageConfirmation NYLSH.pdf",
          lastModifiedDate: new Date("2020-10-22T20:03:08.318Z"),
          size: 32182
        },
        store: {
          service: "s3",
          bucket: "files.transmate.eu",
          key: "documents/shipment/LLRyGNuS6e7ZeH8AG/mwSiQ"
        },
        created: {
          by: "pYFLYFDMJEnKADY3h",
          at: new Date("2020-10-22T20:03:08.319Z")
        },
        updated: {
          by: "pYFLYFDMJEnKADY3h",
          at: new Date("2020-10-22T20:03:08.320Z")
        },
        deleted: false,
        id: "zwkjMazxgKBpWjHXE"
      }
    ],
    nestedItems: [
      {
        _id: "ae5SCCi7kMfji7G89",
        type: "TU",
        description: "Truck food grade",
        level: 0,
        references: { document: "00-123098" },
        DG: false,
        quantity: { code: "ST", amount: 1, description: "Truck food grade" },
        temperature: { condition: "dry" },
        weight_gross: 21000,
        weight_net: 21000,
        weight_unit: "kg",
        taxable: [{ type: "kg", quantity: 21000 }],
        id: "ae5SCCi7kMfji7G89"
      },
      {
        _id: "nEv5S78ZKHeo9q4mK",
        type: "HU",
        commodity: "1234567",
        description: "Pallet",
        level: 1,
        references: {},
        DG: false,
        quantity: { code: "PAL", amount: 22, description: "Pallet" },
        weight_unit: "kg",
        parentItemId: "ae5SCCi7kMfji7G89",
        weight_gross: 21000,
        weight_net: 21000,
        taxable: [{ type: "kg", quantity: 21000 }],
        id: "nEv5S78ZKHeo9q4mK"
      }
    ],
    nonConformances: [],
    stages: [
      {
        _id: "mTQmzoCfAiLbGFzo3",
        sequence: 1,
        from: {
          latLng: { lat: 50.8888189, lng: 4.458519900000056 },
          countryCode: "BE",
          zipCode: "1930",
          name: "Globex Belgium",
          addressId: "j958tYA872PAogTDq",
          address: {
            street: "Leonardo da Vincilaan",
            number: "7",
            city: "Zaventem",
            state: "Vlaanderen"
          }
        },
        to: {
          latLng: { lat: 40.3061528, lng: -3.465709199999992 },
          countryCode: "ES",
          zipCode: "28500",
          name: "Globex Spain",
          addressId: "WJNLceXYjFBdYL4YQ",
          address: {
            street: "Avenida de Madrid",
            number: "43",
            city: "Arganda del Rey",
            state: "Comunidad de Madrid"
          }
        },
        dates: {
          pickup: {
            arrival: { planned: new Date("2017-10-18T00:00:00.000Z") }
          },
          delivery: {
            arrival: { planned: new Date("2017-10-19T00:00:00.000Z") }
          }
        },
        shipmentId: "2jG2mZFcaFzqaThcr",
        created: {
          by: "jsBor6o3uRBTFoRQY",
          at: new Date("2017-10-18T08:57:51.997Z")
        },
        sphericalDistance: 1434671,
        mode: "road",
        status: "draft",
        carrierId: "C75701",
        id: "mTQmzoCfAiLbGFzo3"
      }
    ],
    stageCount: 1
  }
};
