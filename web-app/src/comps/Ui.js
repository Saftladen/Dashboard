import React from "react";
import B from "glamorous";
import {Link} from "react-router-dom";
import col from "./colors";

const FullHeight = B.div({
  display: "flex",
  flexDirection: "column",
  flex: "auto",
  minWidth: 0,
});

const rawButtonStyles = [
  {
    display: "inline-block",
    textAlign: "center",
    width: "auto",
    border: "none",
    lineHeight: 1,
    cursor: "pointer",
    transitionProperty: "background-color, box-shadow, color",
    color: "inherit",
    backgroundColor: "transparent",
    textDecoration: "none",
  },
  ({fullWidth}) => ({
    ...(fullWidth ? {display: "block", width: "100%"} : {}),
  }),
];

const LinkOrButton = props =>
  "to" in props ? <Link {...props} /> : "href" in props ? <a {...props} /> : <button {...props} />;

const IconButton = B(LinkOrButton)(...rawButtonStyles, {
  padding: 10,
  borderRadius: "100%",
  ":hover": {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});

const TextButton = B(LinkOrButton)(...rawButtonStyles, {
  color: col.accent,
  padding: 10,
  borderRadius: 5,
  textTransform: "uppercase",
  ":hover": {
    backgroundColor: "rgba(0,0,0,0.02)",
  },
});

const BorderButton = B(LinkOrButton)(...rawButtonStyles, {
  color: col.accent,
  padding: "15px 25px",
  border: `2px solid ${col.accent}`,
  fontWeight: "bold",
  ":hover": {
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  ":active": {
    backgroundColor: col.accentActive,
    color: "#fff",
  },
});

const FieldLabel = B.label(
  {
    display: "block",
    fontSize: 11,
    marginBottom: 3,
  },
  ({type}) => ({
    ...(type === "select" ? {marginBottom: 8} : null),
  })
);

const sharedInputStyle = [
  {
    padding: "5px 0",
    border: "none",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    width: "100%",
    fontFamily: "inherit",
    fontSize: 15,
    transitionProperty: "border-color",
    ":focus": {
      outline: "none",
      borderBottomColor: col.brand,
    },
  },
];

const Input = B.input(...sharedInputStyle);
const Textarea = B.textarea(...sharedInputStyle, {resize: "vertical"});

const typesToComp = {select: "select", textarea: Textarea};

const Field = ({label, name, onChange, type = "text", ...rest}) =>
  <B.Div marginBottom={20}>
    <FieldLabel htmlFor="name" type={type}>
      {label}
    </FieldLabel>
    {React.createElement(typesToComp[type] || Input, {
      type: typesToComp[type] ? undefined : type,
      name,
      id: name,
      onChange,
      ...rest,
    })}
  </B.Div>;

export default {
  FullHeight,
  IconButton,
  TextButton,
  BorderButton,
  Field,
};
