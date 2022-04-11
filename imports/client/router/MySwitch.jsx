import React from "react";
import { Switch } from "react-router-dom";
import { regiterPath } from "./routes-helpers";

const MySwitch = ({ children }) => {
  return (
    <Switch>
      {React.Children.map(children, child => {
        const { name, path } = child.props;
        regiterPath(name, path);
        return child;
      })}
    </Switch>
  );
};

export default MySwitch;
