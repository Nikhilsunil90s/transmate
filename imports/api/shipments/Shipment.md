## Shipment

### About

Shipment is a move from goods between A and B.

### Creation

add documentation here

### Shipment Request

Shipments can be requested. This means that a user with a lower access role can request a shipment to be executed.
note: this can be even done for a different account >> Tenderify requests.

** worfklow in a request: **

1. lane tab: from, to and dates are entered
2. lane tab is submitted, in the background a shipment is created, the UI receives a shipmentId and some fields of the shipment object
3. item tab: user adds items
4. reference tab: user adds references & submits
   - additional requestor information can be asked in this step, but we can assume that the context is known
5. submitting the request places the shipment in the right status and triggers a notification for a planner to follow up;
   - additional settings can be added later (e.g. automatic calculation of costs)
6. requestor gets acknowledgement screen for request with the number / link
7. requestor can follow up the shipment in the shipment page.

** what is important: **

- we must make sure that the accountId is set to the party that will plan the shipment.
- when a request is created, a request object is added in the shipment doc
  - store date of request
  - store some meta information of requestor
- planners will need to be able to see which shipments are a request
- planners will need to be able to decline a request??

- submitted requests are not editable anymore ??
