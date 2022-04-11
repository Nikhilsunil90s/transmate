import React from "react";
import moment from "moment";
import { Trans } from "react-i18next";
import get from "lodash.get";
import { Popup, Icon } from "semantic-ui-react";

import { percentFormat } from "/imports/utils/UI/helpers";

const debug = require("debug")("tender:utils");

class AcceptanceCalc {
  constructor({ bidders = [] }) {
    this.bidders = bidders;
    this.count = 0;
  }

  add() {
    this.count += 1;
  }

  get() {
    return this.count / this.bidders.length;
  }
}

const dataGrid = (grp, bidders) => {
  const t = {};
  t.id = grp.id;
  t.name = grp.pickupCountry;
  if (grp.pickupZip) {
    t.name += ` ${grp.pickupZip}`;
  }
  if (grp.pickupLocode) {
    t.name += grp.pickupLocode;
  }
  t.name += ` - ${grp.deliveryCountry}`;
  if (grp.deliveryZip) {
    t.name += ` ${grp.deliveryZip}`;
  }
  if (grp.deliveryLocode) {
    t.name += grp.deliveryLocode;
  }
  if (grp.equipment) {
    t.name += ` | ${grp.equipment}`;
  }
  const counter = new AcceptanceCalc({ bidders });
  (bidders || []).forEach(bidder => {
    const val = bidder.bids && bidder.bids.indexOf(grp.id) !== -1;
    t[`${bidder.accountId}`] = val;
    if (val) {
      counter.add();
    }
  });
  t.acceptance = counter.get();
  return t;
};

export const prepareRowData = ({ bidders = [], tenderPackages = [] }) => ({
  bidders,
  tenderPackages,
  data: [],
  dataGroups: [],
  timeStamps() {
    ["firstSeen", "lastSeen"].forEach(ts => {
      const counter = new AcceptanceCalc({ bidders: this.bidders });
      const resp = {
        name: <Trans i18nKey={`tender.dashboard.grid.${ts}`} />
      };
      this.bidders.forEach(bidder => {
        const curTS = bidder[ts];
        if (curTS) {
          resp[bidder.accountId] = moment(curTS).fromNow(); // only EN language?
          counter.add();
        }
      });
      resp.acceptance = counter.get();
      this.data.push(resp);
    });
    return this;
  },
  getNDA() {
    const counter = new AcceptanceCalc({ bidders });
    const resp = {
      name: <Trans i18nKey="tender.dashboard.grid.NDA" />
    };
    this.bidders.forEach(bidder => {
      let ndaUrl;

      // resp[bidder.accountId] = bidder.NDAresponse.doc.id
      if (get(bidder, ["NDAresponse", "accepted"])) {
        // get NDA doc info
        // TODO [#297]: document URL!!
        ndaUrl = "someurl";

        resp[bidder.accountId] = {
          nda: get(bidder, ["NDAresponse", "accepted"]),
          ndaId: get(bidder, ["NDAresponse", "doc", "id"]) || "",
          ndaUrl: ndaUrl || "",
          name: bidder.name
        };
        counter.add();
      } else {
        resp[bidder.accountId] = {
          nda: false,
          name: bidder.name
        };
      }
    });
    resp.acceptance = counter.get();
    this.data.push(resp);
    return this;
  },
  bidGroups() {
    const groups = [];
    this.tenderPackages.forEach(pack => {
      pack.bidGroups.forEach(grp => {
        groups.push(grp);
      });
    });

    this.dataGroups = groups.map(grp => dataGrid(grp, this.bidders));
    return this;
  },
  get() {
    const rowData = [...this.data, ...this.dataGroups];
    return rowData;
  }
});

export const prepareColumns = ({ bidders = [] }) => [
  {
    Header: "package",
    accessor: "name",
    sortable: false
  },
  ...bidders.map(bidder => ({
    Header: (
      <Popup
        content={`${bidder.name}`}
        position="bottom center"
        className="tip"
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        trigger={<a>{bidder.accountId}</a>}
      />
    ),
    accessor: bidder.accountId,
    className: "center aligned",
    Cell: ({ row: { original } }) => {
      let val = original[bidder.accountId];
      let info = null;
      if (val && typeof val.nda === "boolean") {
        val = val.nda;
        info = <a href={val.ndaUrl}>link</a>;
      }
      if (val === true) {
        return (
          <>
            <Icon name="check" />
            {info}
          </>
        );
      }
      if (val === false) {
        return <Icon name="close" />;
      }
      return val || "-";
    },
    sortable: false
  })),
  {
    Header: "acceptance",
    accessor: "acceptance",
    Cell: ({ row: { original } }) => {
      debug(original);
      return percentFormat(original.acceptance);
    },
    sortable: false
  }
];

// const test = prepareRowData({
//   bidders: [
//     {
//       accountId: "C12639",
//       name: "Carrier 1",
//       contacts: [
//         {
//           firstName: "first",
//           lastName: "last",
//           mail: "user@test.com",
//           linkedId: "LW69k9YywiKLyQCFA",
//           events: [
//             {
//               event: "send",
//               timestamp: new Date("2020-09-24T15:58:44.128+02:00")
//             },
//             {
//               event: "processed",
//               timestamp: new Date("2020-09-24T15:58:44.000+02:00")
//             },
//             {
//               event: "delivered",
//               timestamp: new Date("2020-09-24T15:58:47.000+02:00")
//             },
//             {
//               event: "click",
//               timestamp: new Date("2020-09-24T16:55:23.000+02:00")
//             },
//             {
//               event: "click",
//               timestamp: new Date("2020-09-29T10:37:38.000+02:00")
//             },
//             {
//               event: "send",
//               timestamp: new Date("2020-09-29T11:16:34.937+02:00")
//             },
//             {
//               event: "processed",
//               timestamp: new Date("2020-09-29T11:16:35.000+02:00")
//             },
//             {
//               event: "delivered",
//               timestamp: new Date("2020-09-29T11:17:11.000+02:00")
//             },
//             {
//               event: "open",
//               timestamp: new Date("2020-09-29T11:18:04.000+02:00")
//             },
//             {
//               event: "open",
//               timestamp: new Date("2020-09-29T11:18:02.000+02:00")
//             },
//             {
//               event: "open",
//               timestamp: new Date("2020-09-29T11:18:05.000+02:00")
//             },
//             {
//               event: "open",
//               timestamp: new Date("2020-09-29T11:18:29.000+02:00")
//             },
//             {
//               event: "open",
//               timestamp: new Date("2020-09-29T11:22:59.000+02:00")
//             },
//             {
//               event: "open",
//               timestamp: new Date("2020-09-29T11:40:43.000+02:00")
//             },
//             {
//               event: "click",
//               timestamp: new Date("2020-09-29T11:40:51.000+02:00")
//             },
//             {
//               event: "click",
//               timestamp: new Date("2020-09-29T11:41:52.000+02:00")
//             },
//             {
//               event: "open",
//               timestamp: new Date("2020-09-29T11:43:27.000+02:00")
//             },
//             {
//               event: "click",
//               timestamp: new Date("2020-09-29T12:58:06.000+02:00")
//             },
//             {
//               event: "click",
//               timestamp: new Date("2020-09-30T12:10:23.000+02:00")
//             },
//             {
//               event: "open",
//               timestamp: new Date("2020-09-30T14:58:59.000+02:00")
//             },
//             {
//               event: "open",
//               timestamp: new Date("2020-09-30T14:59:37.000+02:00")
//             }
//           ]
//         }
//       ],
//       notified: new Date("2020-09-24T15:58:43.822+02:00"),
//       viewed: true,
//       bidOpened: new Date("2020-09-24T16:58:31.505+02:00"),
//       bid: true,
//       won: new Date("2020-09-29T11:16:34.972+02:00")
//     },

//     {
//       accountId: "C59261",
//       name: "Carrier 2",
//       contacts: [
//         {
//           contactType: "director",
//           firstName: "Jonas",
//           lastName: "Schöllbauer",
//           mail: "office@test.com",
//           phone: "1256987987",
//           linkedId: "z78ZF7cPDLwtFWCXX"
//         }
//       ],

//       // stil used??
//       userIds: ["LwtyL62DLgTctSDQR"],
//       priceLists: [
//         {
//           id: "JCjrv6ptQdPEq4zdA",
//           title: "Invacare Short Sea 45ft container PT->UK - C86375"
//         }
//       ],
//       bids: ["iaFKqy", "njtCFn"],
//       requirements: [
//         {
//           id: "ZuNASd",
//           response: true
//         }
//       ],
//       documents: [
//         {
//           id: "RamZwR2zAqxn4ZrGr",
//           name: "2019_Rate Card Short Sea 45ft. container PT_UK_revisão_2.xlsx"
//         }
//       ],
//       NDAresponse: {
//         accepted: true,
//         doc: {
//           name: "NDA-document.pdf",
//           id: "psvqfYiQqMdeEigme"
//         }
//       },
//       firstSeen: new Date("2020-09-24T16:55:29.959+02:00"),
//       lastSeen: new Date("2020-09-30T13:49:15.413+02:00")
//     }
//   ],
//   tenderPackages: [
//     {
//       pickupCountry: "BE",
//       bidGroups: [
//         {
//           pickupCountry: "BE",
//           pickupZip: "*",
//           deliveryCountry: "ES",
//           deliveryZip: "18000",
//           shipmentIds: [],
//           quantity: {
//             scopeCount: 4,
//             shipCount: 500,
//             totalAmount: 4860,
//             avgAmount: 1215,
//             minAmount: 500,
//             maxAmount: 2000,
//             stdevAmount: 595.55,
//             currentAvgLeadtime: null
//           },
//           id: "iaFKqy"
//         },
//         {
//           pickupCountry: "BE",
//           pickupZip: "*",
//           deliveryCountry: "ES",
//           deliveryZip: "28000",
//           shipmentIds: [],
//           quantity: {
//             scopeCount: 4,
//             shipCount: 400,
//             totalAmount: 98691,
//             avgAmount: 24672.75,
//             minAmount: 5454,
//             maxAmount: 65465,
//             stdevAmount: 23834.36,
//             currentAvgLeadtime: null
//           },
//           id: "njtCFn"
//         }
//       ]
//     }
//   ]
// })
//   .timeStamps()
//   .getNDA()
//   .bidGroups()
//   .get();
