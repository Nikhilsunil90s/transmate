import { toast } from "react-toastify";

const TIME_OUT = 15000;

export function generateMessage({ priceRequestId, errors = [], validItems }) {
  const noItems = errors.filter(err => err.issue === "noItems");
  const notFound = errors.filter(err => err.issue === "notFound");
  const hasPriceRequest = errors.filter(err => err.issue === "hasPriceRequest");
  const wrongStatus = errors.filter(err => err.issue === "wrongStatus");

  let msg = "";
  msg += priceRequestId
    ? "Price request created <br>"
    : "Price request not created <br>";

  if (validItems.length > 0) {
    msg += `added <b>${validItems.length}</b> <br><br>`;
  }

  [
    [noItems, "Shipment without items"],
    [notFound, "Shipment not found"],
    [hasPriceRequest, "Shipment already linked to priceRequest"],
    [wrongStatus, "Shipments not in draft status"]
  ].forEach(([ids, txt]) => {
    if (ids.length > 0) {
      msg += `${txt}: <br>`;
      msg += "<ul>";
      ids.forEach(({ number, shipmentId }) => {
        msg += `<li>${number || shipmentId}</li>`;
      });
      msg += "</ul> <br>";
    }
  });

  if (priceRequestId) {
    toast.info(msg, { onRouteClose: false, timeout: TIME_OUT });
  } else {
    toast.error(msg, { onRouteClose: false, timeout: TIME_OUT });
  }

  return { type: priceRequestId ? "success" : "error", message: msg };
}
