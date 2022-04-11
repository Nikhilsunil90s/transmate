import PropTypes from "prop-types";

const totalSummaryTypes = PropTypes.shape({
  base: PropTypes.number,
  fuel: PropTypes.number,
  total: PropTypes.number
});

const partnerType = PropTypes.shape({
  _id: PropTypes.string,
  name: PropTypes.string
});

export const tabPropTypes = {
  canEdit: PropTypes.bool,
  onSelectTab: PropTypes.func,
  invoice: PropTypes.shape({
    client: partnerType,
    seller: partnerType,
    date: PropTypes.instanceOf(Date),
    status: PropTypes.string,
    invoiceCurrency: PropTypes.string,
    number: PropTypes.string,
    partnerId: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    shipments: PropTypes.array,
    totals: PropTypes.shape({
      delta: PropTypes.number,
      dateMismatch: PropTypes.number,
      invHasCostCount: PropTypes.number,
      shipCount: PropTypes.number,
      shipHasCostCount: PropTypes.number,
      largeDeltaCount: PropTypes.number,
      shipment: totalSummaryTypes,
      invoice: totalSummaryTypes
    })
  }),
  invoiceId: PropTypes.string,
  loading: PropTypes.bool,
  refetch: PropTypes.func
};
