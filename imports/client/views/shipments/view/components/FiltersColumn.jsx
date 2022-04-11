import React, { useState } from "react";
import { Trans } from "react-i18next";
import get from "lodash.get";

import { Header, Button } from "semantic-ui-react";

import ShipmentsViewFilterField from "./FilterField";

const FiltersColumn = ({ ...props }) => {
  const { state, updateState } = props;
  const [isAddingFilter, setAddingFilter] = useState(false);

  const selectedFilters = Object.entries(get(state, "filters", {})).map(([field, filter]) => ({
    filter, // active filter values for this field
    field
  }));

  function onChangeFilter(field, filter = {}) {
    updateState({
      filters: {
        ...state.filters,
        [`${field}`]: filter
      }
    });
  }

  // reveals a new filter block:
  function addFilter() {
    setAddingFilter(true);
  }

  function removeFilter(name) {
    const { [name]: removedFilter, ...otherFilters } = state.filters || {};
    updateState({
      filters: otherFilters
    });
  }

  return (
    <>
      <Header dividing content={<Trans i18nKey="shipments.view.filters" />} />
      {selectedFilters.map(({ filter, field }, i) => (
        <ShipmentsViewFilterField
          key={i}
          {...{ field, filter, onChange: onChangeFilter, removeFilter }}
        />
      ))}
      {isAddingFilter && <ShipmentsViewFilterField {...{ onChange: onChangeFilter }} />}

      <div className="add-button">
        <Button
          basic
          primary
          icon="add"
          content={<Trans i18nKey="shipments.view.filter.add" />}
          onClick={addFilter}
        />
      </div>
    </>
  );
};

export default FiltersColumn;
