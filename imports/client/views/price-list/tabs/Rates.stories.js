import React from "react";
import { MockedProvider } from "@apollo/client/testing";

// import { useTranslation, Trans } from "react-i18next";
import PageHolder from "../../../components/utilities/PageHolder";
import RatesTab from "./Rates.jsx";

// import { GridButtons } from "../segments/Rates";

import { ChargeForm } from "../components/ChargeModal";
import { RateForm } from "../components/RateModal";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceList/Tabs/rates"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="PriceList">
        <RatesTab {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

// export const buttons = () => {
//   const allButtons = [
//     {
//       template: "LaneModal",
//       text: <Trans i18nKey={"price.list.lane.add"} />,
//       data: {
//         disable: false,
//         onSave: () => {},
//         lanes: [
//           {
//             name: "zone 1",
//             from: {
//               addressIds: ["WJNLceXYjFBdYL4YQ"]
//             },
//             to: {
//               zones: [
//                 {
//                   CC: "ES",
//                   from: "28000",
//                   to: "28999"
//                 }
//               ]
//             },
//             id: "ttqfKC"
//           },
//           {
//             name: "zone 4",
//             from: {
//               addressIds: ["WJNLceXYjFBdYL4YQ"]
//             },
//             to: {
//               zones: [
//                 {
//                   CC: "ES",
//                   from: "19000",
//                   to: "19999"
//                 },
//                 {
//                   CC: "ES",
//                   from: "40000",
//                   to: "40999"
//                 },
//                 {
//                   CC: "ES",
//                   from: "45000",
//                   to: "45999"
//                 }
//               ]
//             },
//             id: "qvkuFE"
//           }
//         ]
//       }
//     },
//     {
//       template: "PriceListChargeModal",
//       text: <Trans i18nKey={"price.list.charge.add"} />,
//       data: {
//         disable: false,
//         onSave: () => {},
//         charges: []
//       }
//     },
//     {
//       template: "VolumeGroupModal",
//       text: <Trans i18nKey={"price.list.volume.add"} />,
//       data: {
//         disable: false,
//         onSave: () => {},
//         volumes: [
//           {
//             ranges: [
//               {
//                 from: 0,
//                 to: 5,
//                 id: "3ZixFw"
//               },
//               {
//                 from: 5,
//                 to: 10,
//                 id: "QCDq3h"
//               }
//             ],
//             uom: "kg",
//             serviceLevel: "LTL",
//             volumeGroupIndex: 0,
//             id: "wa3CkG"
//           }
//         ]
//       }
//     },
//     {
//       template: "EquipmentModal",
//       text: <Trans i18nKey={"price.list.equipment.add"} />,
//       data: {
//         disable: false,
//         onSave: () => {},
//         equipments: []
//       }
//     }
//   ];

//   return (
//     <PageHolder main="PriceList">
//       <GridButtons buttons={allButtons} />
//     </PageHolder>
//   );
// };

export const chargeModalForm = () => {
  return <ChargeForm />;
};

export const RateDetailForm = () => {
  const props = {
    ...dummyProps,
    rate: {
      id: "test"
    }
  };
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="PriceList">
        <RateForm {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
