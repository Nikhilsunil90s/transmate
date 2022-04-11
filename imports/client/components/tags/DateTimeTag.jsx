import React from "react";

/*
{
  weekday: 'narrow' | 'short' | 'long',
  era: 'narrow' | 'short' | 'long',
  year: 'numeric' | '2-digit',
  month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
  day: 'numeric' | '2-digit',
  hour: 'numeric' | '2-digit',
  minute: 'numeric' | '2-digit',
  second: 'numeric' | '2-digit',
  timeZoneName: 'short' | 'long',

  // Time zone to express it in
  timeZone: 'Asia/Shanghai',
  // Force 12-hour or 24-hour
  hour12: true | false,
}

OR 
{
  dateStyle: 'full',  // full, long, medium, short
  timeStyle: 'long'
}
*/

const DEFAULT_DATE_OPTIONS = {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit"
};

const DEFAULT_TIME_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit"
};

export const DateTimeTag = ({ date = new Date(), options = {} }) => {
  return new Intl.DateTimeFormat("default", {
    ...DEFAULT_DATE_OPTIONS,
    ...DEFAULT_TIME_OPTIONS,
    ...options
  }).format(date);
};

export const DateTag = ({ date = new Date(), options = {} }) => {
  return (
    <>
      {new Intl.DateTimeFormat("default", {
        ...DEFAULT_DATE_OPTIONS,
        ...options
      }).format(date)}
    </>
  );
};

export const TimeTag = ({ date = new Date(), options = {} }) => {
  return new Intl.DateTimeFormat("default", {
    ...DEFAULT_TIME_OPTIONS,
    ...options
  }).format(date);
};

export default DateTimeTag;
