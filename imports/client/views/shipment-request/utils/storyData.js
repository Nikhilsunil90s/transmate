export const storyData = {
  shipment: {
    __typename: "ShipmentAggr",
    id: "cgBsFLwnSxAmmzGiB",
    number: "ACAM78RZ",
    pickup: {
      __typename: "ShipmentStopType",
      location: {
        __typename: "FromToType",
        latLng: {
          __typename: "LatLngType",
          lat: 45.6813612,
          lng: 4.949486900000011
        },
        countryCode: "FR",
        isValidated: true,
        zipCode: "69780",
        addressId: "EoeX3PEqCyXhiuyCW",
        locode: null,
        name: "Globex  Mions",
        companyName: null,
        phoneNumber: null,
        email: null,
        address: {
          __typename: "AddressType",
          street: "Rue Paul Emile Victor",
          address1: null,
          address2: null,
          number: "24",
          city: "Mions",
          state: "Auvergne-Rhône-Alpes"
        },
        timeZone: "Europe/Paris",
        annotation: {
          id: "S65957",
          name: "Globex  Mions"
        }
      },
      date: 1644908400000,
      datePlanned: 1644908400000,
      dateScheduled: null,
      dateActual: null
    },
    delivery: {
      __typename: "ShipmentStopType",
      location: {
        __typename: "FromToType",
        latLng: {
          __typename: "LatLngType",
          lat: 40.3061528,
          lng: -3.465709199999992
        },
        countryCode: "ES",
        isValidated: true,
        zipCode: "28500",
        addressId: "WJNLceXYjFBdYL4YQ",
        locode: null,
        name: "Globex Spain",
        companyName: null,
        phoneNumber: null,
        email: null,
        address: {
          __typename: "AddressType",
          street: "Avenida de Madrid",
          address1: null,
          address2: null,
          number: "43",
          city: "Arganda del Rey",
          state: "Comunidad de Madrid"
        },
        timeZone: "Europe/Madrid",
        annotation: {
          id: "S65957",
          name: "Globex Spain"
        }
      },
      date: 1644994800000,
      datePlanned: 1644994800000,
      dateScheduled: null,
      dateActual: null
    },
    nestedItems: [
      {
        __typename: "ShipmentItemType",
        id: "9ztAT9ZLz8RMkGWPP",
        shipmentId: null,
        parentItemId: null,
        level: 0,
        quantity: {
          __typename: "ShipmentItemQuantityType",
          amount: 10,
          code: "PAL"
        },
        type: "HU",
        itemType: null,
        number: null,
        description: "test",
        commodity: null,
        references: null,
        material: null,
        DG: null,
        DGClassType: null,
        temperature: null,
        weight_net: null,
        weight_tare: null,
        weight_gross: null,
        weight_unit: "kg",
        dimensions: null,
        taxable: null,
        calcSettings: null,
        customs: null,
        notes: null
      }
    ]
  }
};
