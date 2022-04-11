import { Trans } from "react-i18next";
import React from "react";
import PropTypes from "prop-types";
import { Segment, Button } from "semantic-ui-react";

const ProfileControlSegment = ({ ...props }) => {
  const { security = {}, regenerateProfile } = props;
  const { canGenerateProfile } = security;

  return canGenerateProfile ? (
    <Segment
      padded="very"
      content={
        <Button
          primary
          onClick={regenerateProfile}
          content={<Trans i18nKey="tender.profile.generateBtn" />}
        />
      }
    />
  ) : null;
};

ProfileControlSegment.propTypes = {
  tender: PropTypes.object,
  security: PropTypes.object,
  onSave: PropTypes.func,
  saveDetail: PropTypes.func,
  saveBid: PropTypes.func,
  userRole: PropTypes.string
};

export default ProfileControlSegment;
