import React from "react";
import { TextEditor, DropDownEditor, DateEditor, TimeEditor } from "./editors";

const EditableTableCell = props => {
  const {
    disabled,
    options = [],
    onChangeCompleted,
    type = "text",
    row: { original },
    cell: { value: initialValue }
  } = props;

  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => setValue(initialValue), [initialValue]);

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    const shouldCompleteChange = value !== initialValue && typeof onChangeCompleted === "function";
    if (shouldCompleteChange) {
      onChangeCompleted(original, value);
    }
  };

  const onChange = updatedValue => setValue(updatedValue);

  switch (true) {
    case type === "dropdown":
      return (
        <DropDownEditor
          disabled={disabled}
          value={value}
          options={options}
          onChange={onChange}
          onBlur={onBlur}
        />
      );

    case type === "text":
      return <TextEditor disabled={disabled} value={value} onChange={onChange} onBlur={onBlur} />;

    case type === "date":
      return <DateEditor name="date" value={value} onChange={onChange} onBlur={onBlur} />;

    case type === "time":
      return <TimeEditor name="time" value={value} onChange={onChange} onBlur={onBlur} />;

    default:
      return value;
  }
};

EditableTableCell.propsTypes = {
  // todo define types
};

export default EditableTableCell;
