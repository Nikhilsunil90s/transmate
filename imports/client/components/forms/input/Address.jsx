import { gql, useLazyQuery } from "@apollo/client";
import classNames from "classnames";
import PropTypes from "prop-types";
import get from "lodash.get";
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Input } from "semantic-ui-react";
import { connectField } from "uniforms";

import NewAddressModal from "/imports/client/views/address-overview/components/NewAddressModal";

const debug = require("debug")("address:input");

const SEARCH_ADDRESS_FRAGMENT = gql`
  fragment AddressResultFragment on SearchAddressResultItem {
    id
    name
    formatted
    isGlobal
    timeZone
  }
`;
export const SEARCH_ADDRESS_QUERY = gql`
  query searchAddresses($query: String!, $options: searchAddressOptions) {
    searchAddress(input: { query: $query, options: $options }) {
      book {
        ...AddressResultFragment
      }
      global {
        ...AddressResultFragment
      }
      locode {
        ...AddressResultFragment
      }
    }
  }
  ${SEARCH_ADDRESS_FRAGMENT}
`;

export const GET_LOCATION_INFO = gql`
  query getLocationInfoInAddressInput($id: String!, $type: String!) {
    locationInfo: getLocationInfo(id: $id, type: $type) {
      address {
        name
        addressFormatted
      }
      location {
        name
      }
    }
  }
`;

/**
 * get data through remote search, returns 3 categories:
 * 1. address matches from own addressbook
 * 2. address matches from global addressbook
 * 3. locodes
 *
 * dropdown groups results & places option to add a new address
 *
 * options:
 * includeGlobal
 * includeLocodes
 * allowCreate
 * noDisplay - do not display formatted label
 * @returns {Object} {id, type}
 */
export const AddressInput = ({
  fixedData,
  label,
  options = {},
  disabled,
  id,
  inputRef,
  onChange,
  value: modelValue, // initial value? { id, type: "location" | "address" }
  onAddressChange = () => {}, // to port additional addressInfo, returns {location}
  placeholder,
  required,
  error
}) => {
  const { t } = useTranslation();
  const [show, showModal] = useState(false);
  const [isFetching, setFetching] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setQuery] = useState(null);
  const [data, setData] = useState(fixedData || {}); // data: { book: [], global: [], locodes: []}
  const [inputText, setInputText] = useState("");
  const [displayText, setDisplayText] = useState();
  const { excludeGlobal, excludeLocodes } = options;

  const [lookupLocationInfo] = useLazyQuery(GET_LOCATION_INFO);

  // eslint-disable-next-line no-unused-vars
  const [loadData, { called, loading, data: queryData, error: qError }] = useLazyQuery(
    SEARCH_ADDRESS_QUERY,
    {
      fetchPolicy: "cache-first",
      variables: { query: searchQuery, options: { excludeGlobal, excludeLocodes } }
    }
  );

  const handleSearchChange = (e, { value }) => {
    setInputText(value);
    setQuery(value);
  };

  const handleAddressCreate = useCallback(() => {
    showModal(true);
  }, []);

  const handleOnAdressCreated = ({ id: addressId, name, addressFormatted }) => {
    showModal(false);
    onChange({ id: addressId, type: "address" });
    setInputText(name);
    setDisplayText(addressFormatted);
    setExpanded(false);
  };

  useEffect(() => {
    setData({});
    if (searchQuery && searchQuery.length > 3) {
      if (fixedData) return;
      loadData();
      setFetching(loading);
      if (loading) return;
      if (queryData && queryData.searchAddress !== data) {
        debug("GQL queryData", queryData);
        setData(queryData.searchAddress);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, queryData, loading]);

  // set initial values:
  useEffect(() => {
    if (!!searchQuery) return;
    if (!(modelValue && modelValue.id && modelValue.type)) return;

    lookupLocationInfo({ variables: modelValue }).then(({ data: infoData }) => {
      if (modelValue.type === "address" && infoData?.locationInfo?.address?.addressFormatted) {
        setInputText(infoData.locationInfo.address.name);
        setDisplayText(infoData.locationInfo.address.addressFormatted);
      }
      if (modelValue.type === "locode" && infoData?.locationInfo?.location?.name) {
        setDisplayText(infoData.locationInfo.location.name);
      }
    });
  }, [modelValue]);

  return (
    <Form.Field className={classNames({ required, error })}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <div
        className={classNames("fields input-address", { selected: displayText !== undefined })}
        ref={inputRef}
        id={id}
      >
        <div className="field" style={{ width: "100%" }}>
          <Input
            disabled={disabled}
            onKeyUp={() => setExpanded(true)}
            onChange={handleSearchChange}
            loading={isFetching}
            icon="marker"
            iconPosition="left"
            placeholder={placeholder || t("address.form.placeholder")}
            style={{ width: "100%" }}
            value={inputText}
            fluid
            data-test="addressInput"
          />
        </div>

        {!options.noDisplay && displayText && (
          <div className="display-text field">{displayText}</div>
        )}

        <div className={classNames("options", { expanded })}>
          {["book", "locode", "global"].map(group =>
            get(data, `${group}.length`) > 0 ? (
              <div key={group} className="group">
                <label>{t(`address.input.${group}`)}</label>
                {data[group].map(option => (
                  <div
                    key={option.id}
                    className={classNames("option", { locode: group === "locode" })}
                    onClick={e => {
                      e.stopPropagation();
                      debug("selected option: %o", { option, group });
                      const isLocode = group === "locode";
                      onAddressChange({ location: option });
                      onChange({ id: option.id, type: isLocode ? "location" : "address" });
                      setInputText(option.name);
                      if (!isLocode) {
                        setDisplayText(option.formatted);
                      }
                      setExpanded(false);
                    }}
                  >
                    <span className="name">{option.name}</span>
                    {group !== "locode" ? (
                      <span className="address">{option.formatted}</span>
                    ) : (
                      <span className="code">{option.id}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : null
          )}
          {options.allowCreate && (
            <div className="group">
              <NewAddressModal
                onCreated={handleOnAdressCreated}
                {...{ show, showModal }}
                address={{ name: searchQuery }}
              />
              <Button
                as="a"
                basic
                primary
                icon={{ size: "small", name: "add circle" }}
                content={t("address.input.create")}
                onClick={handleAddressCreate}
                className="create-address"
              />
            </div>
          )}
        </div>
      </div>
    </Form.Field>
  );
};

AddressInput.propTypes = {
  label: PropTypes.string,
  options: PropTypes.shape({
    includeGlobal: PropTypes.bool,
    includeLocodes: PropTypes.bool,
    allowCreate: PropTypes.bool,
    noDisplay: PropTypes.bool
  })
};

export default connectField(AddressInput);
