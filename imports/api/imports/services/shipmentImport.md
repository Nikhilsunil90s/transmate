## Shipment import

### workflow:

1. start import in UI (document with id created) - `createShipmentImport`
2. csv upload in UI:
   - All rows will be uploaded with mutation `insertShipmentImportRow`
   - when all is complete, the upload is flagged as complete `importDoneShipmentImport`
3. mapping is loaded:
   - first time `initializeShipmentImportMapping`
     - if the mapping exists on the document (progress.lookup: 100) it returns the mapping
     - if the mapping is not existent, it will look at the `ImportMapping` collection for the same type
     - if historical mapping is found >> use that
     - for each header item that has no historic entry >> it suggests a match based on a fuzzy match
     - it adds 3 sample values for each field
     - saves the mapping in the importDocument and set the progress.lookup: 100
   - each mapping that is done by the user calls `mapShipmentImportHeader` or `mapShipmentImportValue`
     - it will save the mapping to the `ImportMapping` collection for later reference (for that type)
     - it will run the validation check >> to see which fields are wrong
4. processing:

   - triggered by `processShipmentImport`
   - parses the data (will make objects with fields to be sent to the API)
   - starts a worker thread for each object:
   - calls remote API for shipment creation
   - returns results / errors

5. undo

### Mapping types

All mappings are centered around the mapping type key. A mapping key can be created in the UI
