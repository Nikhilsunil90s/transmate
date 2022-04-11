This sets the notification array in the shipment for each user according to their preferences:

shipment -> partner -> users -> preferences
by default they are on. ONLY when the user has flagged to be FALSE the notification will not be sent.

the date the notification is intended to be sent is stored in the notifications array
a cron job executes the message

-> notification array stores when and what needs to be notified...
-> on partner change -> users and preferences are looked up
-> on a change that has a relevant field -> dates are updated

-> cron job executes and flags complete

## workflow

1. change / update / partner modification
2. get user settings

| notification | set on |
| shipment-alert-will-load |

### triggers

- srv.setAfterCreation()

  - mutation.copyShipment() -> add owner users notification items
  - mutation.createShipment() -> add owner users notification items

- srv.setAfterPartnerUpdate()

  - mutation.updatePartners() -> add partner users notification items

- srv.removeNotificationsForAccounts()

  - mutation.updatePartners() -> remove partner users notification items
  - mutation.resetShipmentCosts() -> remove partner users notification items

- srv.setAfterCarrierAssignment()

  - mutation.selectCarrier() -> add partner users notification items
  - ?? stage -> manual selection of carrier -> modify??

- srv.updateAfterShipmentChange()

  - mutation.updateStage() > if dates change -> update the timeStamps in open notification items

- srv.getAndFlag()

  - get notification and set them as processed (send = new Date() ), is used in processNotifications

- srv.processNotifications
  - process notifications

## get notifications to do by cron hourly

- query all shipments with a notification key and where :
  - sendAt < now()
  - sent does not exists
  - updated.at is at least 15 min old (to make sure there are no updates happening on the shipment)

## testing

- you can set key to (make sure to take correct date in sendAt):
  - `{ $set : { "notifications" : [ { "key" : "shipment-alert-will-load", "role" : "carrier", "accountId" : "C64742", "userId" : "KQPsSHoRvbnGDTAF8", "sendAt" : ISODate("2021-02-02T11:00:00.000+0000"), "app" : true, "mail" : true }, ] } }`
