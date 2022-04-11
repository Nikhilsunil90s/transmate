import React from "react";
import { connectField } from "uniforms";
import { AutoField } from "uniforms-semantic";

const ListItem = ({ children = <AutoField label={null} name="" /> }) => <>{children}</>;

export default connectField(ListItem, { initialValue: false });
