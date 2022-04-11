import React from "react";
import pick from "lodash.pick";
import { Container } from "semantic-ui-react";
import { AccountPortal } from "./Portal";
import { ServicesDropdown } from "./components/ServicesDropdown";
import { storyData } from "./utils/storyData";
import PortalUnsubscribe from "./Unsubscribe";

// to run in browser:
// app.transmate.eu/portal/4fCKFqX3jZaCWQECt?userKey=213de02a-8da3-41e7-997e-22d4d538a2f7

export default {
  title: "Account/Portal",
  decorators: [
    Story => (
      <div className="app">
        <main className="Portal">
          <Container>
            <Story />
          </Container>
        </main>
      </div>
    )
  ]
};

function onSave(update, cb) {
  console.log(update);
  if (typeof cb === "function") cb();
}

export const basic = () => {
  const dummyProps = { ...storyData, onSave };
  return <AccountPortal {...dummyProps} />;
};

export const minimal = () => {
  const dummyProps = {
    onSave,
    profile: pick(storyData.profile, ["id", "name"]),
    canEdit: true,
    activeUser: storyData.activeUser
  };
  return <AccountPortal {...dummyProps} />;
};

export const servicesSelection = () => {
  return <ServicesDropdown onChange={console.log} value={["cars.cars"]} />;
};

export const unsubscribe = () => {
  return <PortalUnsubscribe />;
};
