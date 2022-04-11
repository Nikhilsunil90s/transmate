import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import {
  securityMock,
  tenderBid,
  tenderBidMapping,
  settings
} from "./utils/storybookData";
import { SettingsProvider } from "./utils/settingsContext";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { GeneralTab, OfferTab, NotesTab } from "./tabs";

import { TenderifySectionMapping } from "/imports/client/views/tenderify/tabs/source/sections/Mapping";
import { TenderifySheet } from "/imports/client/views/tenderify/tabs/sheet/Sheet";
import { sheetData } from "/imports/client/views/tenderify/tabs/sheet/utils/storyData";
import { wildCardLinks } from "./utils/storybookData";

const allProps = {
  tenderBidId: "2jG2mZFcaFzqaThcr",
  tenderBid,
  security: securityMock,
  onSave: console.log,
  onSaveDetails: console.log,
  onSaveBid: console.log,
  refreshData: console.log,
  selectTab: () => {},
  selectNextTab: () => {}
};

const sectionDecorators = [
  Story => (
    <SettingsProvider value={settings}>
      <Story />
    </SettingsProvider>
  )
];

export default {
  title: "Tenderify/Tabs",
  decorators: [
    (Story, context) => {
      const { mocks, link } = context?.args || {};

      return (
        <MockedProvider mocks={mocks} link={link} addTypename={false}>
          <PageHolder main="Tenderify">
            <Story />
          </PageHolder>
        </MockedProvider>
      );
    }
  ]
};

export const generalTab = () => {
  // FlowRouter.setParams({ _id: "2jG2mZFcaFzqaThcr" });
  console.log("test");
  return (
    <div>
      <GeneralTab {...allProps} />
    </div>
  );
};

generalTab.args = { link: wildCardLinks };

// export const offerTab = () => {
//   // FlowRouter.setParams({ _id: "2jG2mZFcaFzqaThcr" });
//   return (
//     <div>
//       <OfferTab {...allProps} />
//     </div>
//   );
// };

// offerTab.args = { link: wildCardLinks };

// export const notesTab = () => {
//   // FlowRouter.setParams({ _id: "2jG2mZFcaFzqaThcr" });
//   return (
//     <div>
//       <NotesTab {...allProps} />
//     </div>
//   );
// };

// export const mappingSection = () => {
//   return (
//     <div>
//       <TenderifySectionMapping
//         {...allProps}
//         mappings={tenderBidMapping}
//         settings={settings}
//         loading={false}
//       />
//     </div>
//   );
// };
// mappingSection.decorators = sectionDecorators;

// export const sheetSection = () => {
//   console.log({ sheetData });
//   return (
//     <div>
//       <TenderifySheet
//         {...allProps}
//         rowData={sheetData.data}
//         meta={sheetData.meta}
//       />
//     </div>
//   );
// };
// sheetSection.decorators = sectionDecorators;
