export default function currencyFormat(number, c) {
  if (typeof number === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c || "EUR"
    }).format(number);
  }
  return " - ";
}
