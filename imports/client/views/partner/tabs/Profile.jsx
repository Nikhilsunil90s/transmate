import React from "react";

import {
  ProfileGeneralBanner,
  ProfileGeneralSegment,
  ProfileContactSegment,
  ProfileLocationsSegment,
  ProfileWebsitesSegment,
  ProfileServicesSegment
} from "/imports/client/views/account/profile/sections";

const AccountProfileSegments = ({ partner, ...props }) => {
  const contacts = partner?.annotation?.profile?.contacts || [];
  const locations = partner?.annotation?.profile?.locations || [];
  const sites = partner?.annotation?.profile?.sites || [];
  const services = partner?.annotation?.profile?.services || [];

  return [
    <ProfileGeneralBanner key="banner" {...props} {...{ profile: partner }} />,
    <ProfileGeneralSegment key="general" {...props} {...{ profile: partner }} />,
    <ProfileContactSegment key="contacts" {...props} {...{ contacts }} />,
    <ProfileLocationsSegment key="locations" {...props} {...{ locations }} />,
    <ProfileWebsitesSegment key="websites" {...props} {...{ sites }} />,
    <ProfileServicesSegment key="services" {...props} {...{ services }} />
  ];
};

const PartnerProfileTab = ({ partner, partnerId, security, onSave }) => {
  function annotateProfile(update) {
    onSave({ update, root: "profile" });
  }
  return (
    <AccountProfileSegments
      partnerId={partnerId}
      partner={partner}
      canEdit={security.canAnnotatePartner}
      isOwnAccount={false}
      onSave={annotateProfile}
    />
  );
};

export default PartnerProfileTab;
