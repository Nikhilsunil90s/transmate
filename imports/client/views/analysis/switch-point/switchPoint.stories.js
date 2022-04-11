import React from "react";
import { MockedProvider } from "@apollo/client/testing";

// import { storyData } from "./utils/storyData";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import SwitchPointAnalysis from "./SwitchPoint";

export default {
  title: "Account/Portal",
  decorators: [
    (Story, context) => {
      const { mocks } = context.args;
      return (
        <MockedProvider mocks={mocks} addTypename={false}>
          <PageHolder main="Analysis">
            <Story />
          </PageHolder>
        </MockedProvider>
      );
    }
  ]
};

function onSave(update, cb) {
  console.log(update);
  if (typeof cb === "function") cb();
}

export const basic = () => {
  const dummyProps = { onSave };
  return <SwitchPointAnalysis {...dummyProps} />;
};
basic.args = { mocks: [] };
