import React from "react";
import { Trans } from "react-i18next";
import { MockedProvider } from "@apollo/client/testing";
import { Container, Segment } from "semantic-ui-react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { SearchForm } from "./PriceLookup";
import PriceLookupResults from "./components/Results";
import {
  accountSettingsMock,
  partnersMock,
  priceListsMock,
  lookupResult
} from "./utils/storyData";

export default {
  title: "Tools/PriceLookup",
  decorators: [
    (Story, context) => {
      const { mocks, ...args } = context.args;
      return (
        <MockedProvider mocks={mocks} addTypename={false}>
          <PageHolder main="ToolsRouteInsight">
            <Story {...args} />
          </PageHolder>
        </MockedProvider>
      );
    }
  ]
};

// function onSave(update, cb) {
//   console.log(update);
//   if (typeof cb === "function") cb();
// }

export const form = () => {
  return <SearchForm />;
};

form.args = { mocks: [accountSettingsMock, partnersMock, priceListsMock] };
form.decorators = [
  Story => (
    <Container>
      <IconSegment
        name="priceLookup"
        icon="search"
        title={<Trans i18nKey="tools.priceLookup.title" />}
        body={<Story />}
      />
    </Container>
  )
];

export const results = props => {
  return <PriceLookupResults {...props} />;
};

results.args = { lookupResult, currency: "USD" };
results.decorators = [
  Story => (
    <Segment padded="very">
      <Story />
    </Segment>
  )
];

export const resultsEmpty = props => {
  return <PriceLookupResults {...props} />;
};

resultsEmpty.args = {
  lookupResult: {
    costs: []
  }
};
