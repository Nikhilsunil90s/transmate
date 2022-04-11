import React from "react";

import PageHolder from "../../../../components/utilities/PageHolder";
import ProfileGeneralBanner from "./Banner.jsx";

export default {
  title: "Account/Profile/Segments/Banner"
};

const dummyProps = {
  profile: {
    accountId: "S12345",
    banner: "https://react.semantic-ui.com/images/avatar/large/matthew.png",
    logo: "https://react.semantic-ui.com/images/avatar/large/matthew.png"
  }
};

export const full = () => (
  <PageHolder main="Partner">
    <ProfileGeneralBanner {...dummyProps} />
  </PageHolder>
);

export const logoOnly = () => {
  const props = { ...dummyProps };
  delete props.profile.banner;
  return (
    <PageHolder main="Partner">
      <ProfileGeneralBanner {...props} />
    </PageHolder>
  );
};

export const empty = () => {
  const props = { ...dummyProps };
  delete props.profile.banner;
  delete props.profile.logo;
  return (
    <PageHolder main="Partner">
      <ProfileGeneralBanner {...props} />
    </PageHolder>
  );
};
