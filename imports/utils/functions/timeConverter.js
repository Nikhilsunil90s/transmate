import moment from "moment";

export const getTimezoneOffset = (timeZone = "UTC", date = new Date()) => {
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const offset = tzDate.getTime() - utcDate.getTime();
  const minutes = offset / 60000;

  return minutes;
};

export const convertTimeZone = (currentTime, currentOffset, changeToOffset) => {
  // todo : check server logic. offset seems to depend on the server settings.
  const offsetBetween = changeToOffset - currentOffset;
  const date = moment(currentTime);
  const changedDate = date.add({ minutes: offsetBetween });
  return changedDate;
};

export const convertUtcTime = (currentTime, currentOffset) => {
  const date = moment.utc(currentTime);
  const changedDate = date
    .add({ minutes: currentOffset })
    .format("MM/DD/YYYY HH:mm");
  return changedDate;
};
