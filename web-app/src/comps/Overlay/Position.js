import React from "react";
import PausableMeasure from "./PausableMeasure";
import ChainRefs from "../ChainRefs";

function getScrollParent(node) {
  let offsetParent = node;
  // eslint-disable-next-line no-cond-assign
  while ((offsetParent = offsetParent.offsetParent)) {
    const overflowYVal = window.getComputedStyle(offsetParent, null).getPropertyValue("overflow-y");
    if (overflowYVal === "auto" || overflowYVal === "scroll")
      return offsetParent.tagName === "BODY" ? document : offsetParent;
  }
  return document;
}

export default class Position extends React.Component {
  state = {zIndex: 5};

  componentDidMount() {
    if (!this.props.dontMeasure) this.setup();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dontMeasure === this.props.dontMeasure) return;
    if (nextProps.dontMeasure) {
      this.teardown();
    } else {
      this.setup();
    }
  }

  componentWillUnmount() {
    if (!this.props.dontMeasure) this.teardown();
  }

  setup() {
    if (this.scrollPane) {
      this.intervalId = setInterval(this.updatePosition, 1000);
      this.scrollPane.addEventListener("scroll", this.updatePosition);
      window.addEventListener("resize", this.updatePositionAndForceUpdate);
      this.needsToSetup = false;
    } else {
      this.needsToSetup = true;
    }
  }

  teardown() {
    this.needsToSetup = false;
    if (this.scrollPane) {
      clearInterval(this.intervalId);
      this.scrollPane.removeEventListener("scroll", this.updatePosition);
      window.removeEventListener("resize", this.updatePositionAndForceUpdate);
    }
  }

  updatePosition = () => {
    this.instance.onMeasure();
  };

  updatePositionAndForceUpdate = () => {
    this.updatePosition();
    this.forceUpdate();
  };

  handleInnerRef = node => {
    if (node) {
      let currentNode = node;
      let lastZIndex = 0;
      while (currentNode.offsetParent) {
        currentNode = currentNode.offsetParent;
        const zIndexAsString = window.getComputedStyle(currentNode).getPropertyValue("z-index");
        if (zIndexAsString !== "auto") {
          lastZIndex = parseInt(
            window.getComputedStyle(currentNode).getPropertyValue("z-index"),
            10
          );
        }
      }
      if (lastZIndex !== this.state.zIndex) this.setState({zIndex: lastZIndex});
      this.scrollPane = getScrollParent(node);
      if (this.needsToSetup) this.setup();
    }
  };

  handleRef = node => {
    this.instance = node;
  };

  transformDimensions = d =>
    d && {
      ...d,
      top: (d.top || 0) + window.pageYOffset,
      bottom: (d.bottom || 0) + window.pageYOffset,
      left: (d.left || 0) + window.pageXOffset,
      right: (d.right || 0) + window.pageXOffset,
    };

  render() {
    const {zIndex} = this.state;
    const {children, dontMeasure} = this.props;
    return (
      <PausableMeasure dontMeasure={dontMeasure} ref={this.handleRef}>
        {({measureRef, bounds}) => (
          <ChainRefs handlers={[measureRef, this.handleInnerRef]}>
            {ref =>
              children({
                measureRef: ref,
                rect: this.transformDimensions(bounds),
                windowSize: {
                  width: document.documentElement.clientWidth,
                  height: document.documentElement.clientHeight,
                },
                zIndex,
              })
            }
          </ChainRefs>
        )}
      </PausableMeasure>
    );
  }
}
