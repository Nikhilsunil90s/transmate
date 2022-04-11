const DEFAULT_OPTIONS = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: false,
  timeZoneName: "short"

  // weekday: "short" // prints day name
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
export function formatDateWithTimeZone(
  date,
  timeZone = "Europe/Brussels",
  options = {},
  locale = "en-GB"
) {
  return new Intl.DateTimeFormat(locale, {
    ...DEFAULT_OPTIONS,
    timeZone,
    ...options
  }).format(date);
}
