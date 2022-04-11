import pick from "lodash.pick";
import { GET_SHIPMENT_PROJECTS, GET_ACCOUNT_SETTINGS } from "./queries";
import projectData from "/imports/api/_jsonSchemas/fixtures/data.shipmentProjects.json";

export const mocks = [
  {
    request: {
      query: GET_SHIPMENT_PROJECTS
    },
    result: {
      data: {
        shipmentProjects: projectData.map(({ _id, type, ...prData }) => ({
          id: _id,
          ...pick(prData, "title", "year", "status"),
          type: {
            ...type,
            lastActiveYear: null,
            __typename: "ProjectCodeType"
          },
          __typename: "ShipmentProject"
        }))
      }
    }
  },
  {
    request: {
      query: GET_ACCOUNT_SETTINGS
    },
    result: {
      data: {
        accountSettings: {
          id: "S65957",
          projectCodes: [
            {
              code: "projectCode 1",
              group: "ProjectGroup 1",
              name: "Project code name",
              description: null,
              __typename: "ProjectCodeType"
            },
            {
              code: "GP BHR II",
              group: "F1",
              name: "GP BHR",
              description: null,
              __typename: "ProjectCodeType"
            }
          ],
          projectYears: [2018, 2019, 2020],
          __typename: "AccountSettings"
        }
      }
    }
  }
];
