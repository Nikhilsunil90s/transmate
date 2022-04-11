import { MATCH_ANY_PARAMETERS } from "wildcard-mock-link";
import { GET_WORKFLOW_TYPES } from "../modal/Workflow";

export const MOCK_GET_WORKFLOW_TYPES = {
  request: {
    query: GET_WORKFLOW_TYPES,
    variables: MATCH_ANY_PARAMETERS
  },
  result: {
    data: {
      workflowSettings: {
        id: "accountId",
        workflowTypes: [
          {
            id: "task-simple",
            label: "Task (simple)",
            inputs: [
              {
                id: "userId",
                label: null,
                type: "userIds"
              },
              {
                id: "notes",
                label: null,
                type: "richText"
              }
            ]
          },
          {
            id: "task-assignment",
            label: "Task (w assignment)",
            inputs: [
              {
                id: "userId",
                label: null,
                type: "userIds"
              },
              {
                id: "notes",
                label: null,
                type: "richText"
              }
            ]
          }
        ]
      }
    }
  }
};
