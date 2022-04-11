import PortalFixtures from "/imports/api/_jsonSchemas/fixtures/data.accountPortal.json";

const profile = PortalFixtures[0];

export const storyData = {
  profile,
  canEdit: true,
  activeUser: profile.contacts[0]
};
