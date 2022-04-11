import React from "react";
import { MockedProvider } from "@apollo/client/testing";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import ProjectCodes from "./ProjectCodes";
import { INITIALIZE_YEAR_FOR_CODE } from "./queries";

export default {
  title: "Settings/projects"
};

export const form = () => {
  const props = {
    onSave: console.log,
    projectCodes: [
      { group: "F1", code: "BAH", name: "GP Bahrein", lastActiveYear: 2020 },
      { group: "F1", code: "AZE", name: "GP Azerbeidjan" },
      { group: "F1", code: "OTH", name: "GP Other" },
      { group: "F1", code: "XYZ", name: "GP XYZ", lastActiveYear: 2021 }
    ],
    projectYears: [2020, 2021],
    security: {
      canEditProjects: true
    }
  };
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: INITIALIZE_YEAR_FOR_CODE,
            variables: {
              input: {
                projectCode: "BAH",
                projectGroup: "F1",
                newYear: 2021
              }
            }
          },
          result: {
            data: {
              response: {
                projectIds: [],
                shipmentIds: [],
                __typename: "InitYearForProjectCodeResponse"
              }
            }
          }
        }
      ]}
      addTypename={false}
    >
      <PageHolder main="AccountPortal">
        <ProjectCodes {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
