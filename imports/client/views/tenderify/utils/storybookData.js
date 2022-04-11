import { WildcardMockLink, MATCH_ANY_PARAMETERS } from "wildcard-mock-link";
import fixtures from "/imports/api/_jsonSchemas/fixtures/data.tenderify.json";
import mappingFixtures from "/imports/api/_jsonSchemas/fixtures/data.tenderify.mapping.json";
import settingsFixtures from "/imports/api/_jsonSchemas/fixtures/data.settings.json";
import { cleanFixtureData } from "/imports/utils/functions/cleanFixtureData";
import { generateSettings } from "./generateSettings";

import { GET_CONTACT_INFO, GET_SETTINGS } from "./queries";
import { GET_WORKFLOWS } from "/imports/client/views/bpmn-workflows/utils/queries";
import { MOCK_GET_WORKFLOW_TYPES } from "/imports/client/views/bpmn-workflows/utils/storyData";

export const tenderBid = cleanFixtureData(fixtures)[0];
export const tenderBidMapping = cleanFixtureData(mappingFixtures);
const settingsRaw = settingsFixtures.find(({ _id }) => _id === "tenderify-map");

export const settings = generateSettings(settingsRaw);

export const securityMock = {
  canRelease: true,
  canSetBackToDraft: true,
  canSetToReview: true,
  canBeClosed: true,
  canBeCanceled: true,
  createBid: true,
  editGeneral: true,
  startWorkflow: true,
  editContacts: true,
  editRequirement: true,
  changePartner: true,
  editPartnerData: true,
  addMapping: true,
  editMapping: true,
  removeMapping: true,
  generateOffer: true
};

export const MOCK_CONTACT_INFO = {
  request: {
    query: GET_CONTACT_INFO,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      user: {
        id: "test",
        email: "test@test.com",
        name: "dummy",
        avatar: null
      }
    }
  }
};

export const MOCK_GET_SETTINGS = {
  request: {
    query: GET_SETTINGS,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      settings: {
        mapBlocks: null,
        mappingParents: null,
        mappingStoreOptions: null,
        mappingStoreOptionsDefault: null,
        mappingListOptions: {
          services: null,
          equipments: null,
          multipliers: null
        },

        mappingKeys: [
          {
            k: null,
            parent: null,
            type: null,
            label: null,
            description: null,
            sequence: null,
            group: null,
            mappingFunction: null,
            input: {
              type: null,
              source: null
            }
          }
        ]
      }
    }
  }
};

export const MOCK_GET_WORKFLOWS = {
  request: {
    query: GET_WORKFLOWS,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      workflows: null
    }
  }
};

export const wildCardLinks = new WildcardMockLink(
  [
    MOCK_CONTACT_INFO,
    MOCK_GET_SETTINGS,
    MOCK_GET_WORKFLOWS,
    MOCK_GET_WORKFLOW_TYPES
  ],
  { addTypename: false }
);
