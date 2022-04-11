import React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { Loader } from "semantic-ui-react";
import { LocationSummaryTag } from "./LocationTag";

const GET_LOCATION_INFO = gql`
  query getLocationInfo($id: String!, $type: String!) {
    location: getLocationInfo(id: $id, type: $type) {
      address {
        id
        annotation {
          name
        }
        street
        number
        bus
        zip
        city
        state
        country
        countryCode
      }
      location {
        id
        countryCode
        locationCode
      }
    }
  }
`;

const LocationTagLoader = ({ id, type }) => {
  const { data = {}, loading, error } = useQuery(GET_LOCATION_INFO, {
    variables: { id, type },
    fetchPolicy: "no-cache",
    skip: !id || !type
  });
  if (error) {
    console.error(error);
  }

  const { location = {} } = data;

  return (
    <>
      <Loader active={loading} inline size="tiny" />
      <LocationSummaryTag location={location} />
    </>
  );
};

export default LocationTagLoader;
