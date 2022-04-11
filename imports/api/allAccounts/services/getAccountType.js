export function getType({ accountId }) {
  const firstLetter = (accountId || "").substr(0, 1);
  switch (firstLetter) {
    case "S":
      return "shipper";
    case "C":
      return "carrier";
    case "P":
      return "provider";
    default:
      return "unknown";
  }
}
