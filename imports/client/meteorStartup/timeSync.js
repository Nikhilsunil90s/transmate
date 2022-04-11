/* global TimeSync*/

/** prevents the timeSync from loggin on the client */
Meteor.startup(function configureTimeSyncLog() {
  TimeSync.loggingEnabled = false;
});
