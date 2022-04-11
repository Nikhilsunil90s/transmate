import React from "react";
import PropTypes from "prop-types";
import merge from "lodash.merge";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import { Grid } from "semantic-ui-react";
import { Hours, Safety } from "../components";
import LocationTag from "/imports/client/components/tags/LocationTag.jsx";
import { LocationType } from "/imports/client/components/tags/LocationTag.proptypes";
import { DisplayMapClass } from "../../../components/maps/HereMap";

import { GET_ADDRESS_ANNOTATION } from "./query";
import { addressToLocationType } from "./helper";

/** shows annotation view for address for a given accountId
 * in shipment - accountId of owner account is passed in to get their annotated data
 */
export const AddressView = ({ location, annotation }) => {
  const markers = [{ coords: location.latLng, color: "green" }];
  const hasAnnotation = Object.keys(annotation || {}).length > 0;

  return (
    <Grid>
      <Grid.Row columns={2} verticalAlign="middle">
        <Grid.Column>
          {location.latLng && <DisplayMapClass {...{ height: 200, markers, mapType: "truck" }} />}
        </Grid.Column>
        <Grid.Column>
          <LocationTag location={location} />
        </Grid.Column>
      </Grid.Row>
      {hasAnnotation && (
        <>
          <Grid.Row>
            <Grid.Column>
              <h3>
                <Trans i18nKey="address.form.hours.title" />
              </h3>
              <Hours annotation={annotation} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <h3>
                <Trans i18nKey="address.form.safety.title" />
              </h3>
              <Safety annotation={annotation} />
            </Grid.Column>
          </Grid.Row>
        </>
      )}
    </Grid>
  );
};

AddressView.propTypes = {
  location: LocationType,
  annotation: PropTypes.shape({
    hours: PropTypes.object,
    safety: PropTypes.object
  })
};

/**
 *
 * @param {String} addressId id of the address
 * @param {String=} accountId optional - accountId of annotation data
 */
const AddressViewLoader = ({ ...props }) => {
  const { addressId, accountId } = props;
  const { data = {}, error } = useQuery(GET_ADDRESS_ANNOTATION, {
    variables: { addressId, accountId },
    fetchPolicy: "no-cache"
  });
  if (error) console.error(error);

  const location = merge(props.location, addressToLocationType(data.address || {}));
  const { annotation } = data.address || {};

  return <AddressView {...{ location, annotation }} />;
};

export default AddressViewLoader;
