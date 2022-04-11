export function toFixed2(num, fixed = 2) {
  return num.toFixed(fixed).replace(/\.00$/, "");
}
