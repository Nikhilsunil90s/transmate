## shipment dates

initialy the dates were pulled from the stages (where you have much more combinations than is actually used).
We moved the most important dates to the shipments in a denormalization effort. This allows the shipment view
to be filtered faster (as we do not need to pull in the stages anymore)
the table below shows the available dates and the corresponding normalized field
the aggregation query should project the fields in the dates {}

| viewPath                                   | denormalized                    | filter |
| ------------------------------------------ | ------------------------------- | ------ |
| "dates.pickup-arrival-planned.value"       | "shipment.pickup.datePlanned"   | x      |
| "dates.pickup-arrival-scheduled.value"     | -                               | -      |
| "dates.pickup-arrival-actual.value"        | "shipment.pickup.dateActual"    | -      |
| "dates.pickup-start-planned.value"         | -                               | -      |
| "dates.pickup-start-scheduled.value"       | -                               | -      |
| "dates.pickup-start-actual.value"          | -                               | -      |
| "dates.pickup-end-planned.value"           | -                               | -      |
| "dates.pickup-end-scheduled.value"         | -                               | -      |
| "dates.pickup-end-actual.value"            | -                               | -      |
| "dates.pickup-documents-planned.value"     | -                               | -      |
| "dates.pickup-documents-scheduled.value"   | -                               | -      |
| "dates.pickup-documents-actual.value"      | -                               | -      |
| "dates.pickup-departure-planned.value"     | -                               | -      |
| "dates.pickup-departure-scheduled.value"   | -                               | -      |
| "dates.pickup-departure-actual.value"      | -                               | -      |
| "dates.delivery-arrival-planned.value"     | "shipment.delivery.datePlanned" | x      |
| "dates.delivery-arrival-scheduled.value"   | -                               | -      |
| "dates.delivery-arrival-actual.value"      | "shipment.delivery.dateActual"  | -      |
| "dates.delivery-start-planned.value"       | -                               | -      |
| "dates.delivery-start-scheduled.value"     | -                               | -      |
| "dates.delivery-start-actual.value"        | -                               | -      |
| "dates.delivery-end-planned.value"         | -                               | -      |
| "dates.delivery-end-scheduled.value"       | -                               | -      |
| "dates.delivery-end-actual.value"          | -                               | -      |
| "dates.delivery-documents-planned.value"   | -                               | -      |
| "dates.delivery-documents-scheduled.value" | -                               | -      |
| "dates.delivery-documents-actual.value"    | -                               | -      |
| "dates.delivery-departure-planned.value"   | -                               | -      |
| "dates.delivery-departure-scheduled.value" | -                               | -      |
| "dates.delivery-departure-actual.value"    | -                               | -      |
