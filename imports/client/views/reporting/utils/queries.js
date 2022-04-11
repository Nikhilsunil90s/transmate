import gql from "graphql-tag";

export const GET_REPORTS = gql`
  query getReports {
    reports: getReports {
      reportId
      dataSetId
      label
      key
      filterKeys
      isPublic
    }
  }
`;

export const GET_EMBED_URL = gql`
  query getReportEmbedURL($input: ReportEmbedURLInput) {
    url: getReportEmbedURL(input: $input)
  }
`;
