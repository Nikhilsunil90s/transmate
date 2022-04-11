/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */
import React from "react";
import ReactDOM from "react-dom";
import { Icon } from "semantic-ui-react";

export const Button = React.forwardRef(({ className, active, reversed, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    style={{
      cursor: "pointer",
      color: reversed ? (active ? "white" : "#aaa") : active ? "black" : "#ccc"
    }}
    className={className}
  />
));

export const EditorValue = React.forwardRef(({ className, value, ...props }, ref) => {
  const textLines = value.document.nodes
    .map(node => node.text)
    .toArray()
    .join("\n");
  return (
    <div
      ref={ref}
      {...props}
      className={className}
      style={{
        margin: "30px -20px 0"
      }}
    >
      <div
        className={className}
        style={{
          fontSize: "14px",
          padding: "5px 20px",
          color: "#404040",
          borderTop: "2px solid #eeeeee",
          background: "#f8f8f8"
        }}
      >
        Slate&apos;s value as text
      </div>
      <div
        className={className}
        style={{
          color: "#404040",
          font: "12px monospace",
          whiteSpace: "pre-wrap",
          padding: "10px 20px"
        }}
      >
        {textLines}
      </div>
    </div>
  );
});

export const RTIcon = React.forwardRef(({ icon }, ref) => <Icon name={icon} ref={ref} />);

export const Instruction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={className}
    style={{
      whiteSpace: "pre-wrap",
      margin: "0 -20px 10px",
      padding: "10px 20px",
      fontSize: "14px",
      background: "#f8f8e8"
    }}
  />
));

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div {...props} ref={ref} className={className} style={{}} />
));

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
  <Menu
    {...props}
    ref={ref}
    className={className}
    style={{
      position: "relative",
      padding: "1px 18px 17px",
      margin: "0 -20px",
      borderBottom: "2px solid #eee",
      marginBottom: "20px"
    }}
  />
));
