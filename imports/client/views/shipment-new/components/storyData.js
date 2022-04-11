import { WildcardMockLink } from "wildcard-mock-link";
import { SEARCH_ADDRESS_QUERY } from "/imports/client/components/forms/input/Address";

const addressQueryMock = [
  {
    request: {
      query: SEARCH_ADDRESS_QUERY,
      variables: { query: "", options: {} }
    },
    result: {
      data: {
        book: [
          {
            id: "id1",
            name: "Globex 1",
            formatted: "Some street",
            isGlobal: false,
            timeZone: "Asia/Shanghai"
          }
        ],
        global: [],
        locode: []
      }
    }
  }
];

export const link = new WildcardMockLink([addressQueryMock]);
