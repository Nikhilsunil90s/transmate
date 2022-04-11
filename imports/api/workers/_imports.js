// import "./jobs-get-exchangeRates.js";
import "./edi-jobs-process-pricerequest";
import "./edi-jobs-process-shipment";
import "./edi-jobs-process-method";
import "./jobs-process-events";
import "./customer-specific/numidia-confirm-selected-rate.js";
import "./customer-specific/exact-confirm-selected-rate.js";

// startup or add (cron) jobs at startup:
import "./cronWorkers/startCron.addToSendgridList";
import "./cronWorkers/startCron.notifyExpiringPriceList";
