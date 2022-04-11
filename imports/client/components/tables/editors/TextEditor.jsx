import React from "react";
import { Input } from "semantic-ui-react";

const TextEditor = props => {
  return <Input {...props} onChange={e => props.onChange(e.target.value)} />;
};

export default TextEditor;
