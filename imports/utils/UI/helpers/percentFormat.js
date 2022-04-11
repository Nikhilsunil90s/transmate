export default function percentFormat(v, decimals = 0) {
  if (typeof v !== "undefined") {
    return `${Math.round((v * 10 ** (2 + decimals)) / 10 ** decimals)}%`;
  }
  return " - ";
}
