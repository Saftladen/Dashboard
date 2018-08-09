import React from "react";
import Measure from "react-measure";
import maxBy from "lodash/maxBy";
import shallowEqual from "fbjs/lib/shallowEqual";

function getTopDelta(top, overlayHeight, viewportMargin, windowSize) {
  const topEdgeOffset = top - (window.pageYOffset || document.body.scrollTop) - viewportMargin;
  const bottomEdgeOffset =
    top + overlayHeight - (window.pageYOffset || document.body.scrollTop) + viewportMargin;

  let hug = null,
    delta = 0;
  if (bottomEdgeOffset > windowSize.height) {
    hug = "bottom";
    delta = windowSize.height - bottomEdgeOffset;
  }
  if (topEdgeOffset < 0) {
    hug = hug ? "both" : "left";
    delta = -topEdgeOffset;
  }
  return hug ? {hug, delta} : null;
}

function getLeftDelta(left, overlayWidth, viewportMargin, windowSize) {
  const leftEdgeOffset = left - viewportMargin;
  const rightEdgeOffset = left + overlayWidth + viewportMargin;
  let hug = null,
    delta = 0;
  if (rightEdgeOffset > windowSize.width) {
    hug = "right";
    delta = windowSize.width - rightEdgeOffset;
  }
  if (leftEdgeOffset < 0) {
    hug = hug ? "both" : "left";
    delta = -leftEdgeOffset;
  }
  return hug ? {hug, delta} : null;
}

const nextPlacement = {top: "right", right: "bottom", bottom: "left", left: "top"};

function calcOverlayPosition(
  preferredPlacement,
  overlayWidth,
  overlayHeight,
  anchorRect,
  windowSize,
  distanceFromAnchor,
  forcePlacement,
  viewportMargin,
  anchorAlignment
) {
  if (overlayHeight === undefined) throw new Error("overlayHeight is undefined");
  const scores = [];

  let currentPlacement = preferredPlacement;
  let currentScore;
  const anchorHeight = anchorRect.bottom - anchorRect.top;
  const anchorWidth = anchorRect.right - anchorRect.left;

  while (scores.length < 4) {
    switch (currentPlacement) {
      case "top":
        currentScore = (anchorRect.top - viewportMargin - distanceFromAnchor) / overlayHeight;
        break;
      case "right":
        currentScore =
          (windowSize.width - (anchorRect.right + viewportMargin + distanceFromAnchor)) /
          overlayWidth;
        break;
      case "bottom":
        currentScore =
          (windowSize.height - (anchorRect.bottom + viewportMargin + distanceFromAnchor)) /
          overlayHeight;
        break;
      case "left":
        currentScore = (anchorRect.left - viewportMargin - distanceFromAnchor) / overlayWidth;
        break;
      default:
        throw new Error(`Dunno: ${currentPlacement}`);
    }
    // currentScore >= 1 -> has enough space
    if (currentScore >= 1 || forcePlacement) break;
    scores.push({placement: currentPlacement, score: currentScore});
    currentPlacement = nextPlacement[currentPlacement];
  }
  if (scores.length === 4) {
    currentPlacement = maxBy(scores, "score").placement;
  }

  let positionLeft;
  let positionTop;
  let positionRight;
  let positionBottom;
  let arrowOffsetTop;
  let arrowOffsetLeft;
  let maxWidth;
  let maxHeight;

  const shrinkedHeight = Math.min(windowSize.height - 2 * viewportMargin, overlayHeight);
  const shrinkedWidth = Math.min(windowSize.width - 2 * viewportMargin, overlayWidth);

  if (currentPlacement === "left" || currentPlacement === "right") {
    if (overlayHeight >= windowSize.height - viewportMargin * 2) {
      maxHeight = windowSize.height - viewportMargin * 2;
    }
    positionTop = anchorRect.top + (anchorHeight - shrinkedHeight) / 2;
    const topDelta = getTopDelta(positionTop, shrinkedHeight, viewportMargin, windowSize);
    if (topDelta) {
      if (topDelta.hug === "bottom") {
        positionTop = undefined;
        positionBottom = viewportMargin;
      } else {
        positionTop += topDelta.delta;
      }
    }
    arrowOffsetTop = `${Math.min(
      98,
      Math.max(2, 50 * (1 - 2 * (topDelta ? topDelta.delta : 0) / shrinkedHeight))
    )}%`;

    if (currentPlacement === "right") {
      positionLeft = anchorRect.right + distanceFromAnchor;
      maxWidth = windowSize.width - (anchorRect.right + viewportMargin + distanceFromAnchor);
    } else {
      // currentPlacement === "left"
      maxWidth = anchorRect.left - viewportMargin - distanceFromAnchor;
      positionRight = windowSize.width - anchorRect.left + distanceFromAnchor;
    }
  } else {
    // currentPlacement === "top" || currentPlacement === "bottom"
    if (overlayWidth >= windowSize.width - viewportMargin * 2) {
      maxWidth = windowSize.width - viewportMargin * 2;
    }
    positionLeft =
      anchorAlignment === "middle"
        ? anchorRect.left + (anchorWidth - shrinkedWidth) / 2
        : anchorRect.left + (anchorWidth - shrinkedWidth);

    const leftDelta = getLeftDelta(positionLeft, shrinkedWidth, viewportMargin, windowSize);
    if (leftDelta) {
      if (leftDelta.hug === "right") {
        positionLeft = undefined;
        positionRight = viewportMargin;
      } else {
        positionLeft += leftDelta.delta;
      }
    }
    arrowOffsetLeft = `${Math.min(
      98,
      Math.max(2, 50 * (1 - 2 * ((leftDelta ? leftDelta.delta : 0) / shrinkedWidth)))
    )}%`;
    if (currentPlacement === "bottom") {
      positionTop = anchorRect.bottom + distanceFromAnchor;
      maxHeight = windowSize.height - (anchorRect.bottom + viewportMargin + distanceFromAnchor);
    } else {
      maxHeight = anchorRect.top - viewportMargin - distanceFromAnchor;
      positionBottom = windowSize.height - anchorRect.top + distanceFromAnchor;
    }
  }

  let transformOrigin = null;
  switch (currentPlacement) {
    case "top":
      transformOrigin = `${arrowOffsetLeft} 100%`;
      break;
    case "right":
      transformOrigin = `${arrowOffsetLeft} 100%`;
      break;
    case "bottom":
      transformOrigin = `${arrowOffsetLeft} ${distanceFromAnchor}px`;
      break;
    case "left":
      transformOrigin = `${arrowOffsetLeft} 100%`;
      break;
    default:
      throw new Error(`Dunno: ${currentPlacement}`);
  }

  return {
    positionLeft,
    positionRight,
    positionTop,
    positionBottom,
    arrowOffsetLeft,
    arrowOffsetTop,
    placement: currentPlacement,
    transformOrigin,
    maxWidth,
    maxHeight,
  };
}

class FitOnScreenInner extends React.Component {
  static defaultProps = {
    placement: "top",
    viewportMargin: 15,
    forcePlacement: false,
    distanceFromAnchor: 0,
    anchorAlignment: "middle",
  };

  constructor(props) {
    super(props);
    const {
      placement,
      anchorPosition,
      forcePlacement,
      viewportMargin,
      distanceFromAnchor,
      anchorAlignment,
      windowSize,
    } = props;
    this.state = {
      ...calcOverlayPosition(
        placement,
        1,
        1,
        anchorPosition,
        windowSize,
        distanceFromAnchor,
        forcePlacement,
        viewportMargin,
        anchorAlignment
      ),
      maxWidth: undefined,
      maxHeight: undefined,
      opacity: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      !shallowEqual(this.props.anchorPosition, nextProps.anchorPosition) ||
      !shallowEqual(this.props.windowSize, nextProps.windowSize) ||
      this.props.bounds.width !== nextProps.bounds.width ||
      this.props.bounds.height !== nextProps.bounds.height
    ) {
      if (nextProps.bounds.width) this.updateMeasurements(nextProps);
    }
  }

  updateMeasurements(props = this.props) {
    const {
      placement,
      anchorPosition,
      forcePlacement,
      viewportMargin,
      distanceFromAnchor,
      anchorAlignment,
      bounds,
      windowSize,
    } = props;
    this.setState({
      ...calcOverlayPosition(
        placement,
        bounds.width,
        bounds.height,
        anchorPosition,
        windowSize,
        distanceFromAnchor,
        forcePlacement,
        viewportMargin,
        anchorAlignment
      ),
      opacity: 1,
    });
  }

  render() {
    const {children, measureRef} = this.props;
    const {
      positionLeft: left,
      positionRight: right,
      positionTop: top,
      positionBottom: bottom,
      opacity,
      transformOrigin,
      arrowOffsetLeft,
      arrowOffsetTop,
      placement,
      maxHeight,
      maxWidth,
    } = this.state;
    return children({
      style: {
        left,
        right,
        top,
        bottom,
        maxHeight,
        maxWidth,
        opacity,
        transformOrigin,
        overflow: maxHeight || maxWidth ? "auto" : undefined,
      },
      arrowOffsetLeft,
      arrowOffsetTop,
      placement,
      measureRef,
    });
  }
}

const FitOnScreen = props => (
  <Measure bounds>
    {({measureRef, contentRect: {bounds}}) => (
      <FitOnScreenInner {...props} measureRef={measureRef} bounds={bounds} />
    )}
  </Measure>
);

export default FitOnScreen;
