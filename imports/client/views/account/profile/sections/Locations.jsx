import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Card, Icon, Button, Popup } from "semantic-ui-react";
import { useLazyQuery, gql } from "@apollo/client";
import PropTypes from "prop-types";

import LinkLocationModal from "../modals/linkLocation";
import { IconSegment } from "../../../../components/utilities/IconSegment";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const debug = require("debug")("account:profile");

const GET_ADDRESS_DATA = gql`
  query getAddressForCard($addressId: String!) {
    location: getAddress(addressId: $addressId) {
      id
      street
      number
      bus
      zip
      city
      country
      countryCode
      timeZone

      # resolvers
      name
    }
  }
`;

const LocationCard = ({ location }) => {
  const { addressId, name } = location;
  const [getAddrInfo, { data = {}, error, called }] = useLazyQuery(GET_ADDRESS_DATA, {
    variables: { addressId },
    fetchPolicy: "cache-first"
  });

  if (error) debug("error in data fetch %o", error);
  if (!name && addressId && !called) getAddrInfo();
  const loc = { ...location, ...data.location };

  return (
    <Card raised>
      <Card.Content>
        <Card.Header>{loc.name}</Card.Header>
        <Card.Meta>
          {loc.street} {loc.number} {loc.bus}
          <br />
          {loc.country} {loc.zip} {loc.city} <br />
        </Card.Meta>
        <Card.Description />
      </Card.Content>
      <Card.Content extra>
        <Popup
          content={<Trans i18nKey="account.profile.locations.link" />}
          trigger={
            <a href={addressId ? generateRoutePath("address", { _id: addressId }) : ""}>
              <Icon name="long arrow alternate right" />
            </a>
          }
        />
      </Card.Content>
    </Card>
  );
};

const LocationOverview = ({ locations = [] }) => {
  const { t } = useTranslation();
  const hasLocations = locations.length > 0;
  return hasLocations ? (
    <Card.Group>
      {locations.map((location, i) => (
        <LocationCard key={`location-${i}`} location={location} />
      ))}
    </Card.Group>
  ) : (
    <div className="empty">{t("partner.profile.locations.empty")}</div>
  );
};

const LocationFooter = ({ saveLocations, locations = [] }) => {
  const { t } = useTranslation();
  const onAddLocation = newLoc => {
    const allLocs = [...locations, newLoc];
    saveLocations({ locations: allLocs });
  };
  return (
    <LinkLocationModal onSave={onAddLocation}>
      <Button primary icon="plus" size="mini" content={t("account.profile.locations.add")} />
    </LinkLocationModal>
  );
};

const ProfileLocationSegment = ({ canEdit, onSave, locations = [] }) => {
  const { t } = useTranslation();
  const saveLocations = ({ locations: newLocations }) => {
    onSave({ locations: newLocations.map(({ addressId, type }) => ({ addressId, type })) });
  };
  const segmentData = {
    name: "locations",
    icon: "marker",
    title: t("account.profile.locations.title"),
    body: <LocationOverview {...{ locations, saveLocations, canEdit }} />,
    ...(canEdit
      ? {
          footer: <LocationFooter {...{ saveLocations, locations }} />
        }
      : undefined)
  };
  return <IconSegment {...segmentData} />;
};
ProfileLocationSegment.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  locations: PropTypes.array
};

export default ProfileLocationSegment;
