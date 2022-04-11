import PropTypes from "prop-types";

export const portalPropType = {
  profile: PropTypes.shape({
    id: PropTypes.string,
    description: PropTypes.string,
    banner: PropTypes.string,
    logo: PropTypes.string
  }),
  canEdit: PropTypes.bool,
  activeUser: PropTypes.shape({
    mail: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired,
  notifications: PropTypes.shape({
    error: PropTypes.bool,
    lastSave: PropTypes.instanceOf(Date)
  })
};
