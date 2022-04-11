export default function round(v, decimals = 0) {
  if (typeof v !== "undefined") {
    return Math.round(v * 10 ** decimals) / 10 ** decimals;
  }
  return " - ";
}
