import PropTypes from "prop-types";

const entityProps = {
  entities: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
      address: PropTypes.string,
      zipCode: PropTypes.string,
      city: PropTypes.string,
      country: PropTypes.string,
      UID: PropTypes.string,
      registrationNumber: PropTypes.string,
      EORI: PropTypes.string,
      VAT: PropTypes.string,
      email: PropTypes.string
    })
  )
};

const accountProps = {
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  key: PropTypes.string,
  description: PropTypes.string,
  logo: PropTypes.string,
  banner: PropTypes.string,
  theme: PropTypes.shape({
    colors: PropTypes.string
  }),
  profile: PropTypes.object
};

export const settingsPageProps = {
  section: PropTypes.string.isRequired,
  topic: PropTypes.string,
  account: PropTypes.shape({
    ...accountProps,
    ...entityProps
  }),
  accountId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    preferences: PropTypes.shape({
      notifications: PropTypes.arrayOf(
        PropTypes.shape({
          group: PropTypes.string.isRequired,
          subGroup: PropTypes.string.isRequired,
          mail: PropTypes.bool,
          app: PropTypes.bool
        })
      )
    }),
    profile: PropTypes.shape({
      first: PropTypes.string,
      last: PropTypes.string
    })
  }),
  security: PropTypes.object
};

export const settingsSectionProps = {
  key: PropTypes.string.isRequired,
  parent: PropTypes.string,
  accessLevel: PropTypes.string,
  template: PropTypes.string.isRequired,
  icon: PropTypes.string,
  ...settingsPageProps
};
