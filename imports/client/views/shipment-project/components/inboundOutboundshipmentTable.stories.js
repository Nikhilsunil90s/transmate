import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import InboundOutboundShipmentTable from "./InboundOutboundShipmentTable";
import keys from "./columnKeys.js";

export default {
  title: "Projects/shipmentList"
};

const shipments = [
  {
    id: "GbcqWt3wjpRSECGwe",
    shipperId: "S65957",
    type: "road",
    status: "draft",
    isTendered: false,
    totalCost: 0,
    manualCost: 0,
    shipper: {
      name: "Globex1",
      id: "S65957",
      annotation: {
        coding: {
          color: "#4287f5",
          code: "TST"
        },
        __typename: "AccountAnnotation"
      },
      __typename: "AccountType"
    },
    item: {
      id: null,
      condition: null,
      __typename: "ItemType"
    },
    stage: {
      plate: null,
      __typename: "Stage"
    },
    carrier: {
      id: "S65957",
      name: "Globex1",
      type: "shipper",
      annotation: {
        coding: {},
        __typename: "AccountAnnotation"
      },
      __typename: "AccountType"
    },
    references: null,
    equipments: null,
    deliveryDate: {
      day: "04/02/2020",
      time: "3:42 PM",
      __typename: "ShipmentDayAndTime"
    },
    pickup: {
      location: {
        name: "Globex UK",
        annotation: {
          id: "S65957",
          name: "Globex UK"
        },
        __typename: "FromToType"
      },
      __typename: "PickupType"
    },
    pickupDate: {
      day: "04/01/2020",
      time: "3:42 PM",
      __typename: "ShipmentDayAndTime"
    },
    delivery: {
      location: {
        name: "Globex  Mions",
        annotation: {
          id: "S65957",
          name: "Globex  Mions"
        },
        __typename: "FromToType"
      },
      __typename: "DeliveryType"
    },
    __typename: "Shipment"
  },
  {
    id: "GbcqWt3wjpRSECGwe",
    shipperId: "S65957",
    type: "road",
    status: "draft",
    isTendered: false,
    totalCost: 0,
    manualCost: 0,
    shipper: {
      name: "Globex1",
      id: "S65957",
      annotation: {
        coding: {
          color: "#4287f5",
          code: "TST"
        },
        __typename: "AccountAnnotation"
      },
      __typename: "AccountType"
    },
    item: {
      id: null,
      condition: null,
      __typename: "ItemType"
    },
    stage: {
      plate: null,
      __typename: "Stage"
    },
    carrier: {
      id: "S65957",
      name: "Globex2",
      type: "shipper",
      annotation: {
        coding: {},
        __typename: "AccountAnnotation"
      },
      __typename: "AccountType"
    },
    references: null,
    equipments: null,
    deliveryDate: {
      day: "04/02/2020",
      time: "3:42 PM",
      __typename: "ShipmentDayAndTime"
    },
    pickup: {
      location: {
        name: "Globex UK",
        annotation: {
          id: "S65957",
          name: "Globex UK"
        },
        __typename: "FromToType"
      },
      __typename: "PickupType"
    },
    pickupDate: {
      day: "04/01/2020",
      time: "3:42 PM",
      __typename: "ShipmentDayAndTime"
    },
    delivery: {
      location: {
        name: "Globex  Mions",
        annotation: {
          id: "S65957",
          name: "Globex  Mions"
        },
        __typename: "FromToType"
      },
      __typename: "DeliveryType"
    },
    __typename: "Shipment"
  },
  {
    id: "rHST8Y9qJpFwdExrg",
    shipperId: "S65957",
    type: "road",
    status: "planned",
    isTendered: true,
    totalCost: 115.09,
    manualCost: 0,
    shipper: {
      name: "Globex01",
      id: "S65957",
      annotation: {
        coding: {},
        __typename: "AccountAnnotation"
      },
      __typename: "AccountType"
    },
    item: {
      id: "mAKjaQr32HjA9Bm4z",
      condition: true,
      __typename: "ItemType"
    },
    stage: {
      plate: null,
      __typename: "Stage"
    },
    carrier: {
      id: "S65957",
      name: "Globex3",
      type: "shipper",
      annotation: {
        coding: {},
        __typename: "AccountAnnotation"
      },
      __typename: "AccountType"
    },
    references: null,
    equipments: null,
    deliveryDate: {
      day: "04/04/2020",
      time: "1:05 PM",
      __typename: "ShipmentDayAndTime"
    },
    pickup: {
      location: {
        name: "Globex  Mions",
        annotation: {
          id: "S65957",
          name: "Globex  Mions"
        },
        __typename: "FromToType"
      },
      __typename: "PickupType"
    },
    pickupDate: {
      day: "04/03/2020",
      time: "1:05 PM",
      __typename: "ShipmentDayAndTime"
    },
    delivery: {
      location: {
        name: "Globex Belgium",
        annotation: {
          id: "GL01",
          name: "Globex Belgium",
          safety: {
            instructions:
              '<p style="margin: 0px 0px 0px 48px; text-indent: -18pt;"><font color="#000000"><span style="margin: 0px;"><span style="margin: 0px;"><font face="Calibri" size="3">1.</font><span style=\'font: 7pt "Times New Roman"; margin: 0px; font-size-adjust: none; font-stretch: normal;\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n</span></span></span><span style="margin: 0px;" dir="LTR"></span><font face="Calibri" size="3">Always use safety gloves\nprotects hands while completing manual handling tasks, eg opening barn doors\nand uncoupling </font></font></p>\n\n<p style="margin: 0px 0px 0px 48px; text-indent: -18pt;"><font color="#000000"><span style="margin: 0px;"><span style="margin: 0px;"><font face="Calibri" size="3">2.</font><span style=\'font: 7pt "Times New Roman"; margin: 0px; font-size-adjust: none; font-stretch: normal;\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n</span></span></span><span style="margin: 0px;" dir="LTR"></span><font face="Calibri" size="3">Always use hazard lights\nwhile reversing in yard and move at slow speed This is to warn other yard users\nthat you are about to reverse and slow speed reduces impact to buffers and\nallows greater manoeuvrability </font></font></p>\n\n<p style="margin: 0px 0px 0px 48px; text-indent: -18pt;"><font color="#000000"><span style="margin: 0px;"><span style="margin: 0px;"><font face="Calibri" size="3">3.</font><span style=\'font: 7pt "Times New Roman"; margin: 0px; font-size-adjust: none; font-stretch: normal;\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n</span></span></span><span style="margin: 0px;" dir="LTR"></span><font face="Calibri" size="3">Check that the Green Light\nis on. Never use a bay if the lights are not working Check there are no\nobstructions, pedestrians in the vicinity. DO NOT reverse onto the bay if there\nare manoeuvring vehicles either side of your allocated bay. Do not reverse onto\na bay showing a red light </font></font></p>\n\n<p style="margin: 0px 0px 0px 48px; text-indent: -18pt;"><font color="#000000"><span style="margin: 0px;"><span style="margin: 0px;"><font face="Calibri" size="3">4.</font><span style=\'font: 7pt "Times New Roman"; margin: 0px; font-size-adjust: none; font-stretch: normal;\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n</span></span></span><span style="margin: 0px;" dir="LTR"></span><font face="Calibri" size="3">Pull forward into correct\nposition for reversing</font></font></p>\n\n<p style="margin: 0px 0px 10.66px 48px; text-indent: -18pt;"><font color="#000000"><span style="margin: 0px;"><span style="margin: 0px;"><font face="Calibri" size="3">5.</font><span style=\'font: 7pt "Times New Roman"; margin: 0px; font-size-adjust: none; font-stretch: normal;\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n</span></span></span><span style="margin: 0px;" dir="LTR"></span><font face="Calibri" size="3">Open and secure barn doors,\nand remove number plate</font></font></p>\n\n      \n    <font face="Calibri"></font>',
            pbm: ["feet", "hand", "head", "ears"]
          },
          hours: "<div>Weekdays: 6am - 10pm</div><div>Weekend: Closed</div>",
          certificates: ["ISO 14001"]
        },
        __typename: "FromToType"
      },
      __typename: "DeliveryType"
    },
    __typename: "Shipment"
  }
];

// as part of a uniforms:
export const basic = () => {
  return (
    <MockedProvider mocks={[]}>
      <PageHolder main="ShipmentProject">
        <InboundOutboundShipmentTable shipments={shipments} keys={keys} />
      </PageHolder>
    </MockedProvider>
  );
};
