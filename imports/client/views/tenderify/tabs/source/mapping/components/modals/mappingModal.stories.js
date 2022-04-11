import React, { useState } from "react";
import { MockedProvider } from "@apollo/client/testing";
import {
  securityMock,
  tenderBid,
  settings
} from "/imports/client/views/tenderify/utils/storybookData";
import { SettingsProvider } from "/imports/client/views/tenderify/utils/settingsContext";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import TenderifyMappingModal from "./MappingModal";

const allProps = {
  id: "2jG2mZFcaFzqaThcr",
  tenderBid,
  security: securityMock,
  onSave: console.log,
  onSaveDetails: console.log,
  onSaveBid: console.log,
  refreshData: console.log,
  selectTab: () => {},
  selectNextTab: () => {}
};

const mappingsData = {
  lanesFromCity: [
    {
      o: "Jeddah",
      t: "Qinzhou Pt",
      store: true
    },
    {
      o: "Limassol",
      t: "Qinzhou Pt",
      store: true
    },
    {
      o: "Kobe",
      t: "Qinzhou Pt",
      store: true
    }
  ]
};

const sectionDecorators = [
  Story => (
    <SettingsProvider value={settings}>
      <Story />
    </SettingsProvider>
  )
];

export default {
  title: "Tenderify/mapping",
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

export const modal = () => {
  const [mappings] = useState(mappingsData);
  return (
    <div>
      <TenderifyMappingModal
        show
        showModal={() => {}}
        mappings={mappings}
        onSave={console.log}
      />
    </div>
  );
};

modal.decorators = sectionDecorators;
