import React, { useState } from "react";
import { Emitter, Events } from "/imports/client/services/events";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";
import { Input } from "semantic-ui-react";

const debug = require("debug")("table:search");

const initialState = { value: "" };

const TableSearchHeader = ({ setSearching }) => {
  const { t } = useTranslation();
  const [state, setState] = useState(initialState);
  const handleSearchChange = (e, { value }) => {
    debug("table search for %s", value);
    setState({ ...state, value });

    // if (state.value.length < 1) return setState(initialState);

    // in list search:
    Emitter.emit(Events.TABLE_BAR_SEARCH, { query: value });
  };
  return (
    <form role="search">
      <Input
        icon="search"
        iconPosition="left"
        fluid
        transparent
        placeholder={t("search.placeholderFilterTable")}
        onBlur={() => setSearching && setSearching(false)}
        onFocus={() => setSearching && setSearching(true)}
        onChange={debounce(handleSearchChange, 500, {
          leading: true
        })}
        value={state.value}
      />
    </form>
  );
};
export default TableSearchHeader;
