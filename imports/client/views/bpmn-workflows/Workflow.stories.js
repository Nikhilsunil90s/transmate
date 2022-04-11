import React from "react";
import { Button } from "semantic-ui-react";
import { MockedProvider } from "@apollo/client/testing";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { WorkFlowForm } from "./modal/Workflow.jsx";

import fixtures from "/imports/api/_jsonSchemas/fixtures/data.settings.json";

const settings = fixtures.find(({ id }) => id === "workflowTypes");

export default {
  title: "Components/Workflows",
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

export const newWorkflowForm = () => {
  let formRef;
  return (
    <div>
      <WorkFlowForm
        workflowTypes={settings.workflowTypes}
        formRef={ref => {
          formRef = ref;
        }}
      />
      <br />
      <Button content="Submit" onClick={() => formRef.submit()} />
    </div>
  );
};
