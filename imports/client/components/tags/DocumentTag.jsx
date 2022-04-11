import React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { Loader } from "semantic-ui-react";

export const GET_DOCUMENT = gql`
  query getDocument($id: String!) {
    document: getDocument(id: $id) {
      id
      meta {
        name
      }

      # projected:
      icon
      url
    }
  }
`;

const DocumentTag = ({ id, text }) => {
  const { data = {}, loading, error } = useQuery(GET_DOCUMENT, {
    variables: { id },
    fetchPolicy: "cache-first",
    skip: !id
  });
  if (error) console.error(error);

  const document = data.document || {};

  return (
    <>
      <Loader active={loading} inline size="tiny" />
      <a href={document.url} target="_blank" rel="noreferrer">
        {text || document.meta?.name || "file"}
      </a>
    </>
  );
};

export default DocumentTag;
