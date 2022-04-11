# class hierarchy

For UI rendering:

1. PriceListGridSheet (AG grid render)
2. PriceListComp
3. PriceListUIData ->
4. PriceListUICore

- fn initializePageFilters
- fn buildStructure
  - fn for each headerField -> set attributes
  - class BuildHeaderData
- fn initializeData
  - create [[]] with empty data & headers
- fn getData
  - gets

For exporting:

1. PriceListExport - loads for each page the next class:
2. PriceListExportGenerator - generates page structure & data
3. PriceListUICore

# data building steps:

1. based on the price list doc:
   - [fn initializePageFilters] pagefilter is determined (has impact on headers & data fetch)
   - [fn buildStructure] the grid structure is built
     - determine headers & header fields
       - build keys
       - set labels
       - set data if it is available (e.g. for attr data, based on other columns)
   - [fn initializeData]
     - creates base [[]] where each cell data is stored

2) data load

   - [fn getData]
     - based on pageFilter -> perform db query
     - fills in base [[]] based on the keys and the rules array in the rate documents
     - checks if column data can be attributed based on loaded cell data.

3) React component
   - translate base [[]] back to ui
   - cell component:
     - PriceListGridSheetCellEditor -> based on

# template (structure) options

template definition can be either:

1. template name = [ 'road', 'ocean', 'air'] -> lookup from default structure
2. template is an object that holds the structure
3. template is a an object that is the derived structure (no unwinds etc. needed)
