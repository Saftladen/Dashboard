import React from "react";

export default class ChainRefs extends React.Component {
  handleRef = n => {
    this.props.handlers.forEach(handler => handler(n));
  };

  render() {
    return this.props.children(this.handleRef);
  }
}
