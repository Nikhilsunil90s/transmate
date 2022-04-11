import { pick } from "lodash";
import { MATCH_ANY_PARAMETERS } from "wildcard-mock-link";

import SHIPMENTS from "/imports/api/_jsonSchemas/fixtures/data.shipments.json";
import {
  GET_PICKING_DETAIL,
  GET_SHIPMENT_LABEL_OPTIONS,
  CONFIRM_SHIPMENT_LABEL_OPTION,
  UNPACK_PACKING_ITEMS,
  GET_PICKING_OVERVIEW,
  GET_LOCATION_INFO,
  PRINT_PICKING_LIST,
  CANCEL_PACKING_LABEL,
  GET_MANIFEST,
  PACK_SHIPMENT_ITEMS,
  PRINT_SHIPPING_MANIFEST
} from "./queries";
import mockData from "./mockData.json";

// const ADDRESS_ID = "j958tYA872PAogTDq";

const SHIPMENT_IDS = [
  "2jG2mZFcaFzqaThcr",
  "2jG2mZFcaFzqaThXX",
  "2jG2mZFcaFzqaThYY"
];
export const getPickingOverviewData = SHIPMENTS.filter(({ _id }) =>
  SHIPMENT_IDS.includes(_id)
).map(({ _id: id, ...data }) => ({
  id,
  pickingStatus: "none",
  items: mockData[0].nestedItems,
  ...pick(data, ["status", "pickup", "delivery", "references", "number"])
}));

export const getPickingOverviewMock = {
  request: {
    query: GET_PICKING_OVERVIEW,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      pickingOverviewData: mockData.map(doc => ({
        ...pick(doc, [
          "id",
          "status",
          "pickingStatus",
          "references",
          "pickup",
          "delivery"
        ]),
        nestedItems: doc.nestedItems.map(item =>
          pick(item, [
            "id",
            "type",
            "description",
            "quantity",
            "isPicked",
            "isPackingUnit"
          ])
        ),
        tags: []
      }))
    }
  }
};

export const getPickingDetailMock = {
  request: {
    query: GET_PICKING_DETAIL,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      shipment: mockData[0]
    }
  }
};

export const getPickingDetailMock2 = {
  request: {
    query: GET_PICKING_DETAIL,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      shipment: mockData[1]
    }
  }
};

export const getLocationInfo = {
  request: {
    query: GET_LOCATION_INFO,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      location: {
        address: {
          id: "j958tYA872PAogTDq",
          annotation: {
            name: "Globex Belgium 123"
          },
          countryCode: "BE"
        }
      }
    }
  }
};

export const getLabelOptionsMock = {
  request: {
    query: GET_SHIPMENT_LABEL_OPTIONS,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      labelOptions: [
        {
          rateId: "cf6fea899f1848b494d9568e8266e0XYZ",
          amount: "7.3",
          currency: "USD",
          amountLocal: "7.00",
          currencyLocal: "EUR",
          provider: "DHLP",
          providerImage75: "https://cdn2.goshippo.com/providers/75/DHL.png",
          providerImage200: "https://cdn2.goshippo.com/providers/200/DHL.png",
          servicelevel: {
            name: "Next day",
            token: "DHL_next_day",
            terms: ""
          },
          days: 1,
          arrivesBy: null,
          durationTerms: "Delivery in 6 business day.",
          messages: [],
          carrierAccount: "078870331023437cb917f5187429b0XX",
          test: false,
          zone: "1"
        },
        {
          rateId: "cf6fea899f1848b494d9568e8266e076",
          amount: "5.50",
          currency: "USD",
          amountLocal: "5.50",
          currencyLocal: "USD",
          provider: "USPS",
          providerImage75: "https://cdn2.goshippo.com/providers/75/USPS.png",
          providerImage200: "https://cdn2.goshippo.com/providers/200/USPS.png",
          servicelevel: {
            name: "Priority Mail",
            token: "usps_priority",
            terms: ""
          },
          days: 2,
          arrivesBy: null,
          durationTerms: "Delivery in 1 to 3 business days.",
          messages: [],
          carrierAccount: "078870331023437cb917f5187429b093",
          test: false,
          zone: "1"
        },
        {
          rateId: "cf6fea899f1848b494d9568e8266e0XX",
          amount: "6.3",
          currency: "USD",
          amountLocal: "6.00",
          currencyLocal: "EUR",
          provider: "DHL",
          providerImage75: "https://cdn2.goshippo.com/providers/75/DHL.png",
          providerImage200: "https://cdn2.goshippo.com/providers/200/DHL.png",
          servicelevel: {
            name: "Next day",
            token: "DHL_next_day",
            terms: ""
          },
          days: 1,
          arrivesBy: null,
          durationTerms: "Delivery in 1 business day.",
          messages: [],
          carrierAccount: "078870331023437cb917f5187429b0XX",
          test: false,
          zone: "1"
        }
      ]
    }
  }
};

export const confirmShipmentLabelOption = {
  request: {
    query: CONFIRM_SHIPMENT_LABEL_OPTION,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      confirmShipmentLabelOption: {
        id: "oaXMFZchcXeMe52Hd",
        labelUrl: "SomeURL"
      }
    }
  }
};

export const unPackAllShipments = {
  request: {
    query: UNPACK_PACKING_ITEMS,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      unpackShipmentItems: {
        shipment: {
          id: "test12345",
          status: "closed",
          pickingStatus: "picked",
          nestedItems: []
        }
      }
    }
  }
};

export const printPickingList = {
  request: {
    query: PRINT_PICKING_LIST,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      printPickingList: {
        documentUrl:
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      }
    }
  }
};

export const cancelPackingLabel = {
  request: {
    query: CANCEL_PACKING_LABEL,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      cancelPackingLabel: {
        id: "test123",
        status: "close",
        pickingStatus: "picked",
        nestedItems: [
          {
            id: "oaXMFZchcXeMe52Hder",
            type: "HU",
            itemType: "custom",
            description: "pie 123",
            level: 0,
            parentItemId: null,
            labelUrl: "labelUrl",
            references: {
              order: null,
              delivery: null,
              containerNo: null,
              truckId: null,
              trailerId: null,
              document: null,
              seal: null
            },
            DG: false,
            quantity: {
              code: "PAL",
              amount: 33,
              description: "Pallet"
            },
            weight_net: 10001,
            weight_gross: 10001,
            weight_unit: "kg",
            temperature: {
              condition: "-/- 18c",
              range: {
                from: null,
                to: null,
                unit: null
              }
            },
            dimensions: {
              length: null,
              width: null,
              height: null,
              uom: null
            },
            isPackingUnit: false
          }
        ]
      }
    }
  }
};

export const getManifestMock = {
  request: {
    query: GET_MANIFEST,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      carriers: [
        {
          carrierId: "carrierId1",
          name: "carrier 1",
          shipments: [
            {
              id: "shipmentId1",
              status: "status",
              pickingStatus: "pickingStatus"
            },
            {
              id: "shipmentId2",
              status: "status",
              pickingStatus: "pickingStatus"
            },
            {
              id: "shipmentId3",
              status: "status",
              pickingStatus: "pickingStatus"
            }
          ]
        },
        {
          carrierId: "carrierId2",
          name: "carrier 2",
          shipments: [
            {
              id: "shipmentId1",
              status: "status",
              pickingStatus: "pickingStatus"
            }
          ]
        }
      ]
    }
  }
};

export const packShipmentItemsMock = {
  request: {
    query: PACK_SHIPMENT_ITEMS,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      packShipmentItems: {
        shipment: {
          id: "test123",
          status: "close",
          pickingStatus: "picked",
          nestedItems: [
            {
              id: "oaXMFZchcXeMe52Hder",
              type: "HU",
              itemType: "custom",
              description: "pie 11",
              level: 0,
              parentItemId: null,
              labelUrl: "labelUrl",
              references: {
                order: null,
                delivery: null,
                containerNo: null,
                truckId: null,
                trailerId: null,
                document: null,
                seal: null
              },
              DG: false,
              quantity: {
                code: "PAL",
                amount: 33,
                description: "Pallet"
              },
              weight_net: 10001,
              weight_gross: 10001,
              weight_unit: "kg",
              temperature: {
                condition: "-/- 18c",
                range: {
                  from: null,
                  to: null,
                  unit: null
                }
              },
              dimensions: {
                length: null,
                width: null,
                height: null,
                uom: null
              },
              isPackingUnit: true
            }
          ]
        }
      }
    }
  }
};

export const printPickingManifestResponse = [
  {
    id: "2jG2mZFcaFzqaThcr",
    status: "started",
    number: "Q7SQYEPY",
    accountId: "S65957",
    carrier: {
      id: "C00001",
      name: "DHL express"
    },
    references: {
      number: "shipper reference #",
      booking: null,
      carrier: null,
      consignee: null,
      bof: null,
      fa: null,
      container: null,
      cmr: null,
      __typename: "ReferencesType"
    },
    __typename: "ShipmentAggr",
    pickup: {
      location: {
        latLng: {
          lat: 50.8888189,
          lng: 4.458519900000056,
          __typename: "LatLngType"
        },
        countryCode: "BE",
        isValidated: null,
        zipCode: "1930",
        addressId: "j958tYA872PAogTDq",
        locode: null,
        name: "Globex Belgium",
        address: {
          street: "Leonardo da Vincilaan",
          number: "7",
          city: "Zaventem",
          state: "Vlaanderen",
          __typename: "AddressType"
        },
        timeZone: "Europe/Paris",
        annotation: {
          id: "S65957",
          name: "Globex Belgium",
          safety: {
            instructions:
              '[{"children":[{"text":"Always use safety gloves"},{"text":"protects hands while completing manual handling tasks, eg opening barn doors"},{"text":"and uncoupling."},{"text":"Always use hazard lights while reversing in yard and move at slow speed This is to warn other yard users that you are about to reverse and slow speed reduces impact to buffers and allows greater manoeuvrability."},{"text":"Check that the Green Light is on. Never use a bay if the lights are not working Check there are no obstructions, pedestrians in the vicinity. DO NOT reverse onto the bay if there are manoeuvring vehicles either side of your allocated bay. Do not reverse onto a bay showing a red light"}]}]',
            pbm: ["feet", "hand", "head", "ears"]
          },
          hours:
            '[{"children":[{"text":"Weekdays: 6am - 10pm"},{"text":"Weekend: Closed"}]}]',
          certificates: ["ISO 14001"]
        },
        __typename: "FromToType"
      },
      date: 1508284800000,
      datePlanned: 1508284800000,
      dateScheduled: null,
      dateActual: 1624868505396,
      __typename: "ShipmentStopType"
    },
    delivery: {
      location: {
        latLng: {
          lat: 40.3061528,
          lng: -3.465709199999992,
          __typename: "LatLngType"
        },
        countryCode: "ES",
        isValidated: null,
        zipCode: "28500",
        addressId: "WJNLceXYjFBdYL4YQ",
        locode: null,
        name: "Globex Spain",
        address: {
          street: "Avenida de Madrid",
          number: "43",
          city: "Arganda del Rey",
          state: "Comunidad de Madrid",
          __typename: "AddressType"
        },
        timeZone: "Europe/Madrid",
        annotation: {
          id: "S65957",
          name: "Globex Spain"
        },
        __typename: "FromToType"
      },
      date: 1508371200000,
      datePlanned: 1508371200000,
      dateScheduled: null,
      dateActual: null,
      __typename: "ShipmentStopType"
    },
    nestedItems: [
      {
        id: "nEv5S78ZKHeo9q4mK",
        type: "HU",
        itemType: null,
        description: null,
        level: null,
        parentItemId: null,
        references: null,
        DG: null,
        quantity: null,
        weight_net: null,
        weight_gross: null,
        weight_unit: null,
        temperature: null,
        dimensions: null,
        isPicked: null,
        isPackingUnit: null,
        labelUrl: null,
        __typename: "ShipmentItemType"
      },
      {
        id: "gf45bma9xeAX4nFAb",
        type: "HU",
        itemType: null,
        description: null,
        level: null,
        parentItemId: null,
        references: null,
        DG: null,
        quantity: {
          amount: 1,
          code: "PARCEL BOX",
          description: "Parcel box"
        },
        weight_net: null,
        weight_gross: 20,
        weight_unit: "kg",
        temperature: null,
        dimensions: null,
        isPicked: null,
        isPackingUnit: true,
        labelUrl:
          "https://files.transmate.eu/pickingLabels/label-gf45bma9xeAX4nFAb.pdf",
        __typename: "ShipmentItemType"
      }
    ]
  }
];

export const printPickingManifestMock = {
  request: {
    query: PRINT_SHIPPING_MANIFEST,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      shipments: printPickingManifestResponse
    }
  }
};
