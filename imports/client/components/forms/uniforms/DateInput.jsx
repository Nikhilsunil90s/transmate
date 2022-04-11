/* eslint-disable new-cap */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { DateInput, TimeInput, DateTimeInput } from "semantic-ui-calendar-react";
import classNames from "classnames";
import { connectField } from "uniforms";
import { Form, Icon, Popup } from "semantic-ui-react";
import { getTimezoneOffset } from "../../../../utils/functions/timeConverter";

import "moment/locale/en-gb";

const debug = require("debug")("uniform:datefield");

// https://www.npmjs.com/package/semantic-ui-calendar-react

const DATE_FORMAT = "DD-MM-YYYY";
const TIME_FORMAT = "HH:mm";
const defaultDateTimeformat = "DD-MM-YYYY HH:mm";
const defaultProps = {
  iconPosition: "left",
  animation: "none"
};

const propTypes = {
  value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.object
};

function isValidDate(d) {
  // eslint-disable-next-line no-restricted-globals
  return d instanceof Date && !isNaN(d);
}

function initializeDate(value) {
  if (value instanceof Date) {
    return moment(value)
      .seconds(0)
      .milliseconds(0)
      .toDate();
  }
  if (
    (typeof value === "string" && value.length >= 4) ||
    (typeof value === "number" && value > 0)
  ) {
    return moment(value)
      .seconds(0)
      .milliseconds(0)
      .toDate();
  }
  return moment(value)
    .minute(Math.round(moment(value).minute() / 15) * 15)
    .seconds(0)
    .milliseconds(0)
    .toDate();
}

function convertDateToFormattedString(value, format) {
  let val = value;
  if (val instanceof Date) {
    debug("date val", val);
    val = moment(value)
      .seconds(0)
      .milliseconds(0)
      .format(format);
    debug("date new", val);
  } else if ((typeof val === "string" && val.length >= 4) || (typeof val === "number" && val > 0)) {
    debug("String / number val", val);
    val = new Date(val);
    val = moment(value)
      .seconds(0)
      .milliseconds(0)
      .format(format);
  } else {
    debug("other val", val, new Date(val));
    val = moment(value)
      .seconds(0)
      .milliseconds(0)
      .format(format);

    // if date is empty
  }
  return val;
}

// dates are returned in text form!! -> need to be converted still!
// value is in the same format, default is DD-MM-YYYY

export const dateField = ({
  id,
  required,
  error,
  label,
  value,
  disabled,
  inputRef,
  isPlaceholder,
  onChange
}) => {
  const formatting = DATE_FORMAT;
  const val = convertDateToFormattedString(value, formatting);
  let selectedDateValue;

  return (
    <div className={classNames("field", { required, error, isPlaceholder })}>
      <label htmlFor={id}>{label}</label>
      <DateInput
        {...defaultProps}
        id={id}
        disabled={disabled}
        ref={inputRef}
        required={required}
        clearable
        placeholder={formatting}
        value={val}
        closable
        onKeyDown={event => {
          debug("onKeyDown:", event);
          if (event.key === "Enter") {
            selectedDateValue = event.target.value;
          }
        }}
        onChange={(event, { value: changedValue }) => {
          debug("onChange event:", event);
          debug("date picked", changedValue);
          if (selectedDateValue) {
            // event is enter (disables enter on popup)
            debug("enter press here! overwrite value %o by %o", changedValue, selectedDateValue);
            const d = moment(selectedDateValue, formatting).toDate();
            debug("return typed in date", d);
            onChange(d);
          } else if (typeof changedValue === "string" && changedValue.length >= formatting.length) {
            const d = moment(changedValue, formatting).toDate();
            debug("return date", d);
            onChange(d);
          } else {
            debug("return value", changedValue);
            onChange(changedValue);
          }
        }}
        localization="en-gb"
      />
    </div>
  );
};

dateField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  inputRef: PropTypes.elementType,
  isPlaceholder: PropTypes.bool,
  ...propTypes
};

export const DateField = connectField(dateField);

const timeField = ({
  id,
  required,
  error,
  label,
  value,
  disabled,
  inputRef,
  isPlaceholder,
  onChange
}) => {
  const val = convertDateToFormattedString(value, TIME_FORMAT);

  return (
    <div className={classNames("field", { required, error, isPlaceholder })}>
      <label htmlFor={id}>{label}</label>
      <TimeInput
        {...defaultProps}
        id={id}
        disabled={disabled}
        ref={inputRef}
        required={required}
        value={val}
        placeholder={TIME_FORMAT}
        clearable
        closable
        onChange={(_, { value: changedValue }) => {
          onChange(changedValue);
        }}
      />
    </div>
  );
};

timeField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  inputRef: PropTypes.elementType,
  isPlaceholder: PropTypes.bool,
  ...propTypes
};

export const TimeField = connectField(timeField);

// renders a date and timefield alongside:
// date is a Date
export const dateTimeComboField = ({
  groupLabel,
  dateLabel,
  timeLabel,
  value,
  onChange,
  disabled,
  required,
  error
}) => {
  const [isPlaceholder, setIsPlaceHolder] = useState(!value);
  const [dateVal, setDateVal] = useState(convertDateToFormattedString(value, DATE_FORMAT));
  const [timeVal, setTimeVal] = useState(convertDateToFormattedString(value, TIME_FORMAT));
  const val = value || new Date();
  debug("date+time input", { value, val });

  const afterChangeHandler = (updatedValue, field) => {
    debug("afterchange, %o", { updatedValue, field });
    let d = moment(val);
    if (field === "time") {
      if (updatedValue === "") {
        // reset time
        d.startOf("day");
        setTimeVal("");
      } else {
        const d1 = moment(updatedValue, TIME_FORMAT);
        d = d.hour(d1.get("hour"));
        d = d.minute(d1.get("minutes"));
        setTimeVal(convertDateToFormattedString(d.toDate(), TIME_FORMAT));
      }
    }
    if (field === "date") {
      const d1 = moment(updatedValue, DATE_FORMAT);
      d = d.year(d1.get("year"));
      d = d.month(d1.get("month")); // 0 - 11
      d = d.date(d1.get("date"));

      // reset time to 0 if not set
      if (timeVal === "") d.startOf("day");
      if (updatedValue === "") {
        // reset time
        setDateVal("");
      } else {
        setDateVal(convertDateToFormattedString(d.toDate(), DATE_FORMAT));
      }
    }
    const dateObj = d.toDate();
    debug(dateObj, "is valid?", isValidDate(dateObj));
    if (isValidDate(dateObj)) {
      debug("set fields");
      onChange(dateObj);
    } else {
      debug("reset fields");
      setTimeVal("");
      setDateVal("");
      onChange("");
    }
    debug("result", dateObj);
    setIsPlaceHolder(false);
  };

  return (
    <div className="field dateTime">
      {groupLabel && <label>{groupLabel}</label>}
      <Form.Group>
        <Form.Field width={10} className={classNames("field", { required, error, isPlaceholder })}>
          <label>{dateLabel}</label>
          <DateInput
            {...defaultProps}
            disabled={disabled}
            required={required}
            value={dateVal}
            placeholder={DATE_FORMAT}
            clearable
            closable
            onChange={(_, { value: updatedValue }) => {
              afterChangeHandler(updatedValue, "date");
            }}
            localization="en-gb"
          />
        </Form.Field>
        <Form.Field width={6} className={classNames("field", { required, error, isPlaceholder })}>
          <label>{timeLabel}</label>
          <TimeInput
            {...defaultProps}
            disabled={disabled}
            required={required}
            value={timeVal}
            placeholder={TIME_FORMAT}
            clearable
            closable
            onChange={(_, { value: updatedValue }) => {
              afterChangeHandler(updatedValue, "time");
            }}
          />
        </Form.Field>
      </Form.Group>
    </div>
  );
};

dateTimeComboField.propTypes = {
  groupLabel: PropTypes.string,
  dateLabel: PropTypes.string,
  timeLabel: PropTypes.string,
  ...propTypes
};

export const DateTimeComboField = connectField(dateTimeComboField);

const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const DateTimeComboWithTZ = ({
  groupLabel,
  dateLabel,
  timeLabel,
  disableTimeToggle,
  value,
  id,
  onChange,
  disabled,
  required,
  error,
  locationTimeZone: locationTZ
}) => {
  const hourDiffs = {
    userTZ: getTimezoneOffset(userTZ) / 60,
    locationTZ: locationTZ ? getTimezoneOffset(locationTZ) / 60 : getTimezoneOffset(userTZ) / 60
  };
  const hourDiffBetweenLocalAndUser = hourDiffs.locationTZ - hourDiffs.userTZ;

  const [isPlaceholder, setIsPlaceHolder] = useState(!value);
  const [timeZoneKey, setTimeZoneKey] = useState("locationTZ"); // default to locationTZ
  const [dateValue, setDateValue] = useState(); // takes Date, String or Number
  const canToggleTZ = !disableTimeToggle && !!locationTZ;
  const diffHours = hourDiffs[timeZoneKey]; // hour difference from UTC
  const hoursToAdd = timeZoneKey === "userTZ" ? 0 : hourDiffBetweenLocalAndUser; // for entry || display

  useEffect(() => {
    setDateValue(initializeDate(value));
  }, [value]);

  const toggleTimeZone = () => {
    if (!canToggleTZ) return null;
    if (timeZoneKey === "userTZ") return setTimeZoneKey("locationTZ");
    return setTimeZoneKey("userTZ");
  };

  const afterChangeHandler = (updatedValue, field) => {
    debug("afterchange, %o", { updatedValue, field, TZ: timeZoneKey });
    let d = moment(dateValue).add(hoursToAdd, "hours"); // in selected timeZone
    if (field === "time") {
      if (updatedValue === "") {
        // reset time
        d.startOf("day");
      } else {
        const d1 = moment(updatedValue, TIME_FORMAT);
        d = d.hour(d1.get("hour"));
        d = d.minute(d1.get("minutes"));
      }
    }

    if (field === "date") {
      const d1 = moment(updatedValue, DATE_FORMAT);
      d = d.year(d1.get("year"));
      d = d.month(d1.get("month")); // 0 - 11
      d = d.date(d1.get("date"));

      // reset time to 0 if not set
      // if (timeVal === "") d.startOf("day");

      // TODO:
      // if (updatedValue === "") {
      //   // reset time
      //   setDateVal("");
      // } else {
      //   setDateVal(convertDateToFormattedString(d.toDate(), DATE_FORMAT));
      // }
    }
    const updatedDate = d.add(-hoursToAdd, "hours").toDate(); // back to user TZ
    debug(updatedDate, "is valid?", isValidDate(updatedDate));
    if (isValidDate(updatedDate)) {
      debug("set fields");
      setDateValue(updatedDate);
      onChange(updatedDate);
    } else {
      debug("reset fields");
      onChange("");
    }
    debug("result", updatedDate);
    setIsPlaceHolder(false);
  };

  const displayDate = moment(dateValue)
    .add(hoursToAdd, "hours")
    .format(DATE_FORMAT);
  const displayTime = moment(dateValue)
    .add(hoursToAdd, "hours")
    .format(TIME_FORMAT);

  return (
    <div className="field dateTime" id={id}>
      {groupLabel && <label>{groupLabel}</label>}
      <Form.Group>
        <Form.Field width={8} className={classNames("field", { required, error, isPlaceholder })}>
          <label>{dateLabel}</label>
          <DateInput
            id="dateInput"
            {...defaultProps}
            disabled={disabled}
            required={required}
            value={displayDate} // "DD-MM-YYYY"
            placeholder={DATE_FORMAT}
            clearable
            closable
            onChange={(_, { value: updatedValue }) => {
              afterChangeHandler(updatedValue, "date");
            }}
            localization="en-gb"
          />
        </Form.Field>
        <Form.Field width={5}>
          <label>{timeLabel}</label>
          <TimeInput
            id="timeInput"
            {...defaultProps}
            disabled={disabled}
            required={required}
            value={displayTime} // HH:MM
            placeholder={TIME_FORMAT}
            clearable
            closable
            onChange={(_, { value: updatedValue }) => {
              afterChangeHandler(updatedValue, "time");
            }}
          />
          {/* </Form.Field>
         </Form.Group> */}
        </Form.Field>
        <Form.Field
          width={3}
          style={{ marginLeft: -20 }}
          className={classNames("field timeToggle", { required, error, isPlaceholder })}
        >
          <label>{timeLabel ? "time zone" : null}</label>
          <Popup
            style={{ fontSize: "12px" }}
            disabled={!canToggleTZ}
            content="click to switch between your and location time zone"
            trigger={
              <div
                className="toggleButton"
                as="button"
                onClick={toggleTimeZone}
                style={{
                  overflow: "visible",
                  whiteSpace: "nowrap",
                  cursor: canToggleTZ ? "pointer" : "auto"
                }}
              >
                <Icon name={timeZoneKey === "locationTZ" ? "globe" : "home"} color="blue" />
                {"UTC"}
                {diffHours > 0 ? "+" : "-"}
                {Math.abs(diffHours)}
              </div>
            }
          />
        </Form.Field>
      </Form.Group>
    </div>
  );
};

DateTimeComboWithTZ.propTypes = {
  groupLabel: PropTypes.string,
  dateLabel: PropTypes.string,
  timeLabel: PropTypes.string,
  locationTimeZone: PropTypes.string,
  disableTimeToggle: PropTypes.bool,
  ...propTypes
};

export const DateTimeComboWithTZField = connectField(DateTimeComboWithTZ);

// export const TimeZoneField = ({ groupLabel, selectedAddress, disableTimeToggle }) => {
//   // eslint-disable-next-line new-cap
//   const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
//   const [toggleChange, setToggleChange, toggleRef] = useState(false);

//   // const [timeZone, setTimeZone] = useState(selectedAddress!=null ? selectedAddress:Intl.DateTimeFormat().resolvedOptions().timeZone);
//   const localTimeChange = () => {
//     setToggleChange(!toggleChange);
//     if (toggleRef.current === true) {
//       if (selectedAddress) {
//         setTimeZone(selectedAddress);
//       }
//     }
//     if (toggleRef.current === false) {
//       const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
//       setTimeZone(timeZone);
//     }
//   };

//   return (
//     <div className="field dateTime">
//       {groupLabel && <label>{groupLabel}</label>}
//       <Grid>
//         <Grid.Row>
//           <Grid.Column width={5}>
//             <Popup
//               style={{ fontSize: "12px" }}
//               content="click here to change time zone"
//               trigger={
//                 <div
//                   as="a"
//                   size="medium"
//                   onClick={!disableTimeToggle ? localTimeChange : undefined}
//                 >
//                   <Icon name="globe" color="blue" />
//                   {timeZone}
//                 </div>
//               }
//             />
//           </Grid.Column>
//         </Grid.Row>
//       </Grid>
//     </div>
//   );
// };

// value must be date!
export const DateTimeField = ({
  id,
  required,
  error,
  label,
  value,
  disabled,
  inputRef,
  onChange,
  "data-test": dataTest
}) => {
  const formatting = defaultDateTimeformat;
  debug("dt combo input", { value, formatting });

  // value should be string
  const val = convertDateToFormattedString(value, formatting);
  return (
    <div className={classNames("field", { required, error })}>
      <label htmlFor={id}>{label}</label>
      <DateTimeInput
        {...defaultProps}
        data-test={dataTest}
        id={id}
        disabled={disabled}
        ref={inputRef}
        required={required}
        value={val}
        placeholder={formatting}
        clearable
        preserveViewMode={false}
        closable
        onKeyDown={event => {
          debug("onKeyDown:", event);
          if (event.key === "Enter") {
            // const selectedDateValue = event.target.value;
          }
        }}
        onChange={(event, { value: changedValue }) => {
          debug("onChange event:", event);
          debug("date picked", changedValue);
          if (typeof changedValue === "string" && changedValue.length >= formatting.length) {
            const d = moment(changedValue, formatting)
              .seconds(0)
              .milliseconds(0)
              .toDate();
            debug("return date", d);
            onChange(d);
          } else {
            debug("return value", changedValue);
            onChange(changedValue);
          }
        }}
      />
    </div>
  );
};

DateTimeField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  inputRef: PropTypes.elementType,
  "data-test": PropTypes.string,
  ...propTypes
};

export default connectField(DateTimeField);
