import {
  GET_PROJECT_SETTINGS,
  GET_ACCOUNT_USERS,
  GET_ACCOUNT_ROLES
} from "./queries";

import {
  GET_MY_FUEL_INDEXES,
  GET_FUEL_INDEX
} from "../sections/accountData/fuel/utils/queries";

export const security = {
  canEditUsers: true,
  canAddUsers: true,
  canRemoveUsers: true,
  canEditAccountPortal: true,
  canEditFuelModel: true
};

export const fuelIndexDetail = {
  id: "fuelId",
  name: "demo fuel",
  base: {
    rate: 0.05,
    month: 1,
    year: 2020,
    __typename: "FuelBaseType"
  },
  fuel: 5,
  acceptance: 100,
  description: null,
  periods: [
    {
      month: 1,
      year: 2021,
      index: 5.5,
      fuel: 6.0
    }
  ],
  __typename: "Fuel"
};

export const projectMocks = [
  {
    request: {
      query: GET_PROJECT_SETTINGS
    },
    result: {
      data: {
        accountSettings: {
          id: "accountId",
          projectYears: [2019, 2020],
          projectCodes: [
            {
              group: "group",
              code: "a code",
              name: "a name",
              description: "a description",
              __typename: "ProjectCodeType"
            }
          ],
          __typename: "AccountSettings"
        }
      }
    }
  }
];

export const userMocks = [
  {
    request: {
      query: GET_ACCOUNT_USERS
    },
    result: {
      data: {
        users: [
          {
            id: "userId1",
            email: "test@test.com",
            name: "Test User 1",
            roles: ["admin", "user"],
            __typename: "User"
          },
          {
            id: "userId2",
            email: "test2@test.com",
            name: "Test User 2",
            roles: ["user", "customRole"],
            __typename: "User"
          }
        ]
      }
    }
  },
  {
    request: { query: GET_ACCOUNT_ROLES },
    result: {
      data: {
        accountSettings: {
          id: "accountId",
          roles: ["customRole"]
        }
      }
    }
  }
];

export const fuelMocks = [
  {
    request: { query: GET_MY_FUEL_INDEXES },
    result: {
      data: {
        fuelIndexes: [
          {
            id: "fuelId",
            name: "demo fuel",
            base: {
              rate: 0.05,
              month: 1,
              year: 2020,
              __typename: "FuelBaseType"
            },
            fuel: 5,
            acceptance: 100,
            __typename: "Fuel"
          }
        ]
      }
    }
  },
  {
    request: { query: GET_FUEL_INDEX, variables: { fuelIndexId: "fuelId" } },
    result: {
      data: {
        fuelIndex: fuelIndexDetail
      }
    }
  }
];
