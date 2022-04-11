import React from "react";
import { Image } from "semantic-ui-react";
import PropTypes from "prop-types";

const BLANK_BANNER = "https://app.transmate.eu/images/repeat_background_horizontal.png";

const ProfileGeneralBanner = ({ logo, banner }) => {
  return logo ? (
    <>
      <div className="logo">
        <Image src={logo} />
      </div>
      <div
        className="banner"
        style={{
          background: `url(${banner || BLANK_BANNER})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
    </>
  ) : null;
};

ProfileGeneralBanner.propTypes = {
  logo: PropTypes.string,
  banner: PropTypes.string
};

export default ProfileGeneralBanner;
