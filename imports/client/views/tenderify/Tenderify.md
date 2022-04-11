# Tenderify

## process steps:

1. create a tenderify document
2. Add a source -> file upload for example
3. Mapping appears in accordion, then:
   - source sheet is selected
   - header definition (cell range is entered)
   - click on Generate -> will generate or rerun mapping data
4. Header mapping
   - all columns are identified and linked to a target column
     - one to one mapping -> field left == field right
     - advanced mapping -> for example if you have header with charge code and underneath it is a multiplier or a currency, this way we capture it in one
5. Value mapping (click rerun to get all values)
   - once the headers are mapped, the values are identified
   - lane, charge, equipment volume and goods definiton can be mapped
   - when a mapping value has changed, the user is prompted to store the changes.
6. when all values are mapped, the user clicks on generate bidding sheet

7. bidding sheet: all lanes and groups are shown with fill out fields
8. after entering in the bidding sheet, an offer can be created in the offer tab
   - versions are kept for each offer that is being generated

## logic behind the bidding sheet

Collections:

- tenders.bids.data.meta:
  - stores information on which columsn to show:
    - left columns: colHeaders
    - right columns: chargeDescriptionsSorted
- tenders.bids.data:
  - stores all data for the grid AND the link to the original cell.
