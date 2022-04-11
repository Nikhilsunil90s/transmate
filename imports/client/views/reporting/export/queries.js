import gql from "graphql-tag";

export const GET_REPORT_DATA = gql`
  query getReportData($input: DownloadReportInput!) {
    data: getReportData(input: $input) {
      result
    }
  }
`;
