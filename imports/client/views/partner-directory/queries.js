import { gql } from "@apollo/client";

export const SEARCH_DIRECTORY = gql`
  query searchDirectory($input: DirectorySearchInput!) {
    results: searchDirectory(input: $input) {
      id
      logo
      name
      description
      profile
      isFavorite
    }
  }
`;

export const GET_DIRECTORY_SEARCH_OPTIONS = gql`
  query getSearchOptionsDirectory {
    results: getSearchOptionsDirectory {
      services
      certificates
    }
  }
`;

export const ADD_TO_FAVORITES = gql`
  mutation addToFavorites($input: addToFavoritesInput!) {
    addToFavorites(input: $input) {
      id
      isFavorite
    }
  }
`;
