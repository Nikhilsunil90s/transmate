import React, { useEffect } from "react";
import { Button, Icon } from "semantic-ui-react";
import { useLazyQuery } from "@apollo/client";
import isEmpty from "lodash.isempty";
import get from "lodash.get";

import { LocationMinTag } from "/imports/client/components/tags";
import { GET_LOCATION_INFO } from "../../utils/queries";

const LocationHeader = ({ addressId, showModal }) => {
  const handleClick = () => showModal(true);
  const [fetchLocationInfo, { data, loading }] = useLazyQuery(GET_LOCATION_INFO, {
    fetchPolicy: "no-cache"
  });

  useEffect(() => {
    fetchLocationInfo({
      variables: {
        id: addressId,
        type: "address"
      }
    });
  }, [addressId]);

  const location = {
    name: get(data, ["location", "address", "annotation", "name"], ""),
    countryCode: get(data, ["location", "address", "countryCode"], "")
  };

  return (
    <div className="ts-shipment-header__loc">
      {!(isEmpty(data) || loading) && <LocationMinTag location={location} />}
      <Button size="mini" content={<Icon name="cog" />} onClick={handleClick} primary icon />
    </div>
  );
};

export default LocationHeader;
