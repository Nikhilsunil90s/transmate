/* eslint-disable no-shadow */
import React, { useEffect, useState } from "react";
import escapeRegExp from "lodash.escaperegexp";
import { Search } from "semantic-ui-react";
import { connectField } from "uniforms";
import classNames from "classnames";
import groupBy from "lodash.groupby";

const AutoComplete = props => {
  const [results, setResults] = useState([]);
  const { options, name, label, id, required, error, category, value, disabled } = props;
  const [autocompleteValue, setAutocompleteValue] = useState(value);
  const [valueChanged, setValueChanged] = useState(false);
  useEffect(() => {
    if (!valueChanged) {
      setAutocompleteValue(value);
    }
  });

  useEffect(() => setResults(options), [options]);

  const getFilteredResults = (options, value) =>
    options.filter(option => {
      const re = new RegExp(escapeRegExp(value), "i");

      const isMatchLabel = re.test(option.label);
      const isMatchValue = re.test(option.value);

      return isMatchLabel || isMatchValue;
    });

  const handleSearchChangeByCategory = (_, { value }) => {
    setAutocompleteValue(value);
    setValueChanged(true);

    const allOptionsFromDifferentCategories = [];

    options.forEach(({ results }) => {
      const filteredResults = getFilteredResults(results, value);
      allOptionsFromDifferentCategories.push(...filteredResults);
    });

    const groupedProjectCodes = groupBy(allOptionsFromDifferentCategories, "group");
    const projectCodeGroups = Object.keys(groupedProjectCodes);
    const filteredResults = projectCodeGroups.map(projectCodeGroup => ({
      name: projectCodeGroup,
      results: groupedProjectCodes[projectCodeGroup]
    }));

    setResults(filteredResults);
  };

  const handleSearchChange = (_, { value }) => {
    setAutocompleteValue(value);
    setValueChanged(true);
    const filteredResults = getFilteredResults(options, value);
    setResults(filteredResults);
  };

  const handleResultSelect = (_, { result }) => {
    setAutocompleteValue(result.value);
    setValueChanged(true);
    props.onChange(result.value, name);
  };

  return (
    <div className={classNames("field", { required, error })}>
      <label htmlFor={id}>{label}</label>
      <Search
        id={id}
        category={category}
        disabled={disabled}
        icon={<i className="dropdown icon" />}
        onResultSelect={handleResultSelect}
        onSearchChange={category ? handleSearchChangeByCategory : handleSearchChange}
        results={results}
        value={autocompleteValue}
      />
    </div>
  );
};

const AutoCompleteField = connectField(React.memo(AutoComplete));

export default AutoCompleteField;
