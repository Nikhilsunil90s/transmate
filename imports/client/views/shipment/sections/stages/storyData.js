export const dummyProps = {
  shipment: { _id: "testId", number: "XYZ123" },
  stage: {
    _id: "rcnMEJSXaoyeABuYT",
    id: "rcnMEJSXaoyeABuYT",
    from: {
      latLng: {
        lat: 50.8888189,
        lng: 4.458519900000056
      },
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
      timeZone: "Europe/Paris",
      isValidated: true
    },
    to: {
      latLng: {
        lat: 40.3061528,
        lng: -3.465709199999992
      },
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
      timeZone: "Europe/Madrid",
      isValidated: true
    },
    dates: {
      pickup: {
        arrival: {
          planned: new Date("2020-07-23T06:00:00.000Z"),
          scheduled: new Date("2020-07-23T08:00:00.000Z"),
          actual: new Date("2020-07-23T08:30:00.000Z")
        }
      },
      delivery: {
        arrival: {
          planned: new Date("2020-07-24T06:00:00.000Z")
        }
      }
    },
    shipmentId: "MDRLwZEown3XhTioz",
    created: {
      by: "Dsqp3CRYjFpF8rQbh",
      at: "2020-07-22T07:15:18.149Z"
    },
    sphericalDistance: 1434671,
    mode: "road",
    status: "draft",
    sequence: 1,
    updated: {
      by: "Dsqp3CRYjFpF8rQbh",
      at: "2020-07-22T14:05:01.250Z"
    },
    deleted: false,
    carrierId: "C11051",

    isReadyForRelease: () => {
      return { pass: true };
    }
  },
  security: {
    canChangeAddress: false,
    canAssignDriver: false,
    canChangeMode: false,
    canChangeCarrier: false,
    canModifyPlannedDates: false,

    // actions
    canPutBackToDraft: false,
    canPutStageToPlanned: false,
    canConfirmDates: false,
    canRelease: false,
    stageReadyForRelease: false,
    canSchedule: false,
    canSplitStage: false,
    canMergeStage: false
  }
};
