import PropTypes from "prop-types";

const fromToPropType = PropTypes.shape({
  cc: PropTypes.string,
  zip: PropTypes.zip
});

const calculationsPropType = PropTypes.shape({
  priceList: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    carrier: PropTypes.string
  }),
  calculation: PropTypes.arrayOf(PropTypes.number)
});

export const lanePropType = PropTypes.shape({
  from: fromToPropType,
  to: fromToPropType,
  calculations: PropTypes.arrayOf(calculationsPropType),
  switchPointCount: PropTypes.number,
  switchPoints: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      from: PropTypes.number,
      to: PropTypes.number,
      priceList: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        carrier: PropTypes.string
      })
    })
  )
});

export const switchPointPropType = PropTypes.shape({
  id: PropTypes.string,
  analysisId: PropTypes.string,
  name: PropTypes.string,
  accountId: PropTypes.string,
  created: PropTypes.shape({
    by: PropTypes.string,
    at: PropTypes.instanceOf(Date)
  }),
  params: PropTypes.shape({
    max: PropTypes.number,
    uom: PropTypes.string,
    currency: PropTypes.string
  }),
  intervals: PropTypes.arrayOf(String),
  priceListIds: PropTypes.arrayOf(String),
  lanes: PropTypes.arrayOf(lanePropType)
});
