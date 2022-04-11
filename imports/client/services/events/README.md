Use eventemitter3 to send events when something is searched in the header search area.

```javascript
import { Emitter, Events } from "/imports/client/services/events";

Emitter.emit(Events.TABLE_BAR_SEARCH, { `the params` });
```

There are currentrly three types of `Events`:

`TOP_BAR_SEARCH` used from the general search
`TABLE_BAR_SEARCH` used for the price list and price request lists
`TOGGLE_SIDE_PANEL` used to toggle the sidepanel from within components

To use in react, add it in a `useEffect` and catch the event that something has been searched, also you need to return a "cleanup" function where you do `Emitter.off`:

```javascript
useEffect(() => {
  Emitter.on(Events.TOP_BAR_SEARCH, (`the params`) => {
    // do something with the params
  });
  return () => Emitter.off(Events.TOP_BAR_SEARCH);
});
```
