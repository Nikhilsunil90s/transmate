# Data Import

## workflow

1. CLIENT: file is selected
2. CLIENT: parser function converts the csv rows into array elements
   - options.headers: lists of header keys that can be picked to only return these
   - options.transform: dot.transform object {fromKey:to.Key} transforms columns to (nested) object
   - options.checkRequiredKeys: checks if certain columns are present
   - options.keyField: a column that should be filled in for the "removeEmpty" to work
3. CLIENT: parser function returns the array of data in a callback and calls "dataImport.go" method
4. SERVER: data import method creates import entry in the database
   1. dbInit > store import & get importId
   2. initiateProcess > for each line in the import > start a worker with a directive
   3. return the importId to the client
5. WORKER: runs with directive on each item
6. WORKER: finishes all entries

## UI

The process can be initiated for:

- address - file import redirects to import page
- partner - file import redirects to import page
- invoice - file import renders overview in invoice page

the overview uses a subscription on the import items collection and observes the status changes
the user can see the progress of the worker there
