import React from "react";
import ResizeObserver from "resize-observer-polyfill";
import shallowEqual from "fbjs/lib/shallowEqual";

export default class PausableMeasure extends React.Component {
  node = null;
  state = {bounds: null};

  componentWillMount() {
    if (!this.props.dontMeasure) this.setup();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dontMeasure === this.props.dontMeasure) return;
    if (nextProps.dontMeasure) {
      this.teardown();
      this.setState({bounds: null});
    } else {
      this.setState({bounds: this.setup()});
    }
  }

  componentWillUnmount() {
    if (!this.props.dontMeasure) this.teardown();
  }

  setup() {
    this.resizeObserver = this.resizeObserver || new ResizeObserver(this.onMeasure);
    if (this.node) {
      this.resizeObserver.observe(this.node);
      return this.measure();
    } else {
      return null;
    }
  }

  teardown() {
    this.resizeObserver.disconnect(this.node);
  }

  handleRef = n => {
    const oldNode = this.node;
    this.node = n;
    if (!this.props.dontMeasure) {
      if (oldNode) this.resizeObserver.disconnect(oldNode);
      if (this.node) {
        this.resizeObserver.observe(this.node);
        this.onMeasure();
      }
    }
  };

  onMeasure = () => {
    const newMeasure = this.measure();
    if (shallowEqual(newMeasure, this.state.bounds)) return;
    this.setState({bounds: newMeasure});
  };

  measure() {
    // clone object since getBoundingClientRect returns mutable result
    const {top, bottom, left, right, height, width} = this.node.getBoundingClientRect();
    return {top, bottom, left, right, height, width};
  }

  render() {
    const {children} = this.props;
    const {bounds} = this.state;
    return children({measureRef: this.handleRef, bounds});
  }
}
