## costs

### calculated

- currency of priceList or cost item
- passed over as cost & currency in the shipment.cost []

### invoiced

- single currency per invoice
-

### shipment cost & invoice comparisson:

- invoice currency -> leading!
- !invoice currency, all costs from priceList in currency XYZ -> show all costs in currency XYZ
- mixed currency in calculation -> convert to target currency of user

## Dates

calculated in order of relevance:

- invoice currency Date
- shipment costParams.currencyDate
- calculated based on actual shipment, planned shipment or creation date
