const soap = require("soap");
const format = require("xml-formatter");
const { lookup } = require("country-data");
const debug = require("debug")("dhl:base");
const fs = require("fs");

function wsdlRequest(wsdlUrl, method, auth, req) {
  return new Promise((resolve, reject) => {
    const res = {};
    soap.createClient(wsdlUrl, (err, client) => {
      if (auth.username === undefined) {
        throw Error("No username specified");
      }

      if (auth.password === undefined) {
        throw Error("No password specified");
      }

      if (auth.accountNumber === undefined) {
        throw Error("No accountNumber specified");
      }

      if (![true, false].includes(auth.sandbox)) {
        throw Error("No sandbox setting specified");
      }

      const wsSecurity = new soap.WSSecurity(auth.username, auth.password);
      client.setSecurity(wsSecurity);

      client.on("response", responseXml => {
        res.responseXml = responseXml;
        debug(
          "dhl response",
          responseXml ? (responseXml.slice(0, 100), "...") : "No response"
        );
      });

      let clientMethod = client[method];
      if (method === "PickUpRequest") {
        clientMethod =
          clientMethod.euExpressRateBook_providerServices_PickUpRequest_Port
            .PickUpRequest;
      }

      clientMethod(req, (err, response) => {
        if (err) {
          reject(err);
        }
        res.response = response;
        resolve(res);
      });

      res.requestXml = format(client.lastRequest);
      if (process.env.DEBUG_DHL && method === "createShipmentRequest") {
        fs.writeFileSync(
          `imports/api/shipmentPicking/services/DHL/testing/${new Date().getTime()}.xml`,
          res.requestXml
        );
      }
      debug(
        "dhl method %o request %o res %s to wsdlUrl %o",
        method,
        req,
        client.lastRequest,
        wsdlUrl
      );
    });
  });
}

function getDhlUrl({ sandbox }) {
  const urlPrefix = sandbox
    ? "https://wsbexpress.dhl.com/sndpt" // test env
    : "https://wsbexpress.dhl.com/gbl";

  return {
    urlPrefix,
    expressRateBookUrl: `${urlPrefix}/expressRateBook?WSDL`
  };
}
module.exports = {
  rateRequest(auth, req) {
    return wsdlRequest(
      getDhlUrl(auth).expressRateBookUrl,
      "getRateRequest",
      auth,
      req
    );
  },
  requestPickup(auth, req) {
    return wsdlRequest(
      `${getDhlUrl(auth).urlPrefix}/requestPickup?WSDL`,
      "PickUpRequest",
      auth,
      req
    );
  },
  shipmentRequest(auth, req) {
    return wsdlRequest(
      getDhlUrl(auth).expressRateBookUrl,
      "createShipmentRequest",
      auth,
      req
    );
  },
  trackingRequest(auth, req) {
    return wsdlRequest(
      `${getDhlUrl(auth).urlPrefix}/glDHLExpressTrack?WSDL`,
      "trackShipmentRequest",
      auth,
      req
    );
  },

  getIsoDateTime() {
    return new Date().toISOString();
  },
  getIsoDateTimeGmt(dateParam) {
    const date =
      dateParam ||
      new Date(new Date().setTime(new Date().getTime() + 1000 * 60)); // date 1 minute in future

    // const offset = date.getTimezoneOffset(); // on server this gives wrong result, no local time on server
    // const offsetAbs = Math.abs(offset);
    // const offsetSign = offset / offsetAbs;
    const offsetSignChar = "+"; // offsetSign > 0 ? "-" : "+";
    const offsetHoursAbs = 0; // Math.floor(offsetAbs / 60);
    const offsetMinutesAbs = 0; // offsetAbs % 60;
    const result = `${date.getUTCFullYear()}-\
${(date.getUTCMonth() + 1).toString().padStart(2, 0)}-\
${date
  .getUTCDate()
  .toString()
  .padStart(2, 0)}T\
${date
  .getUTCHours()
  .toString()
  .padStart(2, 0)}:\
${date
  .getUTCMinutes()
  .toString()
  .padStart(2, 0)}:\
${date
  .getUTCSeconds()
  .toString()
  .padStart(2, 0)}GMT\
${offsetSignChar}\
${offsetHoursAbs.toString().padStart(2, 0)}:\
${offsetMinutesAbs.toString().padStart(2, 0)}`;
    debug("gmt time %s", result);
    return result;
  },
  getMessageReference() {
    return Array(32)
      .fill(0)
      .map(() =>
        Math.random()
          .toString(36)
          .charAt(2)
      )
      .join("");
  },
  countryToCode(country) {
    if (country === "Vietnam") {
      // eslint-disable-next-line no-param-reassign
      country = "Viet Nam";
    }
    return lookup.countries({ name: country })[0].alpha2;
  }
};
