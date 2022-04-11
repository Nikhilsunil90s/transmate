import React, { useState } from "react";
import gql from "graphql-tag";
import { useLazyQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { Search } from "semantic-ui-react";
import { Emitter, Events } from "/imports/client/services/events";
import debounce from "lodash.debounce";
import useRoute from "../../router/useRoute";

const debug = require("debug")("search:client");

const initialState = { isLoading: false, results: [], value: "" };

const SEARCH = gql`
  query search($query: String) {
    search(query: $query) {
      shipments {
        i18nKey
        results {
          type
          key
          id
          title
          description
        }
      }
      addresses {
        i18nKey
        results {
          type
          key
          id
          title
          description
        }
      }
      partnerships {
        i18nKey
        results {
          type
          key
          id
          title
          description
        }
      }
      priceRequest {
        i18nKey
        results {
          type
          key
          id
          title
          description
        }
      }
      priceList {
        i18nKey
        results {
          type
          key
          id
          title
          description
        }
      }
      tender {
        i18nKey
        results {
          type
          key
          id
          title
          description
        }
      }
    }
  }
`;

const cleanResults = (result, t) => {
  let searchResults = [];
  if (result) {
    searchResults = {};
    Object.entries(result)
      .filter(([k, v]) => k !== "__typename" && !!v && v.results?.length > 0)
      .forEach(([k, { i18nKey, results }]) => {
        searchResults[k] = {
          results,
          name: t(i18nKey)
        };
      });
  }

  return searchResults;
};

const SearchHeader = ({ setSearching }) => {
  const { t } = useTranslation();
  const [fetchQuery, { loading, data = {} }] = useLazyQuery(SEARCH, {
    fetchPolicy: "no-cache"
  });
  const [state, setState] = useState(initialState);

  const { goRoute } = useRoute();

  const handleResultSelect = (e, { result }) => {
    setState({ ...state, value: result.title });
    debug("selected %o", result);
    goRoute(result.type, { _id: result.id });
  };

  const handleSearchChange = (e, { value }) => {
    setState({ ...state, isLoading: true, value });

    // if (state.value.length < 1) return setState(initialState);

    // in list search:
    Emitter.emit(Events.TOP_BAR_SEARCH, { query: value });

    // server search:
    return fetchQuery({ variables: { query: value } });
  };

  debug("search data", data);
  const searchResults = cleanResults(data.search, t);

  return (
    <form role="search">
      <Search
        input={{
          icon: "search",
          iconPosition: "left",
          fluid: true,
          transparent: true,
          placeholder: t("search.placeholder"),
          onBlur: () => setSearching(false),
          onFocus: () => setSearching(true)
        }}
        category
        loading={loading}
        onResultSelect={handleResultSelect}
        onSearchChange={debounce(handleSearchChange, 500, {
          leading: true
        })}
        results={searchResults}
        value={state.value}
      />
    </form>
  );
};

export default React.memo(SearchHeader);
