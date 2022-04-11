# unified bidding sheet

- The collection `tender.bids.data.meta` holds the column definitions of the UBS.
- The collection `tender.bids.data` holds the Row data of the UBS.

Note: the `tender.bids.data` collection holds too much info to pull to the client
(original cell information, sheet information, mapping. etc). Therefore this is projected in the client query!!

## data fetching & assembly

The query `getTenderBidDataGrid` returns:

- data - an aray of the rowData (this is projected!! so the key value {\[headerDef.cKey\]: value});
- stats - some counts (especially useful if we do server side filtering);
- headerDefs - holds the information of the header (key, label, ...)

The account level holds settings data:

- mappingKeys - holds all possible fields of the UBS (to what can be mapped)
- mappingListOptions - holds all data for dropdowns (e.g. multiplier list \[pal, kg, m3, ...\])

The Sheet render is:

1. Taking in the headerDefs information of the `getTenderBidDataGrid` query
2. Taking in the settings > mappingKeys (e.g. if something is a dropdown should be here..)
3. Merge both query data with the settings data
4. the column definition pulls in the gridColToTypeDef that sets renderers and cell properties\

columns type to cellType map:

| cType             | cellType                                  |
| ----------------- | ----------------------------------------- |
| fillOut           | fillOutCell (if key chargeDescription)    |
| fillOut           | numeric (if type !== list )               |
| fillOut           | list (if type === list )                  |
| calculationCharge | fillOutCell + calculationCell             |
| statistics        | static + percentvalue (if key allocation) |
| statistics        | static + currencyValue                    |
| col               | static                                    |
| static            | static                                    |
