import gql from "graphql-tag";

export const GET_DASHBOARD_DATA = gql`
  query getDashboardData {
    stats: getDashboardData {
      addressLocations {
        name
        location {
          lat
          lng
        }
      }
      priceListCount
      priceRequestCount
      invoiceCount
      shipmentCount {
        planned
        completed
        started
        draft
      }
      tenderCount
    }
  }
`;

export const GET_MY_TASKS = gql`
  query getMyTasks {
    tasks: getMyTasks {
      id
      title
      icon
      taskType
      dueDate
      active
      references {
        id
        type
      }
    }
  }
`;
