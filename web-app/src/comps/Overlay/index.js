import React from "react";
import {Motion, spring} from "react-motion";
import Portal from "../Portal";
import Position from "./Position";
import FitOnScreen from "./FitOnScreen";
import colors from "../../lib/colors";
import styled from "react-emotion";
import Ui from "../Ui";

const Backdrop = styled("div")({
  position: "fixed",
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
  backgroundColor: "rgba(100, 100, 100, 0.9)",
  zIndex: 20,
});

export const SpawnAnchoredOverlay = ({
  children,
  isOpen,
  renderOverlay,
  backdrop,
  speed = {stiffness: 300, damping: 20},
  ...rest
}) => (
  <Motion style={{presence: spring(isOpen ? 1 : 0, speed)}}>
    {({presence}) => (
      <Position>
        {({zIndex, rect, windowSize, measureRef}) => (
          <Portal renderInPlace={children(measureRef)}>
            {presence !== 0 &&
              rect && (
                <div>
                  {backdrop && <Backdrop style={{zIndex: zIndex + 4, opacity: presence}} />}
                  <FitOnScreen anchorPosition={rect} windowSize={windowSize} {...rest}>
                    {props =>
                      renderOverlay({
                        anchorZIndex: zIndex,
                        presence,
                        isOpen,
                        anchorPosition: rect,
                        ...props,
                      })
                    }
                  </FitOnScreen>
                </div>
              )}
          </Portal>
        )}
      </Position>
    )}
  </Motion>
);

const sharedOverlayStyle = ({zIndex}) => ({
  position: "absolute",
  zIndex: zIndex + 5,
});

const DefaultOverlayStyle = styled("div")(sharedOverlayStyle, {
  boxShadow: "0 3px 10px rgba(0,0,0,0.45), 0 3px rgba(0,0,0,0.3)",
  backgroundColor: colors.white,
  color: colors.dark,
});

export const DefaultOverlay = props => {
  const {
    children,
    style: {opacity, ...restStyle},
    anchorZIndex,
    presence,
    placement,
    measureRef,
    ...restProps
  } = props;

  const xMod = placement === "left" ? 20 : placement === "right" ? -20 : 0;
  const yMod = placement === "top" ? 20 : placement === "bottom" ? -20 : 0;
  return (
    <DefaultOverlayStyle
      zIndex={anchorZIndex}
      style={{
        opacity: opacity * presence,
        transform: `translate3d(${xMod * (1 - presence)}px, ${yMod * (1 - presence)}px, 0)`,
        pointerEvents: presence === 1 ? "initial" : "none",
        ...restStyle,
      }}
      innerRef={measureRef}
      {...restProps}
    >
      {children}
    </DefaultOverlayStyle>
  );
};

const reversePlacement = {top: "bottom", bottom: "top", left: "right", right: "left"};

const ArrowOverlayContainer = styled("div")(sharedOverlayStyle, {
  position: "absolute",
});
const ArrowOverlayContent = styled("div")(({background, color}) => ({
  boxShadow: "0 2px 10px rgba(0,0,0,0.45)",
  backgroundColor: background || colors.white,
  color: color || colors.dark,
  borderRadius: 3,
}));

export const ArrowOverlay = props => {
  const {
    children,
    outlineArrow,
    arrowSize = 10,
    style: {opacity, overflow, ...restStyle},
    anchorZIndex,
    presence,
    placement,
    background,
    color,
    contentCss,
    containerCss,
    measureRef,
    className,
  } = props;

  const xMod = placement === "left" ? 20 : placement === "right" ? -20 : 0;
  const yMod = placement === "top" ? 20 : placement === "bottom" ? -20 : 0;

  return (
    <ArrowOverlayContainer
      zIndex={anchorZIndex}
      css={{pointerEvents: presence === 1 ? "initial" : "none", ...containerCss}}
      style={{
        opacity: opacity * presence,
        transform: `translate3d(${xMod * (1 - presence)}px, ${yMod * (1 - presence)}px, 0)`,
        ...restStyle,
      }}
    >
      <ArrowOverlayContent
        innerRef={measureRef}
        background={background}
        color={color}
        css={{overflow, ...contentCss}}
        className={className}
      >
        {children}
      </ArrowOverlayContent>
      {outlineArrow && (
        <Ui.Arrow
          size={arrowSize + 1}
          color={outlineArrow === true ? "#ddd" : outlineArrow}
          pointTo={reversePlacement[placement]}
          css={{
            top: props.arrowOffsetTop || undefined,
            left: props.arrowOffsetLeft || undefined,
          }}
        />
      )}
      <Ui.Arrow
        size={arrowSize}
        color={background || colors.white}
        pointTo={reversePlacement[placement]}
        css={{
          top: props.arrowOffsetTop || undefined,
          left: props.arrowOffsetLeft || undefined,
        }}
      />
    </ArrowOverlayContainer>
  );
};
