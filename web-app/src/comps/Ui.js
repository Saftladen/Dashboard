import React from "react";
import styled from "react-emotion";
import {Link} from "react-router-dom";
import col from "./colors";

const FullHeight = styled("div")({
  display: "flex",
  flexDirection: "column",
  flex: "auto",
  minWidth: 0,
});

const rawButtonStyles = [
  {
    display: "block",
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

/* eslint-disable jsx-a11y/anchor-has-content */
const LinkOrButton = props =>
  "to" in props ? <Link {...props} /> : "href" in props ? <a {...props} /> : <button {...props} />;

const RawButton = styled(LinkOrButton)(...rawButtonStyles, {
  ":hover": {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

const IconButton = styled(LinkOrButton)(...rawButtonStyles, {
  padding: 10,
  borderRadius: "100%",
  ":hover": {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

const TextButton = styled(LinkOrButton)(...rawButtonStyles, {
  color: col.accent,
  padding: 10,
  borderRadius: 5,
  textTransform: "uppercase",
  ":hover": {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

const BorderButton = styled(LinkOrButton)(...rawButtonStyles, {
  color: col.accent,
  padding: "15px 25px",
  border: `2px solid ${col.accent}`,
  fontWeight: "bold",
  ":hover": {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  ":active": {
    backgroundColor: col.accentActive,
    color: "#fff",
  },
});

const FullButton = styled(LinkOrButton)(...rawButtonStyles, {
  backgroundColor: col.accent,
  color: "#fff",
  padding: "15px 25px",
  fontWeight: "bold",
  fontSize: "1rem",
  ":hover": {
    backgroundColor: "#fff",
    color: col.accent,
  },
});

const FieldLabel = styled("label")({
  display: "block",
  fontSize: "0.8rem",
  marginBottom: "0.2rem",
}, ({type}) => ({
  ...(type === "select" ? {marginBottom: "0.4rem"} : null),
}));

const sharedInputStyle = {
  backgroundColor: "#fff",
  padding: "0.5rem 0.75rem",
  border: "none",
  width: "100%",
  fontFamily: "inherit",
  fontSize: "1rem",
  transitionProperty: "border-color",
  ":focus": {
    outline: "none",
    borderBottomColor: col.brand,
  },
};

const Input = styled("input")(sharedInputStyle);
const Textarea = styled("textarea")(sharedInputStyle, {resize: "vertical"});

const typesToComp = {select: "select", textarea: Textarea};

const Field = ({label, name, onChange, type = "text", ...rest}) => (
  <div css={{
    marginBottom: "2rem"
  }}>
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
  </div>
);

const H1 = styled("h1")({
  fontSize: "2rem",
  marginBottom: "1rem",
});

const H2 = styled("h2")({
  fontSize: "1.5rem",
  marginBottom: "1rem",
});

export default {
  FullHeight,
  IconButton,
  TextButton,
  BorderButton,
  FullButton,
  Field,
  RawButton,
  H1,
  H2,
};
