import React from "react";
import colors from "../lib/colors";
import styled from "react-emotion";
import {ArrowOverlay, SpawnAnchoredOverlay} from "./Overlay";
import {Toggle} from "react-powerplug";
import AutosizeTextarea from "react-textarea-autosize";

const shadows = (col, colShadow, size = 5) =>
  [
    `0 ${size}px ${colShadow}`,
    `0 ${size}px ${size * 2}px ${col}`,
    "0 1px 0 1px rgba(0,0,0,0.2) inset",
  ].join(",");

const focusStyle = size => ({
  outline: "none",
  borderColor: colors.focus,
  boxShadow: shadows(colors.focus, colors.focusShadow, size),
});

const propsBySize = {
  small: (hasError, isFocused) => ({
    padding: "5px 10px 3px",
    borderWidth: 2,
    fontSize: "0.8em",
    boxShadow: shadows("rgba(0,0,0,0.35)", hasError ? colors.dangerDark : colors.dark, 2),
    ...(isFocused && focusStyle(2)),
    ":focus": focusStyle(2),
  }),
  normal: (hasError, isFocused) => ({
    padding: "15px 25px 10px",
    borderWidth: 3,
    fontSize: "1em",
    boxShadow: shadows("rgba(0,0,0,0.35)", hasError ? colors.dangerDark : colors.dark),
    ...(isFocused && focusStyle(5)),
    ":focus": focusStyle(5),
  }),
};

export const inputStyle = ({hasError, isFocused, size = "normal"}) => ({
  width: "100%",
  border: `solid ${hasError ? colors.danger : colors.paleWhite}`,
  backgroundColor: hasError ? colors.dangerPale : colors.white,
  fontFamily: "inherit",
  resize: "none",
  transitionProperty: "border-color, box-shadow, background-color",
  ...propsBySize[size](hasError, isFocused),
  "::placeholder": {
    color: "rgba(0,0,0,0.5)",
  },
});

const StyledInput = styled("input", {
  shouldForwardProp: p => !["hasError", "isFocused", "innerRef"].includes(p),
})(inputStyle);
const StyledTextarea = styled(AutosizeTextarea, {
  shouldForwardProp: p => !["hasError", "isFocused"].includes(p),
})(inputStyle, {
  lineHeight: 1.4,
});

const ErrorMessage = styled("div")({
  fontSize: "0.8em",
  ":not(:last-child)": {
    marginBottom: 5,
  },
});

const renderErrors = ({errors, ...rest}) => (
  <ArrowOverlay
    background={colors.danger}
    color={colors.white}
    contentCss={{width: 250, padding: 15}}
    {...rest}
  >
    {errors.map(e => (
      <ErrorMessage key={e}>{e}</ErrorMessage>
    ))}
  </ArrowOverlay>
);

const offsetBySize = {small: 7, normal: 18};

const ErrorHintComp = styled("div")(({size = "normal"}) => ({
  fontWeight: "bold",
  position: "absolute",
  top: offsetBySize[size],
  right: offsetBySize[size],
  color: colors.danger,
}));

export const ErrorHint = ({errors, forceShow, size}) => (
  <Toggle>
    {({on: isHover, toggle}) => (
      <SpawnAnchoredOverlay
        distanceFromAnchor={15}
        placement="top"
        isOpen={forceShow || isHover}
        renderOverlay={p => renderErrors({errors, ...p})}
      >
        {measureRef => (
          <ErrorHintComp
            size={size}
            innerRef={measureRef}
            onMouseEnter={toggle.on}
            onMouseLeave={toggle.off}
          >
            !
          </ErrorHintComp>
        )}
      </SpawnAnchoredOverlay>
    )}
  </Toggle>
);

class Input extends React.Component {
  state = {
    showError: false,
  };

  handleRef = n => {
    this.n = n;
    if (this.props.innerRef) this.props.innerRef(n);
  };

  handleFocus = e => {
    if (this.props.onFocus) this.props.onFocus(e);
    this.setState({showError: true});
  };

  handleBlur = e => {
    if (this.props.onBlur) this.props.onBlur(e);
    this.setState({showError: false});
  };

  handleChange = e => {
    if (this.props.onChange) this.props.onChange(e);
    this.setState({showError: false});
  };

  render() {
    const {
      errors,
      type,
      size,
      innerRef: _,
      onFocus: _1,
      onBlur: _2,
      onChange: _3,
      ...rest
    } = this.props;
    const props = {
      [type === "textarea" ? "inputRef" : "innerRef"]: this.handleRef,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      onChange: this.handleChange,
      hasError: errors && errors.length > 0,
      size,
      ...rest,
    };
    const {showError} = this.state;

    return (
      <div css={{position: "relative", width: "100%"}}>
        {type === "textarea" ? (
          <StyledTextarea {...props} />
        ) : (
          <StyledInput type={type} {...props} />
        )}
        {errors &&
          errors.length > 0 && <ErrorHint size={size} forceShow={showError} errors={errors} />}
      </div>
    );
  }
}

export default Input;
