import React from "react";
import shallowEqual from "fbjs/lib/shallowEqual";

export default class FormState extends React.Component {
  state = {
    model: this.props.initialModel || {},
    isTouched: false,
  };

  handleChangeField = (name, value) => {
    this.setState({model: {...this.state.model, [name]: value}, isTouched: true});
  };

  handleClear = () => this.setState({model: {}, isTouched: false});

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(nextProps.initialModel, this.props.initialModel) && !this.state.isTouched) {
      this.setState({model: nextProps.initialModel || {}});
    }
  }

  render() {
    const {model} = this.state;
    return this.props.children({
      model,
      changeField: this.handleChangeField,
      clear: this.handleClear,
    });
  }
}
