import React from "react";
import PropTypes from "prop-types";

import {
  ProfileGeneralBanner,
  ProfileGeneralSegment,
  ProfileContactSegment,
  ProfileLocationsSegment,
  ProfileWebsitesSegment,
  ProfileServicesSegment
} from "./sections";

const AccountProfileSegments = ({ profile, ...props }) => {
  const contacts = profile?.contacts || [];
  const locations = profile?.locations || [];
  const sites = profile?.sites || [];
  const services = profile?.services || [];
  const { banner, logo } = profile || {};

  return [
    <ProfileGeneralBanner key="banner" {...props} {...{ banner, logo }} />,
    <ProfileGeneralSegment key="general" {...props} {...{ profile }} />,
    <ProfileContactSegment key="contacts" {...props} {...{ contacts }} />,
    <ProfileLocationsSegment key="locations" {...props} {...{ locations }} />,
    <ProfileWebsitesSegment key="websites" {...props} {...{ sites }} />,
    <ProfileServicesSegment key="services" {...props} {...{ services }} />
  ];
};

AccountProfileSegments.propTypes = {
  profile: PropTypes.object,
  loading: PropTypes.bool,
  canEdit: PropTypes.bool,
  isOwnAccount: PropTypes.bool,
  isCarrier: PropTypes.bool,
  onSaveAction: PropTypes.func
};

export default AccountProfileSegments;
