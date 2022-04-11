export default function leadTimeDays(leadTime = 0) {
  return Math.round(((leadTime / 24) * 10) / 10);
}
