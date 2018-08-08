import React from "react";

export default class Toggler extends React.Component {
  state = {
    isActive: this.props.defaultActive || false,
  };

  constructor(props) {
    super(props);
    this.handleToggle = e => this.setState({isActive: !this.state.isActive});
    this.handleToggle.on = () => this.setState({isActive: true});
    this.handleToggle.off = () => this.setState({isActive: false});
  }

  render() {
    const {isActive} = this.state;
    return this.props.children(isActive, this.handleToggle);
  }
}
